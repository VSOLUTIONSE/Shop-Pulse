import { query } from "./_generated/server";

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
