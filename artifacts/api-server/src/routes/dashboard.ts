import { GetDashboardSummaryResponse } from "@workspace/api-zod";
import {
  categoriesTable,
  customersTable,
  db,
  expensesTable,
  productsTable,
  salesTable,
} from "@workspace/db";
import { and, desc, eq, gt, gte, ne, sql } from "drizzle-orm";
import { Router, type IRouter } from "express";
import { hydrateSale } from "../lib/sales";
import { getActiveSettings, isOwner } from "../lib/settings";

const router: IRouter = Router();

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfMonth() {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

router.get("/dashboard/summary", async (_req, res) => {
  const settings = await getActiveSettings();
  const owner = isOwner(settings);
  const todayStart = startOfToday();
  const monthStart = startOfMonth();

  const todaySales = await db
    .select()
    .from(salesTable)
    .where(and(gte(salesTable.createdAt, todayStart), ne(salesTable.status, "voided")));

  const todayRevenueCents = todaySales.reduce((sum, s) => sum + s.totalCents, 0);

  let todayProfitCents: number | null = null;
  if (owner) {
    const hydratedToday = await Promise.all(todaySales.map((s) => hydrateSale(s.id)));
    const products = await db.select().from(productsTable);
    const costByProductId = new Map(products.map((p) => [p.id, p.costPriceCents]));
    todayProfitCents = hydratedToday.reduce((sum, sale) => {
      if (!sale) return sum;
      const cost = sale.items.reduce(
        (itemSum, item) => itemSum + (costByProductId.get(item.productId) ?? 0) * item.quantity,
        0,
      );
      return sum + sale.totalCents - cost;
    }, 0);
  }

  const debtCustomers = await db
    .select()
    .from(customersTable)
    .where(gt(customersTable.balanceCents, 0));
  const activeDebtAccounts = debtCustomers.length;
  const totalDebtCents = debtCustomers.reduce((sum, c) => sum + c.balanceCents, 0);

  const monthExpenses = await db
    .select()
    .from(expensesTable)
    .where(gte(expensesTable.expenseDate, monthStart.toISOString().slice(0, 10)));
  const monthlyExpensesCents = monthExpenses.reduce((sum, e) => sum + e.amountCents, 0);

  const lowStockRows = await db
    .select({
      id: productsTable.id,
      name: productsTable.name,
      categoryId: productsTable.categoryId,
      categoryName: categoriesTable.name,
      barcode: productsTable.barcode,
      sellingPriceCents: productsTable.sellingPriceCents,
      costPriceCents: productsTable.costPriceCents,
      stockLevel: productsTable.stockLevel,
      lowStockThreshold: productsTable.lowStockThreshold,
      createdAt: productsTable.createdAt,
      updatedAt: productsTable.updatedAt,
    })
    .from(productsTable)
    .innerJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .where(sql`${productsTable.stockLevel} <= ${productsTable.lowStockThreshold}`);

  const lowStockProducts = lowStockRows.map((row) => ({
    ...row,
    isLowStock: true,
    costPriceCents: owner ? row.costPriceCents : null,
  }));

  const recentSaleRows = await db
    .select()
    .from(salesTable)
    .orderBy(desc(salesTable.createdAt))
    .limit(10);
  const recentSales = (await Promise.all(recentSaleRows.map((s) => hydrateSale(s.id)))).filter(
    (s): s is NonNullable<typeof s> => !!s,
  );

  const revenueChart: { date: string; revenueCents: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const day = new Date(todayStart);
    day.setDate(day.getDate() - i);
    const nextDay = new Date(day);
    nextDay.setDate(nextDay.getDate() + 1);
    const daySales = await db
      .select()
      .from(salesTable)
      .where(
        and(
          gte(salesTable.createdAt, day),
          sql`${salesTable.createdAt} < ${nextDay}`,
          ne(salesTable.status, "voided"),
        ),
      );
    revenueChart.push({
      date: day.toISOString().slice(0, 10),
      revenueCents: daySales.reduce((sum, s) => sum + s.totalCents, 0),
    });
  }

  res.json(
    GetDashboardSummaryResponse.parse({
      todayRevenueCents,
      activeDebtAccounts,
      totalDebtCents,
      monthlyExpensesCents,
      todayProfitCents,
      lowStockProducts,
      recentSales,
      revenueChart,
    }),
  );
});

export default router;
