import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const aiReportsTable = pgTable("ai_reports", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const insertAiReportSchema = createInsertSchema(aiReportsTable).omit({
  id: true,
  createdAt: true,
});
export type InsertAiReport = z.infer<typeof insertAiReportSchema>;
export type AiReport = typeof aiReportsTable.$inferSelect;
