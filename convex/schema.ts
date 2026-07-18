import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  settings: defineTable({
    shopName: v.string(),
    ownerLabel: v.string(),
    attendantLabel: v.string(),
    activeRole: v.union(v.literal("owner"), v.literal("attendant")),
    lowStockThreshold: v.number(),
  }),

  categories: defineTable({
    id: v.number(),
    name: v.string(),
  }).index("by_id_idx", ["id"]),

  products: defineTable({
    id: v.number(),
    name: v.string(),
    categoryId: v.number(),
    barcode: v.optional(v.string()),
    sellingPriceCents: v.number(),
    costPriceCents: v.optional(v.number()),
    stockLevel: v.number(),
    lowStockThreshold: v.number(),
  }).index("by_id_idx", ["id"]),

  customers: defineTable({
    id: v.number(),
    name: v.string(),
    phone: v.optional(v.string()),
    balanceCents: v.number(),
  }).index("by_id_idx", ["id"]),

  customerLedgerEntries: defineTable({
    id: v.number(),
    customerId: v.number(),
    type: v.union(v.literal("charge"), v.literal("payment")),
    amountCents: v.number(),
    note: v.optional(v.string()),
    saleId: v.optional(v.number()),
  }).index("by_customerId_idx", ["customerId"]),

  sales: defineTable({
    id: v.number(),
    operatorRole: v.union(v.literal("owner"), v.literal("attendant")),
    status: v.union(v.literal("completed"), v.literal("voided")),
    items: v.array(v.object({
      productId: v.number(),
      productName: v.string(),
      quantity: v.number(),
      unitPriceCents: v.number(),
      lineTotalCents: v.number(),
    })),
    payments: v.array(v.object({
      method: v.union(v.literal("cash"), v.literal("transfer"), v.literal("card"), v.literal("credit")),
      amountCents: v.number(),
    })),
    subtotalCents: v.number(),
    discountCents: v.number(),
    totalCents: v.number(),
    customerId: v.optional(v.number()),
    customerName: v.optional(v.string()),
    voidReason: v.optional(v.string()),
    voidedAt: v.optional(v.number()),
  }).index("by_id_idx", ["id"]),

  expenses: defineTable({
    id: v.number(),
    category: v.union(v.literal("rent"), v.literal("power"), v.literal("staff"), v.literal("transport"), v.literal("logistics"), v.literal("other")),
    description: v.string(),
    amountCents: v.number(),
    expenseDate: v.string(),
  }).index("by_id_idx", ["id"]),

  aiReports: defineTable({
    id: v.number(),
    title: v.optional(v.string()),
    content: v.string(),
    type: v.optional(v.string()),
    model: v.optional(v.string()),
    tokens: v.optional(v.number()),
    promptTokens: v.optional(v.number()),
    completionTokens: v.optional(v.number()),
  }).index("by_id_idx", ["id"]),

  aiChatMessages: defineTable({
    id: v.number(),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
    model: v.optional(v.string()),
    tokens: v.optional(v.number()),
  }).index("by_id_idx", ["id"]),

  stockMovements: defineTable({
    id: v.number(),
    productId: v.number(),
    type: v.union(v.literal("restock"), v.literal("sale"), v.literal("correction"), v.literal("void")),
    quantity: v.number(),
    costPriceCents: v.optional(v.number()),
    previousStock: v.number(),
    newStock: v.number(),
    reason: v.optional(v.string()),
    note: v.optional(v.string()),
  }).index("by_productId_idx", ["productId"]),

  counters: defineTable({
    name: v.string(),
    value: v.number(),
  }).index("by_name_idx", ["name"]),
});
