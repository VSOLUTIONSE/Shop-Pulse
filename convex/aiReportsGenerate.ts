import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";

type Debtor = { name: string; phone: string; balanceCents: number };
type LowStockItem = { name: string; stockLevel: number; lowStockThreshold: number };
type RecentExpense = { category: string; amountCents: number; description: string };
type RecentSale = { id: number; totalCents: number; itemCount: number; customerName: string | null };

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
  debtors: Debtor[];
  lowStockList: LowStockItem[];
  recentExpenses: RecentExpense[];
  recentSalesData: RecentSale[];
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

    const systemPrompt = `You are SalesPulse AI, a friendly business intelligence assistant for "${data.shopName}". Your job is to give the business owner (call them "Boss") a quick, smart, conversational update in plain South African English.

Write in a warm, respectful tone like you're chatting with your boss. Start with "Good morning/afternoon" depending on time of day. Use simple terms, not corporate jargon. Be encouraging and solution-oriented.

Structure the report exactly like this with these sections:

**1. Greeting + Business Summary (1-2 paragraphs)**
Greet the Boss by name. Give a plain-language summary of how the shop is doing overall. Mention specific products if data shows trends. Explain any losses or deficits in a positive, reassuring way (e.g. "temporary dip due to necessary investments").

**2. Financial Performance Breakdown**
Use this exact format with the -- separator:
--
Total Sales Revenue: RX *(Total value of goods sold)*
Estimated Cost of Goods Sold (COGS): RX *(What we paid to buy the items sold)*
Gross Profit: RX
Total Recorded Expenses: RX *(Breakdown of top expenses)*
Estimated Net Profit/Loss: RX *(Explain if negative)*
--

**3. Debt & Outstanding Payments Tracker**
List each customer who owes money with their phone number and balance. Use numbered list:
1. Customer Name (Phone)
Balance Owed: RX
*Note:* context if available

Total Outstanding Debt: RX

**4. Urgent Restock Alerts (Low Stock)**
List items running low with current stock and threshold:
- Item Name
*Current Stock:* X units remaining *(Low Stock Level is X)*

**5. Closing**
Encouraging sign-off. Offer to help with specific tasks (e.g. drafting WhatsApp payment reminders).

CRITICAL RULES:
- ALL monetary values in South African Rand (R). NEVER use $.
- Divide cents by 100 to get Rand values.
- Keep it conversational and warm, like a trusted assistant talking to their boss.
- Be optimistic but honest about challenges.`;

    const userPrompt = `Here is the current business data for ${data.shopName} to generate the report:

**Sales:** ${data.totalSales} completed sales | Total revenue: R${(data.totalRevenue / 100).toLocaleString()} | Discounts given: R${(data.totalDiscounts / 100).toLocaleString()}
**Payment methods:** Cash: R${(data.cashSales / 100).toLocaleString()} | Transfer: R${(data.transferSales / 100).toLocaleString()} | Card: R${(data.cardSales / 100).toLocaleString()} | Credit: R${(data.creditSales / 100).toLocaleString()}

**Products:** ${data.productCount} total | Low stock: ${data.lowStockCount} | Out of stock: ${data.outOfStockCount}
**Stock value (cost):** R${(data.totalCost / 100).toLocaleString()}

**Customers:** ${data.customerCount} total | Outstanding credit: R${(data.totalCredit / 100).toLocaleString()}

**Expenses total:** R${(data.totalExpenses / 100).toLocaleString()}

**Debtors (people owing):**
${data.debtors.map((d) => `${d.name} | ${d.phone} | R${(d.balanceCents / 100).toLocaleString()}`).join("\n")}

**Low stock items:**
${data.lowStockList.map((p) => `${p.name} | Stock: ${p.stockLevel} | Threshold: ${p.lowStockThreshold}`).join("\n")}

**Recent expenses:**
${data.recentExpenses.map((e) => `${e.category}: R${(e.amountCents / 100).toLocaleString()} - ${e.description}`).join("\n")}

**Recent sales:**
${data.recentSalesData.map((s) => `Sale #${s.id}: R${(s.totalCents / 100).toLocaleString()} (${s.itemCount} items)${s.customerName ? ` - ${s.customerName}` : ""}`).join("\n")}

Generate the SalesPulse report now in the required format.`;

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
        maxOutputTokens: 4096,
      });

      content = result.text;
      model = "gemini-3.5-flash";
      tokens = result.usage?.totalTokens;
      promptTokens = result.usage?.inputTokens;
      completionTokens = result.usage?.outputTokens;
    } catch (err) {
      console.error("AI generation failed, using fallback:", err);
      content = [
        `Good morning, Boss! ${data.shopName} is here to give you a quick, smart update on how things are going.`,
        ``,
        `**Business Summary**`,
        `We've had ${data.totalSales} completed sales with total revenue of R${(data.totalRevenue / 100).toLocaleString()}. ${data.lowStockCount > 0 ? `${data.lowStockCount} items are running low and need restocking. ` : ""}Outstanding customer credit stands at R${(data.totalCredit / 100).toLocaleString()} across ${data.debtors.length} customers. Total expenses amount to R${(data.totalExpenses / 100).toLocaleString()}. Overall, the business is active and there are clear opportunities to improve cash flow by collecting debts and restocking fast-moving items.`,
        ``,
        `--`,
        `**Financial Performance Breakdown**`,
        `Total Sales Revenue: R${(data.totalRevenue / 100).toLocaleString()}`,
        `Estimated Cost of Goods Sold (COGS): R${(data.totalCost / 100).toLocaleString()}`,
        `Gross Profit: R${((data.totalRevenue - data.totalCost) / 100).toLocaleString()}`,
        `Total Recorded Expenses: R${(data.totalExpenses / 100).toLocaleString()}`,
        `Estimated Net Profit/Loss: R${((data.totalRevenue - data.totalCost - data.totalExpenses) / 100).toLocaleString()}`,
        `--`,
        ``,
        `**Debt & Outstanding Payments Tracker**`,
        ...data.debtors.map((d) => `${d.name} (${d.phone})\nBalance Owed: R${(d.balanceCents / 100).toLocaleString()}`),
        `*Total Outstanding Debt: R${(data.totalCredit / 100).toLocaleString()}*`,
        ``,
        `**Urgent Restock Alerts**`,
        ...data.lowStockList.map((p) => `${p.name}\n*Current Stock:* ${p.stockLevel} units remaining *(Low Stock Level is ${p.lowStockThreshold})*`),
        ``,
        `Let's make today a productive one, Boss! If you need me to draft payment reminders for your debtors, just let me know.`,
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
