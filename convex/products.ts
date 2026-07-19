import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getNextId } from "./helpers";

export const list = query({
  args: { search: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let products = await ctx.db.query("products").collect();
    if (args.search) {
      const s = args.search.toLowerCase();
      products = products.filter(
        (p) => p.name.toLowerCase().includes(s) || (p.barcode && p.barcode.includes(s))
      );
    }
    const categories = await ctx.db.query("categories").collect();
    const catMap = new Map(categories.map((c) => [c.id, c.name]));
    return products.map((p) => ({
      id: p.id,
      name: p.name,
      categoryId: p.categoryId,
      categoryName: catMap.get(p.categoryId) ?? "",
      barcode: p.barcode ?? null,
      sellingPriceCents: p.sellingPriceCents,
      costPriceCents: p.costPriceCents ?? null,
      stockLevel: p.stockLevel,
      lowStockThreshold: p.lowStockThreshold,
      isLowStock: p.stockLevel <= p.lowStockThreshold,
      createdAt: new Date(p._creationTime).toISOString(),
      updatedAt: new Date(p._creationTime).toISOString(),
    }));
  },
});

export const getById = query({
  args: { id: v.number() },
  handler: async (ctx, args) => {
    const product = await ctx.db
      .query("products")
      .withIndex("by_id_idx", (q) => q.eq("id", args.id))
      .first();
    if (!product) return null;
    const category = await ctx.db
      .query("categories")
      .withIndex("by_id_idx", (q) => q.eq("id", product.categoryId))
      .first();
    return {
      id: product.id,
      name: product.name,
      categoryId: product.categoryId,
      categoryName: category?.name ?? "",
      barcode: product.barcode ?? null,
      sellingPriceCents: product.sellingPriceCents,
      costPriceCents: product.costPriceCents ?? null,
      stockLevel: product.stockLevel,
      lowStockThreshold: product.lowStockThreshold,
      isLowStock: product.stockLevel <= product.lowStockThreshold,
      createdAt: new Date(product._creationTime).toISOString(),
      updatedAt: new Date(product._creationTime).toISOString(),
    };
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    categoryId: v.number(),
    barcode: v.optional(v.string()),
    sellingPriceCents: v.number(),
    costPriceCents: v.optional(v.number()),
    stockLevel: v.number(),
    lowStockThreshold: v.number(),
  },
  handler: async (ctx, args) => {
    const id = await getNextId(ctx, "products");
    await ctx.db.insert("products", {
      id,
      name: args.name,
      categoryId: args.categoryId,
      barcode: args.barcode,
      sellingPriceCents: args.sellingPriceCents,
      costPriceCents: args.costPriceCents ?? 0,
      stockLevel: args.stockLevel,
      lowStockThreshold: args.lowStockThreshold,
    });
    return { id };
  },
});

export const update = mutation({
  args: {
    id: v.number(),
    name: v.optional(v.string()),
    categoryId: v.optional(v.number()),
    barcode: v.optional(v.string()),
    sellingPriceCents: v.optional(v.number()),
    costPriceCents: v.optional(v.number()),
    stockLevel: v.optional(v.number()),
    lowStockThreshold: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    const doc = await ctx.db
      .query("products")
      .withIndex("by_id_idx", (q) => q.eq("id", args.id))
      .first();
    if (doc) {
      await ctx.db.patch(doc._id, fields);
    }
  },
});

export const restock = mutation({
  args: { id: v.number(), quantity: v.number(), costPriceCents: v.number() },
  handler: async (ctx, args) => {
    const doc = await ctx.db
      .query("products")
      .withIndex("by_id_idx", (q) => q.eq("id", args.id))
      .first();
    if (!doc) throw new Error("Product not found");
    const previousStock = doc.stockLevel;
    const newStock = previousStock + args.quantity;
    await ctx.db.patch(doc._id, { stockLevel: newStock, costPriceCents: args.costPriceCents });
    const movId = await getNextId(ctx, "stockMovements");
    await ctx.db.insert("stockMovements", {
      id: movId,
      productId: args.id,
      type: "restock",
      quantity: args.quantity,
      costPriceCents: args.costPriceCents,
      previousStock,
      newStock,
    });
  },
});

export const remove = mutation({
  args: { id: v.number() },
  handler: async (ctx, args) => {
    const doc = await ctx.db
      .query("products")
      .withIndex("by_id_idx", (q) => q.eq("id", args.id))
      .first();
    if (!doc) throw new Error("Product not found");
    await ctx.db.delete(doc._id);
  },
});

export const correctStock = mutation({
  args: { id: v.number(), quantityChange: v.number(), reason: v.string() },
  handler: async (ctx, args) => {
    const doc = await ctx.db
      .query("products")
      .withIndex("by_id_idx", (q) => q.eq("id", args.id))
      .first();
    if (!doc) throw new Error("Product not found");
    const previousStock = doc.stockLevel;
    const newStock = previousStock + args.quantityChange;
    await ctx.db.patch(doc._id, { stockLevel: newStock });
    const movId = await getNextId(ctx, "stockMovements");
    await ctx.db.insert("stockMovements", {
      id: movId,
      productId: args.id,
      type: "correction",
      quantity: args.quantityChange,
      previousStock,
      newStock,
      reason: args.reason,
    });
  },
});

export const listMovements = query({
  args: { productId: v.number() },
  handler: async (ctx, args) => {
    const movements = await ctx.db
      .query("stockMovements")
      .withIndex("by_productId_idx", (q) => q.eq("productId", args.productId))
      .order("desc")
      .collect();
    return movements.map((m) => ({
      id: m.id,
      productId: m.productId,
      type: m.type,
      quantity: m.quantity,
      costPriceCents: m.costPriceCents ?? null,
      previousStock: m.previousStock,
      newStock: m.newStock,
      reason: m.reason ?? null,
      note: m.note ?? null,
      createdAt: new Date(m._creationTime).toISOString(),
    }));
  },
});
