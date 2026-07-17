import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";

// Explicit type to break circular inference: action() → internal → typeof this module → action()
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
};

type ReportResult = {
  id: number;
  title: string;
  content: string;
  type: string;
  model: string;
  tokens?: number;
  promptTokens?: number;
  completionTokens?: number;
};

export const generate = action({
  args: {},
  handler: async (ctx): Promise<ReportResult> => {
    const data = (await ctx.runQuery(
      internal.aiReportsHelpers.getBusinessData
    )) as BusinessData;

    const systemPrompt = `You are an expert business analyst for a retail shop called "${data.shopName}" in Nigeria.
Generate a comprehensive, insightful business analysis report in markdown format.
Use clear section headings (##), bullet points, and bold for key metrics.
Be specific with numbers and provide actionable insights.
Include these sections:
1. Executive Summary - top-level overview of business health
2. Sales Performance - revenue, transaction count, average order value, payment method breakdown
3. Inventory Analysis - stock health, low stock alerts, cost of inventory on hand
4. Accounts Receivable - outstanding credit, credit customer count
5. Expense Overview - total expenses vs revenue
6. Strategic Recommendations - 3-5 actionable recommendations based on the data

CRITICAL: This is a Nigerian business. ALL monetary values MUST use Nigerian Naira (₦). NEVER use dollar signs ($) or any other currency. Format as ₦X,XXX.XX. The data is in cents, so divide by 100. This is the most important rule - every single amount must be shown in Naira.`;

    const userPrompt: string = `Here is the current business data for ${data.shopName}:

**Sales Data:**
- Total completed sales: ${data.totalSales}
- Total revenue: ₦${(data.totalRevenue / 100).toLocaleString()}
- Total discounts given: ₦${(data.totalDiscounts / 100).toLocaleString()}
- Average order value: ₦${data.totalSales > 0 ? ((data.totalRevenue / data.totalSales) / 100).toLocaleString() : 0}
- Cash payments: ₦${(data.cashSales / 100).toLocaleString()}
- Transfer payments: ₦${(data.transferSales / 100).toLocaleString()}
- Card payments: ₦${(data.cardSales / 100).toLocaleString()}
- Credit payments: ₦${(data.creditSales / 100).toLocaleString()}

**Inventory Data:**
- Total products: ${data.productCount}
- Total stock value (at cost): ₦${(data.totalCost / 100).toLocaleString()}
- Low stock items: ${data.lowStockCount} (out of ${data.productCount} products)
- Out of stock items: ${data.outOfStockCount}
- Stock health: ${data.productCount > 0 ? Math.round(((data.productCount - data.lowStockCount) / data.productCount) * 100) : 0}%

**Customer Data:**
- Total customers: ${data.customerCount}
- Outstanding credit: ₦${(data.totalCredit / 100).toLocaleString()}

**Expense Data:**
- Total expenses: ₦${(data.totalExpenses / 100).toLocaleString()}
- Revenue-to-expense ratio: ${data.totalExpenses > 0 ? (data.totalRevenue / data.totalExpenses).toFixed(2) : "N/A"}

Generate the analysis report now.`;

    let content: string;
    let title: string;
    let model = "gemini-3.5-flash";
    let tokens: number | undefined;
    let promptTokens: number | undefined;
    let completionTokens: number | undefined;

    try {
      const result = await generateText({
        model: google("gemini-3.5-flash"),
        system: systemPrompt,
        prompt: userPrompt,
        temperature: 0.7,
        maxOutputTokens: 2048,
      });

      content = result.text;
      model = "gemini-3.5-flash";
      tokens = result.usage?.totalTokens;
      promptTokens = result.usage?.inputTokens;
      completionTokens = result.usage?.outputTokens;
    } catch (err) {
      console.error("AI generation failed, using fallback:", err);
      content = [
        `📊 **${data.shopName} - Business Analysis Report**`,
        ``,
        `**Sales Overview:**`,
        `- Total completed sales: ${data.totalSales}`,
        `- Total revenue: ₦${(data.totalRevenue / 100).toLocaleString()}`,
        `- Average sale value: ₦${data.totalSales > 0 ? ((data.totalRevenue / data.totalSales) / 100).toLocaleString() : 0}`,
        ``,
        `**Inventory:**`,
        `- Total products: ${data.productCount}`,
        `- Low stock items: ${data.lowStockCount}`,
        `- Stock health: ${data.productCount > 0 ? Math.round(((data.productCount - data.lowStockCount) / data.productCount) * 100) : 0}%`,
        ``,
        `**Credit:**`,
        `- Outstanding credit: ₦${(data.totalCredit / 100).toLocaleString()}`,
        `- Credit customers: ${data.customerCount}`,
        ``,
        `_AI analysis was unavailable. Showing computed metrics instead._`,
      ].join("\n");
    }

    const firstLine = content.replace(/^#+\s*/, "").split("\n")[0];
    title = firstLine && firstLine.length < 80 ? firstLine : `${data.shopName} Business Report`;

    return (await ctx.runMutation(internal.aiReportsHelpers.storeReport, {
      title,
      content,
      type: "insight",
      model,
      tokens: tokens ?? undefined,
      promptTokens: promptTokens ?? undefined,
      completionTokens: completionTokens ?? undefined,
    })) as ReportResult;
  },
});
