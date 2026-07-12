import {
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { customersTable } from "./customers";
import { productsTable } from "./products";
import { roleEnumValues } from "./settings";

export const saleStatusValues = ["completed", "voided"] as const;
export const paymentMethodValues = [
  "cash",
  "transfer",
  "card",
  "credit",
] as const;

export const salesTable = pgTable("sales", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  operatorRole: text("operator_role", { enum: roleEnumValues }).notNull(),
  status: text("status", { enum: saleStatusValues })
    .notNull()
    .default("completed"),
  subtotalCents: integer("subtotal_cents").notNull(),
  discountCents: integer("discount_cents").notNull().default(0),
  totalCents: integer("total_cents").notNull(),
  customerId: integer("customer_id").references(() => customersTable.id),
  voidReason: text("void_reason"),
  voidedAt: timestamp("voided_at", { withTimezone: true }),
});

export const insertSaleSchema = createInsertSchema(salesTable).omit({
  id: true,
  createdAt: true,
});
export type InsertSale = z.infer<typeof insertSaleSchema>;
export type Sale = typeof salesTable.$inferSelect;

export const saleItemsTable = pgTable("sale_items", {
  id: serial("id").primaryKey(),
  saleId: integer("sale_id")
    .notNull()
    .references(() => salesTable.id),
  productId: integer("product_id")
    .notNull()
    .references(() => productsTable.id),
  productName: text("product_name").notNull(),
  quantity: integer("quantity").notNull(),
  unitPriceCents: integer("unit_price_cents").notNull(),
  lineTotalCents: integer("line_total_cents").notNull(),
});

export const insertSaleItemSchema = createInsertSchema(saleItemsTable).omit({
  id: true,
});
export type InsertSaleItem = z.infer<typeof insertSaleItemSchema>;
export type SaleItem = typeof saleItemsTable.$inferSelect;

export const salePaymentsTable = pgTable("sale_payments", {
  id: serial("id").primaryKey(),
  saleId: integer("sale_id")
    .notNull()
    .references(() => salesTable.id),
  method: text("method", { enum: paymentMethodValues }).notNull(),
  amountCents: integer("amount_cents").notNull(),
});

export const insertSalePaymentSchema = createInsertSchema(
  salePaymentsTable,
).omit({ id: true });
export type InsertSalePayment = z.infer<typeof insertSalePaymentSchema>;
export type SalePayment = typeof salePaymentsTable.$inferSelect;
