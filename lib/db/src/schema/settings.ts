import { integer, pgTable, serial, text } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const roleEnumValues = ["owner", "attendant"] as const;

export const settingsTable = pgTable("settings", {
  id: serial("id").primaryKey(),
  shopName: text("shop_name").notNull().default("My Shop"),
  ownerLabel: text("owner_label").notNull().default("Owner"),
  attendantLabel: text("attendant_label").notNull().default("Attendant"),
  activeRole: text("active_role", { enum: roleEnumValues })
    .notNull()
    .default("owner"),
  lowStockThreshold: integer("low_stock_threshold").notNull().default(5),
});

export const insertSettingsSchema = createInsertSchema(settingsTable).omit({
  id: true,
});
export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type Settings = typeof settingsTable.$inferSelect;
