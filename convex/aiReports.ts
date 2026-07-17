import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getNextId } from "./helpers";
import { generateText } from "ai";
import { xai } from "@ai-sdk/xai";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const reports = await ctx.db.query("aiReports").order("desc").collect();
    return reports.map((r) => ({
      id: r.id,
      title: r.title ?? null,
      content: r.content,
      type: r.type ?? null,
      model: r.model ?? null,
      tokens: r.tokens ?? null,
      promptTokens: r.promptTokens ?? null,
      completionTokens: r.completionTokens ?? null,
      createdAt: new Date(r._creationTime).toISOString(),
    }));
  },
});

export const generate = mutation({
  args: {},
  handler: async (ctx) => {
    const sales = await ctx.db.query("sales").collect();
    const products = await ctx.db.query("products").collect();
    const customers = await ctx.db.query("customers").collect();
    const expenses = await ctx.db.query("expenses").collect();
    const settings = await ctx.db.query("settings").first();

    const completedSales = sales.filter((s) => s.status === "completed");
    const totalSales = completedSales.length;
    const totalRevenue = completedSales.reduce((sum, s) => sum + s.totalCents, 0);
    const totalDiscounts = completedSales.reduce((sum, s) => sum + s.discountCents, 0);
    const lowStockItems = products.filter((p) => p.stockLevel <= p.lowStockThreshold);
    const outOfStock = products.filter((p) => p.stockLevel === 0);
    const totalCredit = customers.reduce((sum, c) => sum + c.balanceCents, 0);
    const totalCost = products.reduce((sum, p) => sum + (p.costPriceCents ?? 0) * p.stockLevel, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amountCents, 0);

    const cashSales = completedSales
      .filter((s) => s.payments.some((p) => p.method === "cash"))
      .reduce((sum, s) => sum + s.totalCents, 0);
    const transferSales = completedSales
      .filter((s) => s.payments.some((p) => p.method === "transfer"))
      .reduce((sum, s) => sum + s.totalCents, 0);
    const cardSales = completedSales
      .filter((s) => s.payments.some((p) => p.method === "card"))
      .reduce((sum, s) => sum + s.totalCents, 0);
    const creditSales = completedSales
      .filter((s) => s.payments.some((p) => p.method === "credit"))
      .reduce((sum, s) => sum + s.totalCents, 0);

    const shopName = settings?.shopName ?? "My Shop";

    const systemPrompt = `You are an expert business analyst for a retail shop called "${shopName}". 
Generate a comprehensive, insightful business analysis report in markdown format. 
Use clear section headings (##), bullet points, and bold for key metrics. 
Be specific with numbers and provide actionable insights. 
Include these sections:
1. Executive Summary - top-level overview of business health
2. Sales Performance - revenue, transaction count, average order value, payment method breakdown
3. Inventory Analysis - stock health, low stock alerts, cost of inventory on hand
4. Accounts Receivable - outstanding credit, credit customer count
5. Expense Overview - total expenses vs revenue
6. Strategic Recommendations - 3-5 actionable recommendations based on the data

Keep the tone professional and data-driven. Use the local currency format (divide by 100 for cents).`;

    const userPrompt = `Here is the current business data for ${shopName}:

**Sales Data:**
- Total completed sales: ${totalSales}
- Total revenue: ${(totalRevenue / 100).toLocaleString()}
- Total discounts given: ${(totalDiscounts / 100).toLocaleString()}
- Average order value: ${totalSales > 0 ? ((totalRevenue / totalSales) / 100).toLocaleString() : 0}
- Cash payments: ${(cashSales / 100).toLocaleString()}
- Transfer payments: ${(transferSales / 100).toLocaleString()}
- Card payments: ${(cardSales / 100).toLocaleString()}
- Credit payments: ${(creditSales / 100).toLocaleString()}

**Inventory Data:**
- Total products: ${products.length}
- Total stock value (at cost): ${(totalCost / 100).toLocaleString()}
- Low stock items: ${lowStockItems.length} (out of ${products.length} products)
- Out of stock items: ${outOfStock.length}
- Stock health: ${products.length > 0 ? Math.round(((products.length - lowStockItems.length) / products.length) * 100) : 0}%

**Customer Data:**
- Total customers: ${customers.length}
- Outstanding credit: ${(totalCredit / 100).toLocaleString()}

**Expense Data:**
- Total expenses: ${(totalExpenses / 100).toLocaleString()}
- Revenue-to-expense ratio: ${totalExpenses > 0 ? (totalRevenue / totalExpenses).toFixed(2) : "N/A"}

Generate the analysis report now.`;

    let content: string;
    let title: string;
    let model = "grok-2";
    let tokens: number | undefined;
    let promptTokens: number | undefined;
    let completionTokens: number | undefined;

    try {
      const result = await generateText({
        model: xai("grok-2"),
        system: systemPrompt,
        prompt: userPrompt,
        temperature: 0.7,
        maxTokens: 2048,
      });

      content = result.text;
      model = "grok-2";
      tokens = result.usage?.totalTokens;
      promptTokens = result.usage?.promptTokens;
      completionTokens = result.usage?.completionTokens;
    } catch (err) {
      console.error("AI generation failed, using fallback:", err);
      content = [
        `📊 **${shopName} - Business Analysis Report**`,
        ``,
        `**Sales Overview:**`,
        `- Total completed sales: ${totalSales}`,
        `- Total revenue: ${(totalRevenue / 100).toLocaleString()}`,
        `- Average sale value: ${totalSales > 0 ? ((totalRevenue / totalSales) / 100).toLocaleString() : 0}`,
        ``,
        `**Inventory:**`,
        `- Total products: ${products.length}`,
        `- Low stock items: ${lowStockItems.length}`,
        `- Stock health: ${products.length > 0 ? Math.round(((products.length - lowStockItems.length) / products.length) * 100) : 0}%`,
        ``,
        `**Credit:**`,
        `- Outstanding credit: ${(totalCredit / 100).toLocaleString()}`,
        `- Credit customers: ${customers.length}`,
        ``,
        `_AI analysis was unavailable. Showing computed metrics instead._`,
      ].join("\n");
    }

    const firstLine = content.replace(/^#+\s*/, "").split("\n")[0];
    title = firstLine && firstLine.length < 80 ? firstLine : `${shopName} Business Report`;

    const id = await getNextId(ctx, "aiReports");
    await ctx.db.insert("aiReports", {
      id,
      title,
      content,
      type: "insight",
      model,
      tokens,
      promptTokens,
      completionTokens,
    });

    return {
      id,
      title,
      content,
      type: "insight",
      model,
      tokens,
      promptTokens,
      completionTokens,
    };
  },
});
