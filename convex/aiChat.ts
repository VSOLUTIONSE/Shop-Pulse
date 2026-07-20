import { v } from "convex/values";
import { query, action, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { getNextId } from "./helpers";

type BusinessData = {
  shopName: string;
  totalSales: number;
  totalRevenue: number;
  totalDiscounts: number;
  lowStockCount: number;
  outOfStockCount: number;
  productCount: number;
  totalCost: number;
  totalCredit: number;
  customerCount: number;
  totalExpenses: number;
  cashSales: number;
  transferSales: number;
  cardSales: number;
  creditSales: number;
  debtors: { name: string; phone: string; balanceCents: number }[];
  lowStockList: { name: string; stockLevel: number; lowStockThreshold: number }[];
  recentExpenses: { category: string; amountCents: number; description: string }[];
  recentSalesData: { id: number; totalCents: number; itemCount: number; customerName: string | null }[];
};

export const list = query({
  args: {},
  handler: async (ctx) => {
    const messages = await ctx.db.query("aiChatMessages").order("asc").collect();
    return messages.map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      model: m.model ?? null,
      tokens: m.tokens ?? null,
      createdAt: new Date(m._creationTime).toISOString(),
    }));
  },
});

export const chat = action({
  args: { message: v.string() },
  handler: async (ctx, args): Promise<{ reply: string; model: string; tokens: number }> => {
    const data = (await ctx.runQuery(
      internal.aiReportsHelpers.getBusinessData
    )) as BusinessData;

    const systemPrompt = `You are SalesPulse AI, a professional business intelligence assistant for "${data.shopName}". Your job is to answer questions about sales performance, inventory, customers, and finances.

Key information about the business:
- Shop Name: ${data.shopName}
- Total Sales: ${data.totalSales} completed sales
- Total Revenue: ₦${(data.totalRevenue / 100).toLocaleString()}
- Products: ${data.productCount} total (${data.lowStockCount} low stock, ${data.outOfStockCount} out of stock)
- Customers: ${data.customerCount} total
- Outstanding Credit: ₦${(data.totalCredit / 100).toLocaleString()}
- Total Expenses: ₦${(data.totalExpenses / 100).toLocaleString()}

Rules:
1. Use clear, professional, simple English. Be direct and concise.
2. Use ₦ for currency (divide cents by 100).
3. Be honest but encouraging.
4. If asked about something outside the available data, say you can only answer based on the business data provided.
5. Structure your response under clear section headers using "--" as separators between sections.
6. Address the user as "Boss" at the start or end of the response.
7. End with an encouraging closing line.

Use this response structure when answering business overview or summary questions:

Business Summary
<2-3 sentence overview of the key point>

--
Financial Performance Breakdown
<bullet points or key metrics>

--
Debt & Outstanding Payments Tracker
<list debtors with amounts>

--
Urgent Restock Alerts
<list low stock items>

--
<encouraging closing line>

Adapt the sections based on what the user asks. Use only relevant sections for their question.`;

    const businessContext = `Current Business Snapshot:
- Revenue: ₦${(data.totalRevenue / 100).toLocaleString()} from ${data.totalSales} sales
- Discounts given: ₦${(data.totalDiscounts / 100).toLocaleString()}
- Cash sales: ₦${(data.cashSales / 100).toLocaleString()}
- Transfer sales: ₦${(data.transferSales / 100).toLocaleString()}
- Card sales: ₦${(data.cardSales / 100).toLocaleString()}
- Credit sales: ₦${(data.creditSales / 100).toLocaleString()}
- Product count: ${data.productCount}
- Low stock items (${data.lowStockCount}): ${data.lowStockList.map(p => `${p.name} (${p.stockLevel} left)`).join(", ")}
- Debtors: ${data.debtors.map(d => `${d.name} (₦${(d.balanceCents / 100).toLocaleString()})`).join(", ")}
- Recent expenses: ${data.recentExpenses.map(e => `${e.category}: ₦${(e.amountCents / 100).toLocaleString()}`).join(", ")}
- Recent sales: ${data.recentSalesData.slice(0, 5).map(s => `#${s.id}: ₦${(s.totalCents / 100).toLocaleString()}`).join(", ")}`;

    const result = await generateText({
      model: google("gemini-3.5-flash"),
      system: systemPrompt,
      prompt: `${businessContext}\n\nUser question: ${args.message}`,
      temperature: 0.7,
      maxOutputTokens: 2048,
    });

    const reply = result.text;
    const model = "gemini-3.5-flash";
    const tokens = result.usage?.totalTokens ?? 0;

    await ctx.runMutation(internal.aiChat.storeMessages, {
      userMessage: args.message,
      assistantReply: reply,
      model,
      tokens,
    });

    return { reply, model, tokens };
  },
});

export const storeMessages = internalMutation({
  args: {
    userMessage: v.string(),
    assistantReply: v.string(),
    model: v.string(),
    tokens: v.number(),
  },
  handler: async (ctx, args) => {
    const userMsgId = await getNextId(ctx, "aiChatMessages");
    await ctx.db.insert("aiChatMessages", {
      id: userMsgId,
      role: "user",
      content: args.userMessage,
      model: args.model,
      tokens: args.tokens,
    });

    const assistantMsgId = await getNextId(ctx, "aiChatMessages");
    await ctx.db.insert("aiChatMessages", {
      id: assistantMsgId,
      role: "assistant",
      content: args.assistantReply,
      model: args.model,
      tokens: args.tokens,
    });
  },
});
