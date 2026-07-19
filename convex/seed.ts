import { mutation } from "./_generated/server";

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("settings").first();
    if (existing) return { done: false, message: "Already seeded" };

    await ctx.db.insert("settings", {
      shopName: "SalesPulse",
      ownerLabel: "Owner",
      attendantLabel: "Attendant",
      activeRole: "owner",
      lowStockThreshold: 5,
    });

    await ctx.db.insert("counters", { name: "categories", value: 6 });
    await ctx.db.insert("categories", { id: 1, name: "Beverages" });
    await ctx.db.insert("categories", { id: 2, name: "Snacks" });
    await ctx.db.insert("categories", { id: 3, name: "Groceries" });
    await ctx.db.insert("categories", { id: 4, name: "Household" });
    await ctx.db.insert("categories", { id: 5, name: "Personal Care" });

    await ctx.db.insert("counters", { name: "products", value: 11 });
    await ctx.db.insert("products", { id: 1, name: "Coca-Cola 500ml", categoryId: 1, barcode: "4901234567890", sellingPriceCents: 30000, costPriceCents: 18000, stockLevel: 48, lowStockThreshold: 5 });
    await ctx.db.insert("products", { id: 2, name: "Pepsi 500ml", categoryId: 1, barcode: "4901234567891", sellingPriceCents: 30000, costPriceCents: 18000, stockLevel: 3, lowStockThreshold: 5 });
    await ctx.db.insert("products", { id: 3, name: "Bottled Water 1.5L", categoryId: 1, barcode: "4901234567892", sellingPriceCents: 20000, costPriceCents: 10000, stockLevel: 120, lowStockThreshold: 10 });
    await ctx.db.insert("products", { id: 4, name: "Lays Classic Chips", categoryId: 2, barcode: "4901234567893", sellingPriceCents: 35000, costPriceCents: 20000, stockLevel: 25, lowStockThreshold: 5 });
    await ctx.db.insert("products", { id: 5, name: "Oreo Cookies 300g", categoryId: 2, barcode: "4901234567894", sellingPriceCents: 40000, costPriceCents: 25000, stockLevel: 2, lowStockThreshold: 5 });
    await ctx.db.insert("products", { id: 6, name: "White Rice 5kg", categoryId: 3, barcode: "4901234567895", sellingPriceCents: 200000, costPriceCents: 160000, stockLevel: 15, lowStockThreshold: 3 });
    await ctx.db.insert("products", { id: 7, name: "Cooking Oil 5L", categoryId: 3, barcode: "4901234567896", sellingPriceCents: 120000, costPriceCents: 90000, stockLevel: 8, lowStockThreshold: 3 });
    await ctx.db.insert("products", { id: 8, name: "Dish Soap 500ml", categoryId: 4, barcode: "4901234567897", sellingPriceCents: 25000, costPriceCents: 15000, stockLevel: 20, lowStockThreshold: 5 });
    await ctx.db.insert("products", { id: 9, name: "Toothpaste 100g", categoryId: 5, barcode: "4901234567898", sellingPriceCents: 35000, costPriceCents: 20000, stockLevel: 30, lowStockThreshold: 5 });
    await ctx.db.insert("products", { id: 10, name: "Shampoo 200ml", categoryId: 5, barcode: "4901234567899", sellingPriceCents: 75000, costPriceCents: 45000, stockLevel: 12, lowStockThreshold: 3 });

    await ctx.db.insert("counters", { name: "customers", value: 5 });
    await ctx.db.insert("customers", { id: 1, name: "John Doe", phone: "+2348012345678", balanceCents: 650000 });
    await ctx.db.insert("customers", { id: 2, name: "Jane Smith", phone: "+2348023456789", balanceCents: 320000 });
    await ctx.db.insert("customers", { id: 3, name: "Ahmed Musa", phone: "+2348034567890", balanceCents: 0 });
    await ctx.db.insert("customers", { id: 4, name: "Sarah Okafor", phone: "+2348045678901", balanceCents: 120000 });

    await ctx.db.insert("counters", { name: "customerLedgerEntries", value: 7 });
    await ctx.db.insert("customerLedgerEntries", { id: 1, customerId: 1, type: "charge", amountCents: 500000, note: "Purchase on credit" });
    await ctx.db.insert("customerLedgerEntries", { id: 2, customerId: 1, type: "payment", amountCents: 300000, note: "Partial payment" });
    await ctx.db.insert("customerLedgerEntries", { id: 3, customerId: 1, type: "charge", amountCents: 450000, note: "More groceries" });
    await ctx.db.insert("customerLedgerEntries", { id: 4, customerId: 2, type: "charge", amountCents: 350000, note: "Weekend supplies" });
    await ctx.db.insert("customerLedgerEntries", { id: 5, customerId: 2, type: "payment", amountCents: 30000, note: "Cash payment" });
    await ctx.db.insert("customerLedgerEntries", { id: 6, customerId: 4, type: "charge", amountCents: 120000, note: "Snacks and drinks" });

    await ctx.db.insert("counters", { name: "sales", value: 5 });
    await ctx.db.insert("sales", { id: 1, operatorRole: "owner", status: "completed", items: [{ productId: 1, productName: "Coca-Cola 500ml", quantity: 2, unitPriceCents: 30000, costPriceCents: 18000, lineTotalCents: 60000 }, { productId: 5, productName: "Oreo Cookies 300g", quantity: 1, unitPriceCents: 40000, costPriceCents: 25000, lineTotalCents: 40000 }], payments: [{ method: "cash", amountCents: 100000 }], subtotalCents: 100000, discountCents: 0, totalCents: 100000, customerId: 1, customerName: "John Doe" });
    await ctx.db.insert("sales", { id: 2, operatorRole: "owner", status: "completed", items: [{ productId: 3, productName: "Bottled Water 1.5L", quantity: 5, unitPriceCents: 20000, costPriceCents: 10000, lineTotalCents: 100000 }, { productId: 4, productName: "Lays Classic Chips", quantity: 3, unitPriceCents: 35000, costPriceCents: 20000, lineTotalCents: 105000 }], payments: [{ method: "transfer", amountCents: 205000 }], subtotalCents: 205000, discountCents: 0, totalCents: 205000, customerId: 2, customerName: "Jane Smith" });
    await ctx.db.insert("sales", { id: 3, operatorRole: "owner", status: "completed", items: [{ productId: 6, productName: "White Rice 5kg", quantity: 2, unitPriceCents: 200000, costPriceCents: 160000, lineTotalCents: 400000 }, { productId: 7, productName: "Cooking Oil 5L", quantity: 1, unitPriceCents: 120000, costPriceCents: 90000, lineTotalCents: 120000 }], payments: [{ method: "credit", amountCents: 520000 }], subtotalCents: 520000, discountCents: 0, totalCents: 520000, customerId: 1, customerName: "John Doe" });
    await ctx.db.insert("sales", { id: 4, operatorRole: "owner", status: "completed", items: [{ productId: 9, productName: "Toothpaste 100g", quantity: 2, unitPriceCents: 35000, costPriceCents: 20000, lineTotalCents: 70000 }, { productId: 8, productName: "Dish Soap 500ml", quantity: 1, unitPriceCents: 25000, costPriceCents: 15000, lineTotalCents: 25000 }], payments: [{ method: "cash", amountCents: 95000 }], subtotalCents: 95000, discountCents: 0, totalCents: 95000, customerId: 4, customerName: "Sarah Okafor" });

    await ctx.db.insert("counters", { name: "expenses", value: 4 });
    await ctx.db.insert("expenses", { id: 1, category: "power", amountCents: 150000, description: "Monthly electricity bill", expenseDate: "2026-07-15" });
    await ctx.db.insert("expenses", { id: 2, category: "rent", amountCents: 500000, description: "Rent", expenseDate: "2026-07-01" });
    await ctx.db.insert("expenses", { id: 3, category: "other", amountCents: 75000, description: "Cleaning supplies", expenseDate: "2026-07-14" });

    await ctx.db.insert("counters", { name: "stockMovements", value: 11 });

    await ctx.db.insert("counters", { name: "aiReports", value: 1 });

    await ctx.db.insert("counters", { name: "aiChatMessages", value: 1 });

    return { done: true, message: "Seed complete" };
  },
});
