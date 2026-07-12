import {
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { categoriesTable } from "./categories";

export const productsTable = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  categoryId: integer("category_id")
    .notNull()
    .references(() => categoriesTable.id),
  barcode: text("barcode"),
  sellingPriceCents: integer("selling_price_cents").notNull(),
  costPriceCents: integer("cost_price_cents").notNull(),
  stockLevel: integer("stock_level").notNull().default(0),
  lowStockThreshold: integer("low_stock_threshold").notNull().default(5),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const insertProductSchema = createInsertSchema(productsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof productsTable.$inferSelect;

export const stockMovementTypeValues = [
  "sale",
  "void",
  "restock",
  "correction",
] as const;

export const stockMovementsTable = pgTable("stock_movements", {
  id: serial("id").primaryKey(),
  productId: integer("product_id")
    .notNull()
    .references(() => productsTable.id),
  type: text("type", { enum: stockMovementTypeValues }).notNull(),
  quantityChange: integer("quantity_change").notNull(),
  reason: text("reason"),
  referenceSaleId: integer("reference_sale_id"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const insertStockMovementSchema = createInsertSchema(
  stockMovementsTable,
).omit({ id: true, createdAt: true });
export type InsertStockMovement = z.infer<typeof insertStockMovementSchema>;
export type StockMovement = typeof stockMovementsTable.$inferSelect;
