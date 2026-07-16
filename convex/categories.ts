import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getNextId } from "./helpers";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const categories = await ctx.db.query("categories").order("asc").collect();
    return categories.map((c) => ({ id: c.id, name: c.name }));
  },
});

export const create = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const id = await getNextId(ctx, "categories");
    await ctx.db.insert("categories", { id, name: args.name });
    return { id, name: args.name };
  },
});

export const remove = mutation({
  args: { id: v.number() },
  handler: async (ctx, args) => {
    const doc = await ctx.db
      .query("categories")
      .withIndex("by_id_idx", (q) => q.eq("id", args.id))
      .first();
    if (doc) {
      await ctx.db.delete(doc._id);
    }
  },
});
