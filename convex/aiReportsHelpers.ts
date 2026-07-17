import { v } from "convex/values";
import { internalQuery, internalMutation } from "./_generated/server";
import { getNextId } from "./helpers";

export const getBusinessData = internalQuery({
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

    return {
      shopName, totalSales, totalRevenue, totalDiscounts,
      lowStockCount: lowStockItems.length,
      outOfStockCount: outOfStock.length,
      productCount: products.length,
      totalCost, totalCredit, customerCount: customers.length,
      totalExpenses, cashSales, transferSales, cardSales, creditSales,
    };
  },
});

export const storeReport = internalMutation({
  args: {
    title: v.string(),
    content: v.string(),
    type: v.string(),
    model: v.string(),
    tokens: v.optional(v.number()),
    promptTokens: v.optional(v.number()),
    completionTokens: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const id = await getNextId(ctx, "aiReports");
    await ctx.db.insert("aiReports", {
      id,
      title: args.title,
      content: args.content,
      type: args.type,
      model: args.model,
      tokens: args.tokens,
      promptTokens: args.promptTokens,
      completionTokens: args.completionTokens,
    });
    return {
      id,
      title: args.title,
      content: args.content,
      type: args.type,
      model: args.model,
      tokens: args.tokens,
      promptTokens: args.promptTokens,
      completionTokens: args.completionTokens,
    };
  },
});
