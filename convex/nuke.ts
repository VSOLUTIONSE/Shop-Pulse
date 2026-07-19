import { mutation } from "./_generated/server";

export const nuke = mutation({
  args: {},
  handler: async (ctx) => {
    const tables = [
      "settings",
      "categories",
      "products",
      "customers",
      "customerLedgerEntries",
      "dailySessions",
      "sales",
      "expenses",
      "aiReports",
      "aiChatMessages",
      "stockMovements",
      "counters",
    ] as const;

    for (const table of tables) {
      const docs = await ctx.db.query(table).collect();
      for (const doc of docs) {
        await ctx.db.delete(doc._id);
      }
    }

    return { done: true, message: `Cleared ${tables.length} tables` };
  },
});
