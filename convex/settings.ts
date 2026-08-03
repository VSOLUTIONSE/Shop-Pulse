import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const settings = await ctx.db.query("settings").first();
    if (!settings) return null;
    return {
      id: 1,
      shopName: settings.shopName,
      ownerLabel: settings.ownerLabel,
      attendantLabel: settings.attendantLabel,
      activeRole: settings.activeRole,
      lowStockThreshold: settings.lowStockThreshold,
      phone: settings.phone ?? null,
      address: settings.address ?? null,
      tinVat: settings.tinVat ?? null,
    };
  },
});

export const update = mutation({
  args: {
    shopName: v.optional(v.string()),
    ownerLabel: v.optional(v.string()),
    attendantLabel: v.optional(v.string()),
    activeRole: v.optional(v.union(v.literal("owner"), v.literal("attendant"))),
    lowStockThreshold: v.optional(v.number()),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    tinVat: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("settings").first();
    if (existing) {
      await ctx.db.patch(existing._id, args);
    } else {
      await ctx.db.insert("settings", {
        shopName: args.shopName ?? "SalesRecord",
        ownerLabel: args.ownerLabel ?? "Owner",
        attendantLabel: args.attendantLabel ?? "Attendant",
        activeRole: args.activeRole ?? "owner",
        lowStockThreshold: args.lowStockThreshold ?? 5,
      });
    }
  },
});
