import {
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const customersTable = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone"),
  balanceCents: integer("balance_cents").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const insertCustomerSchema = createInsertSchema(customersTable).omit({
  id: true,
  balanceCents: true,
  createdAt: true,
});
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Customer = typeof customersTable.$inferSelect;

export const ledgerEntryTypeValues = ["charge", "payment"] as const;

export const customerLedgerEntriesTable = pgTable("customer_ledger_entries", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id")
    .notNull()
    .references(() => customersTable.id),
  type: text("type", { enum: ledgerEntryTypeValues }).notNull(),
  amountCents: integer("amount_cents").notNull(),
  note: text("note"),
  saleId: integer("sale_id"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const insertCustomerLedgerEntrySchema = createInsertSchema(
  customerLedgerEntriesTable,
).omit({ id: true, createdAt: true });
export type InsertCustomerLedgerEntry = z.infer<
  typeof insertCustomerLedgerEntrySchema
>;
export type CustomerLedgerEntry = typeof customerLedgerEntriesTable.$inferSelect;
