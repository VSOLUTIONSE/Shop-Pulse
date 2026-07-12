import { date, integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const expenseCategoryValues = [
  "rent",
  "power",
  "staff",
  "transport",
  "logistics",
  "other",
] as const;

export const expensesTable = pgTable("expenses", {
  id: serial("id").primaryKey(),
  category: text("category", { enum: expenseCategoryValues }).notNull(),
  description: text("description").notNull(),
  amountCents: integer("amount_cents").notNull(),
  expenseDate: date("expense_date", { mode: "string" }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const insertExpenseSchema = createInsertSchema(expensesTable).omit({
  id: true,
  createdAt: true,
});
export type InsertExpense = z.infer<typeof insertExpenseSchema>;
export type Expense = typeof expensesTable.$inferSelect;
