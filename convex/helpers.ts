import { v } from "convex/values";
import type { MutationCtx, QueryCtx } from "./_generated/server";

export async function getNextId(ctx: MutationCtx, tableName: string): Promise<number> {
  const counter = await ctx.db
    .query("counters")
    .withIndex("by_name_idx", (q) => q.eq("name", tableName))
    .unique();
  if (!counter) {
    await ctx.db.insert("counters", { name: tableName, value: 2 });
    return 1;
  }
  const newValue = counter.value + 1;
  await ctx.db.patch(counter._id, { value: newValue });
  return newValue;
}

export async function getSettingsDoc(ctx: QueryCtx | MutationCtx) {
  const settings = await ctx.db.query("settings").first();
  return settings;
}
