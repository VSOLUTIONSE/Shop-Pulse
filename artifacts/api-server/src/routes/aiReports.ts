import { GenerateAiReportResponse, ListAiReportsResponse } from "@workspace/api-zod";
import {
  aiReportsTable,
  customersTable,
  db,
  expensesTable,
  productsTable,
  salesTable,
} from "@workspace/db";
import { desc, gt, gte, ne } from "drizzle-orm";
import { Router, type IRouter } from "express";
import { generateGeminiText } from "../lib/gemini";
import { hydrateSale } from "../lib/sales";
import { getActiveSettings, isOwner } from "../lib/settings";

const router: IRouter = Router();

router.get("/ai-reports", async (_req, res) => {
  const settings = await getActiveSettings();
  if (!isOwner(settings)) {
    res.status(403).json({ message: "AI Business Reports are owner-only" });
    return;
  }
  const reports = await db.select().from(aiReportsTable).orderBy(desc(aiReportsTable.createdAt));
  res.json(ListAiReportsResponse.parse(reports));
});

router.post("/ai-reports/generate", async (_req, res) => {
  const settings = await getActiveSettings();
  if (!isOwner(settings)) {
    res.status(403).json({ message: "AI Business Reports are owner-only" });
    return;
  }

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const [recentSaleRows, products, debtCustomers, monthExpenses] = await Promise.all([
    db.select().from(salesTable).where(gte(salesTable.createdAt, weekAgo)),
    db.select().from(productsTable),
    db.select().from(customersTable).where(gt(customersTable.balanceCents, 0)),
    db.select().from(expensesTable),
  ]);

  const hydratedSales = (
    await Promise.all(recentSaleRows.map((s) => hydrateSale(s.id)))
  ).filter((s): s is NonNullable<typeof s> => !!s);

  const completedSales = hydratedSales.filter((s) => s.status === "completed");
  const revenueCents = completedSales.reduce((sum, s) => sum + s.totalCents, 0);
  const voidedCount = hydratedSales.filter((s) => s.status === "voided").length;

  const categoryVelocity = new Map<number, number>();
  for (const sale of completedSales) {
    for (const item of sale.items) {
      categoryVelocity.set(item.productId, (categoryVelocity.get(item.productId) ?? 0) + item.quantity);
    }
  }
  const topProducts = [...categoryVelocity.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([productId, qty]) => {
      const product = products.find((p) => p.id === productId);
      return { name: product?.name ?? `Product ${productId}`, unitsSold: qty };
    });

  const lowStock = products.filter((p) => p.stockLevel <= p.lowStockThreshold);
  const expensesCents = monthExpenses.reduce((sum, e) => sum + e.amountCents, 0);

  // Telemetry is aggregated and anonymized — no customer names, phone numbers,
  // or individual transaction identifiers are sent to the AI provider.
  const telemetry = {
    periodDays: 7,
    revenueCents,
    completedSaleCount: completedSales.length,
    voidedSaleCount: voidedCount,
    topSellingProducts: topProducts,
    lowStockProductCount: lowStock.length,
    activeDebtAccountCount: debtCustomers.length,
    totalOutstandingDebtCents: debtCustomers.reduce((sum, c) => sum + c.balanceCents, 0),
    totalExpensesCents: expensesCents,
    expenseRatioOfRevenue: revenueCents > 0 ? expensesCents / revenueCents : null,
  };

  const prompt = `You are a business analyst for a small retail shop called "${settings.shopName}". Based on this anonymized 7-day telemetry snapshot (all money values are in cents), write a concise, plain-language business report for the shop owner. Highlight what's working, what needs attention (e.g. low stock, high expense ratio, rising debt), and give 2-3 specific, actionable recommendations. Keep it under 300 words, no markdown headers, just clear prose paragraphs.\n\nTelemetry:\n${JSON.stringify(telemetry, null, 2)}`;

  const content = await generateGeminiText(prompt);

  const [report] = await db.insert(aiReportsTable).values({ content }).returning();
  res.status(201).json(GenerateAiReportResponse.parse(report));
});

export default router;
