import { query } from "./_generated/server";

export const getSummary = query({
  args: {},
  handler: async (ctx) => {
    const sales = await ctx.db.query("sales").collect();
    const products = await ctx.db.query("products").collect();
    const customers = await ctx.db.query("customers").collect();
    const expenses = await ctx.db.query("expenses").collect();
    const categories = await ctx.db.query("categories").collect();
    const catMap = new Map(categories.map((c) => [c.id, c.name]));

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const todayEnd = todayStart + 86400000;

    const todaySales = sales.filter((s) => {
      const t = s._creationTime;
      return t >= todayStart && t < todayEnd;
    });

    const todayRevenueCents = todaySales
      .filter((s) => s.status === "completed")
      .reduce((sum, s) => sum + s.totalCents, 0);

    const todayProfitCents = todaySales
      .filter((s) => s.status === "completed")
      .reduce((sum, s) => {
        const cost = s.items.reduce((c, item) => {
          const product = products.find((p) => p.id === item.productId);
          return c + (product?.costPriceCents ?? 0) * item.quantity;
        }, 0);
        return sum + s.totalCents - cost;
      }, 0);

    const activeDebtAccounts = customers.filter((c) => c.balanceCents > 0).length;
    const totalDebtCents = customers.reduce((sum, c) => sum + c.balanceCents, 0);

    const monthlyExpensesCents = expenses
      .filter((e) => {
        const d = new Date(e._creationTime);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((sum, e) => sum + e.amountCents, 0);

    const lowStockProducts = products
      .filter((p) => p.stockLevel <= p.lowStockThreshold)
      .slice(0, 10)
      .map((p) => ({
        id: p.id,
        name: p.name,
        categoryId: p.categoryId,
        categoryName: catMap.get(p.categoryId) ?? "",
        barcode: p.barcode ?? null,
        sellingPriceCents: p.sellingPriceCents,
        costPriceCents: p.costPriceCents ?? null,
        stockLevel: p.stockLevel,
        lowStockThreshold: p.lowStockThreshold,
        isLowStock: true,
        createdAt: new Date(p._creationTime).toISOString(),
        updatedAt: new Date(p._creationTime).toISOString(),
      }));

    const recentSales = [...sales]
      .sort((a, b) => b._creationTime - a._creationTime)
      .slice(0, 10)
      .map((s) => ({
        id: s.id,
        createdAt: new Date(s._creationTime).toISOString(),
        operatorRole: s.operatorRole,
        status: s.status,
        items: s.items.map((item, i) => ({
          id: i + 1,
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          unitPriceCents: item.unitPriceCents,
          lineTotalCents: item.lineTotalCents,
        })),
        payments: s.payments.map((p, i) => ({
          id: i + 1,
          method: p.method,
          amountCents: p.amountCents,
        })),
        subtotalCents: s.subtotalCents,
        discountCents: s.discountCents,
        totalCents: s.totalCents,
        customerId: s.customerId ?? null,
        customerName: s.customerName ?? null,
        voidReason: s.voidReason ?? null,
        voidedAt: s.voidedAt ? new Date(s.voidedAt).toISOString() : null,
      }));

    const days: RevenuePoint[] = [];
    for (let i = 6; i >= 0; i--) {
      const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const dayStart = day.getTime();
      const dayEnd = dayStart + 86400000;
      const daySales = sales.filter(
        (s) => s._creationTime >= dayStart && s._creationTime < dayEnd && s.status === "completed"
      );
      const revenue = daySales.reduce((sum, s) => sum + s.totalCents, 0);
      days.push({
        date: day.toISOString().split("T")[0],
        revenueCents: revenue,
      });
    }

    const settings = await ctx.db.query("settings").first();
    const isAttendant = settings?.activeRole === "attendant";

    return {
      todayRevenueCents,
      activeDebtAccounts,
      totalDebtCents,
      monthlyExpensesCents,
      todayProfitCents: isAttendant ? null : todayProfitCents,
      lowStockProducts,
      recentSales,
      revenueChart: days,
    };
  },
});

interface RevenuePoint {
  date: string;
  revenueCents: number;
}
