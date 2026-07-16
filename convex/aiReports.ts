import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getNextId } from "./helpers";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const reports = await ctx.db.query("aiReports").order("desc").collect();
    return reports.map((r) => ({
      id: r.id,
      content: r.content,
      type: r.type ?? null,
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

    const totalSales = sales.filter((s) => s.status === "completed").length;
    const totalRevenue = sales
      .filter((s) => s.status === "completed")
      .reduce((sum, s) => sum + s.totalCents, 0);
    const totalProducts = products.length;
    const lowStockItems = products.filter((p) => p.stockLevel <= p.lowStockThreshold).length;
    const totalCredit = customers.reduce((sum, c) => sum + c.balanceCents, 0);

    const content = [
      `📊 **SalesPulse AI Report**`,
      ``,
      `**Sales Overview:**`,
      `- Total completed sales: ${totalSales}`,
      `- Total revenue: ${(totalRevenue / 100).toLocaleString()} currency units`,
      `- Average sale value: ${totalSales > 0 ? ((totalRevenue / totalSales) / 100).toLocaleString() : 0} currency units`,
      ``,
      `**Inventory:**`,
      `- Total products: ${totalProducts}`,
      `- Low stock items: ${lowStockItems}`,
      `- Stock health: ${totalProducts > 0 ? Math.round(((totalProducts - lowStockItems) / totalProducts) * 100) : 0}%`,
      ``,
      `**Credit:**`,
      `- Outstanding credit: ${(totalCredit / 100).toLocaleString()} currency units`,
      `- Credit customers: ${customers.length}`,
    ].join("\n");

    const id = await getNextId(ctx, "aiReports");
    await ctx.db.insert("aiReports", { id, content, type: "insight" });
    return { id, content, type: "insight" };
  },
});
