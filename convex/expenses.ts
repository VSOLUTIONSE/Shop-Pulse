import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getNextId } from "./helpers";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const expenses = await ctx.db.query("expenses").order("desc").collect();
    return expenses.map((e) => ({
      id: e.id,
      category: e.category,
      description: e.description,
      amountCents: e.amountCents,
      expenseDate: e.expenseDate,
      createdAt: new Date(e._creationTime).toISOString(),
    }));
  },
});

export const create = mutation({
  args: {
    category: v.union(v.literal("rent"), v.literal("power"), v.literal("staff"), v.literal("transport"), v.literal("logistics"), v.literal("other")),
    description: v.string(),
    amountCents: v.number(),
    expenseDate: v.string(),
  },
  handler: async (ctx, args) => {
    const id = await getNextId(ctx, "expenses");
    await ctx.db.insert("expenses", {
      id,
      category: args.category,
      description: args.description,
      amountCents: args.amountCents,
      expenseDate: args.expenseDate,
    });
    return { id };
  },
});

export const remove = mutation({
  args: { id: v.number() },
  handler: async (ctx, args) => {
    const doc = await ctx.db
      .query("expenses")
      .withIndex("by_id_idx", (q) => q.eq("id", args.id))
      .first();
    if (doc) {
      await ctx.db.delete(doc._id);
    }
  },
});
