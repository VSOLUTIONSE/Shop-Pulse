import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getNextId } from "./helpers";

export const list = query({
  args: { search: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let customers = await ctx.db.query("customers").collect();
    if (args.search) {
      const s = args.search.toLowerCase();
      customers = customers.filter(
        (c) => c.name.toLowerCase().includes(s) || (c.phone && c.phone.includes(s))
      );
    }
    return customers.map((c) => ({
      id: c.id,
      name: c.name,
      phone: c.phone ?? null,
      balanceCents: c.balanceCents,
      createdAt: new Date(c._creationTime).toISOString(),
    }));
  },
});

export const getById = query({
  args: { id: v.number() },
  handler: async (ctx, args) => {
    const customer = await ctx.db
      .query("customers")
      .withIndex("by_id_idx", (q) => q.eq("id", args.id))
      .first();
    if (!customer) return null;
    const ledger = await ctx.db
      .query("customerLedgerEntries")
      .withIndex("by_customerId_idx", (q) => q.eq("customerId", args.id))
      .order("desc")
      .collect();
    return {
      id: customer.id,
      name: customer.name,
      phone: customer.phone ?? null,
      balanceCents: customer.balanceCents,
      createdAt: new Date(customer._creationTime).toISOString(),
      ledger: ledger.map((e) => ({
        id: e.id,
        customerId: e.customerId,
        type: e.type,
        amountCents: e.amountCents,
        note: e.note ?? null,
        saleId: e.saleId ?? null,
        createdAt: new Date(e._creationTime).toISOString(),
      })),
    };
  },
});

export const create = mutation({
  args: { name: v.string(), phone: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const id = await getNextId(ctx, "customers");
    await ctx.db.insert("customers", {
      id,
      name: args.name,
      phone: args.phone,
      balanceCents: 0,
    });
    return { id, name: args.name, phone: args.phone ?? null, balanceCents: 0 };
  },
});

export const recordPayment = mutation({
  args: { customerId: v.number(), amountCents: v.number(), note: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const customer = await ctx.db
      .query("customers")
      .withIndex("by_id_idx", (q) => q.eq("id", args.customerId))
      .first();
    if (!customer) throw new Error("Customer not found");
    const newBalance = customer.balanceCents - args.amountCents;
    await ctx.db.patch(customer._id, { balanceCents: Math.max(0, newBalance) });
    const entryId = await getNextId(ctx, "customerLedgerEntries");
    await ctx.db.insert("customerLedgerEntries", {
      id: entryId,
      customerId: args.customerId,
      type: "payment",
      amountCents: args.amountCents,
      note: args.note,
    });
  },
});
