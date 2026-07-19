import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getNextId } from "./helpers";

export const getToday = query({
  handler: async (ctx) => {
    const today = new Date().toISOString().slice(0, 10);
    const session = await ctx.db
      .query("dailySessions")
      .withIndex("by_date", (q) => q.eq("date", today))
      .first();
    if (!session) return null;

    const sales = await ctx.db
      .query("sales")
      .withIndex("by_sessionId_idx", (q) => q.eq("sessionId", session.id))
      .collect();

    const totalSalesCents = sales.reduce((sum, s) => sum + s.totalCents, 0);
    const totalCostCents = sales.reduce((sum, s) =>
      sum + s.items.reduce((si, item) => si + (item.costPriceCents ?? 0) * item.quantity, 0)
    , 0);
    const saleCount = sales.length;
    const cashTotal = sales.reduce((sum, s) => sum + s.payments.filter(p => p.method === 'cash').reduce((ps, p) => ps + p.amountCents, 0), 0);
    const transferTotal = sales.reduce((sum, s) => sum + s.payments.filter(p => p.method === 'transfer').reduce((ps, p) => ps + p.amountCents, 0), 0);
    const cardTotal = sales.reduce((sum, s) => sum + s.payments.filter(p => p.method === 'card').reduce((ps, p) => ps + p.amountCents, 0), 0);
    const creditTotal = sales.reduce((sum, s) => sum + s.payments.filter(p => p.method === 'credit').reduce((ps, p) => ps + p.amountCents, 0), 0);

    return {
      ...session,
      totalSalesCents,
      totalCostCents,
      totalProfitCents: totalSalesCents - totalCostCents,
      saleCount,
      cashTotal,
      transferTotal,
      cardTotal,
      creditTotal,
    };
  },
});

export const open = mutation({
  handler: async (ctx) => {
    const today = new Date().toISOString().slice(0, 10);
    const existing = await ctx.db
      .query("dailySessions")
      .withIndex("by_date", (q) => q.eq("date", today))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        status: "open",
        closedAt: undefined,
        openedAt: Date.now(),
      });
      return { id: existing.id };
    }

    const id = await getNextId(ctx, "dailySessions");
    await ctx.db.insert("dailySessions", {
      id,
      date: today,
      status: "open",
      openedAt: Date.now(),
      totalSalesCents: 0,
      totalCostCents: 0,
      totalProfitCents: 0,
      saleCount: 0,
      cashTotal: 0,
      transferTotal: 0,
      cardTotal: 0,
      creditTotal: 0,
    });
    return { id };
  },
});

export const close = mutation({
  handler: async (ctx) => {
    const today = new Date().toISOString().slice(0, 10);
    const session = await ctx.db
      .query("dailySessions")
      .withIndex("by_date", (q) => q.eq("date", today))
      .first();
    if (!session) throw new Error("No session open today");
    if (session.status === "closed") throw new Error("Session already closed");

    const sales = await ctx.db
      .query("sales")
      .withIndex("by_sessionId_idx", (q) => q.eq("sessionId", session.id))
      .collect();

    const totalSalesCents = sales.reduce((sum, s) => sum + s.totalCents, 0);
    const totalCostCents = sales.reduce((sum, s) =>
      sum + s.items.reduce((si, item) => si + (item.costPriceCents ?? 0) * item.quantity, 0)
    , 0);
    const saleCount = sales.length;
    const cashTotal = sales.reduce((sum, s) => sum + s.payments.filter(p => p.method === 'cash').reduce((ps, p) => ps + p.amountCents, 0), 0);
    const transferTotal = sales.reduce((sum, s) => sum + s.payments.filter(p => p.method === 'transfer').reduce((ps, p) => ps + p.amountCents, 0), 0);
    const cardTotal = sales.reduce((sum, s) => sum + s.payments.filter(p => p.method === 'card').reduce((ps, p) => ps + p.amountCents, 0), 0);
    const creditTotal = sales.reduce((sum, s) => sum + s.payments.filter(p => p.method === 'credit').reduce((ps, p) => ps + p.amountCents, 0), 0);

    await ctx.db.patch(session._id, {
      status: "closed",
      closedAt: Date.now(),
      totalSalesCents,
      totalCostCents,
      totalProfitCents: totalSalesCents - totalCostCents,
      saleCount,
      cashTotal,
      transferTotal,
      cardTotal,
      creditTotal,
    });
  },
});

export const list = query({
  handler: async (ctx) => {
    const sessions = await ctx.db
      .query("dailySessions")
      .order("desc")
      .collect();
    return sessions.map((s) => ({
      id: s.id,
      date: s.date,
      status: s.status,
      openedAt: s.openedAt,
      closedAt: s.closedAt ?? null,
      totalSalesCents: s.totalSalesCents,
      totalCostCents: s.totalCostCents,
      totalProfitCents: s.totalProfitCents,
      saleCount: s.saleCount,
    }));
  },
});
