import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getNextId } from "./helpers";

export const list = query({
  args: {
    search: v.optional(v.string()),
    status: v.optional(v.union(v.literal("completed"), v.literal("voided"))),
    paymentMethod: v.optional(v.union(v.literal("cash"), v.literal("transfer"), v.literal("card"), v.literal("credit"))),
  },
  handler: async (ctx, args) => {
    let sales;
    if (args.status) {
      sales = await ctx.db
        .query("sales")
        .withIndex("by_status_idx", (q) => q.eq("status", args.status!))
        .order("desc")
        .collect();
    } else {
      sales = await ctx.db.query("sales").order("desc").collect();
    }
    if (args.paymentMethod) {
      sales = sales.filter((s) => s.payments.some((p) => p.method === args.paymentMethod));
    }
    if (args.search) {
      const s = args.search.toLowerCase();
      sales = sales.filter(
        (sale) =>
          sale.customerName?.toLowerCase().includes(s) ||
          sale.items.some((item) => item.productName.toLowerCase().includes(s))
      );
    }
    return sales.map((s) => ({
      id: s.id,
      createdAt: new Date(s._creationTime).toISOString(),
      operatorRole: s.operatorRole,
      status: s.status,
      items: s.items.map((item, i) => ({
        id: i + 1,
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        unitPriceCents: item.unitPriceCents,
        lineTotalCents: item.lineTotalCents,
      })),
      payments: s.payments.map((p, i) => ({
        id: i + 1,
        method: p.method,
        amountCents: p.amountCents,
      })),
      subtotalCents: s.subtotalCents,
      discountCents: s.discountCents,
      totalCents: s.totalCents,
      customerId: s.customerId ?? null,
      customerName: s.customerName ?? null,
      voidReason: s.voidReason ?? null,
      voidedAt: s.voidedAt ? new Date(s.voidedAt).toISOString() : null,
    }));
  },
});

export const getById = query({
  args: { id: v.number() },
  handler: async (ctx, args) => {
    const sale = await ctx.db
      .query("sales")
      .withIndex("by_id_idx", (q) => q.eq("id", args.id))
      .first();
    if (!sale) return null;
    return {
      id: sale.id,
      createdAt: new Date(sale._creationTime).toISOString(),
      operatorRole: sale.operatorRole,
      status: sale.status,
      items: sale.items.map((item, i) => ({
        id: i + 1,
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        unitPriceCents: item.unitPriceCents,
        lineTotalCents: item.lineTotalCents,
      })),
      payments: sale.payments.map((p, i) => ({
        id: i + 1,
        method: p.method,
        amountCents: p.amountCents,
      })),
      subtotalCents: sale.subtotalCents,
      discountCents: sale.discountCents,
      totalCents: sale.totalCents,
      customerId: sale.customerId ?? null,
      customerName: sale.customerName ?? null,
      voidReason: sale.voidReason ?? null,
      voidedAt: sale.voidedAt ? new Date(sale.voidedAt).toISOString() : null,
    };
  },
});

export const create = mutation({
  args: {
    items: v.array(v.object({
      productId: v.number(),
      quantity: v.number(),
    })),
    payments: v.array(v.object({
      method: v.union(v.literal("cash"), v.literal("transfer"), v.literal("card"), v.literal("credit")),
      amountCents: v.number(),
    })),
    discountCents: v.optional(v.number()),
    customerId: v.optional(v.number()),
    sessionId: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const allProducts = await ctx.db.query("products").collect();
    const productMap = new Map(allProducts.map((p) => [p.id, p]));
    const categories = await ctx.db.query("categories").collect();
    const catMap = new Map(categories.map((c) => [c.id, c.name]));

    let subtotalCents = 0;
    const saleItems = args.items.map((item) => {
      const product = productMap.get(item.productId);
      if (!product) throw new Error(`Product ${item.productId} not found`);
      const unitPrice = product.sellingPriceCents;
      const lineTotal = unitPrice * item.quantity;
      subtotalCents += lineTotal;
      return {
        productId: item.productId,
        productName: product.name,
        quantity: item.quantity,
        unitPriceCents: unitPrice,
        costPriceCents: product.costPriceCents ?? undefined,
        lineTotalCents: lineTotal,
      };
    });

    const discountCents = args.discountCents ?? 0;
    const totalCents = subtotalCents - discountCents;

    let customerName: string | undefined;
    if (args.customerId) {
      const cid = args.customerId;
      const customer = await ctx.db
        .query("customers")
        .withIndex("by_id_idx", (q) => q.eq("id", cid))
        .first();
      if (customer) {
        customerName = customer.name;
        const newBalance = customer.balanceCents + totalCents;
        await ctx.db.patch(customer._id, { balanceCents: newBalance });
        const entryId = await getNextId(ctx, "customerLedgerEntries");
        await ctx.db.insert("customerLedgerEntries", {
          id: entryId,
          customerId: args.customerId,
          type: "charge",
          amountCents: totalCents,
          note: "Purchase on credit",
          saleId: undefined,
        });
      }
    }

    for (const item of args.items) {
      const product = productMap.get(item.productId);
      if (product) {
        const previousStock = product.stockLevel;
        const newStock = previousStock - item.quantity;
        await ctx.db.patch(product._id, { stockLevel: newStock });
        const movId = await getNextId(ctx, "stockMovements");
        await ctx.db.insert("stockMovements", {
          id: movId,
          productId: item.productId,
          type: "sale",
          quantity: item.quantity,
          previousStock,
          newStock,
        });
      }
    }

    const settings = await ctx.db.query("settings").first();
    const operatorRole = settings?.activeRole === "attendant" ? "staff" : (settings?.activeRole ?? "owner");
    const id = await getNextId(ctx, "sales");

    await ctx.db.insert("sales", {
      id,
      sessionId: args.sessionId,
      operatorRole,
      status: "completed",
      items: saleItems,
      payments: args.payments,
      subtotalCents,
      discountCents,
      totalCents,
      customerId: args.customerId,
      customerName,
    });

    return { id };
  },
});

export const voidSale = mutation({
  args: { id: v.number(), reason: v.string() },
  handler: async (ctx, args) => {
    const sale = await ctx.db
      .query("sales")
      .withIndex("by_id_idx", (q) => q.eq("id", args.id))
      .first();
    if (!sale) throw new Error("Sale not found");
    if (sale.status === "voided") throw new Error("Sale already voided");

    await ctx.db.patch(sale._id, {
      status: "voided",
      voidReason: args.reason,
      voidedAt: Date.now(),
    });

    for (const item of sale.items) {
      const product = await ctx.db
        .query("products")
        .withIndex("by_id_idx", (q) => q.eq("id", item.productId))
        .first();
      if (product) {
        const previousStock = product.stockLevel;
        const newStock = previousStock + item.quantity;
        await ctx.db.patch(product._id, { stockLevel: newStock });
        const movId = await getNextId(ctx, "stockMovements");
        await ctx.db.insert("stockMovements", {
          id: movId,
          productId: item.productId,
          type: "void",
          quantity: item.quantity,
          previousStock,
          newStock,
          reason: args.reason,
        });
      }
    }

    if (sale.customerId) {
      const scid = sale.customerId;
      const customer = await ctx.db
        .query("customers")
        .withIndex("by_id_idx", (q) => q.eq("id", scid))
        .first();
      if (customer) {
        const newBalance = Math.max(0, customer.balanceCents - sale.totalCents);
        await ctx.db.patch(customer._id, { balanceCents: newBalance });
      }
    }
  },
});
