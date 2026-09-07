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
      phone: "+27 71 000 0000",
      address: "Sandton, Johannesburg",
      tinVat: "4090123456",
    });

    await ctx.db.insert("counters", { name: "categories", value: 6 });
    await ctx.db.insert("categories", { id: 1, name: "Phones & Tablets" });
    await ctx.db.insert("categories", { id: 2, name: "Laptops & Computers" });
    await ctx.db.insert("categories", { id: 3, name: "Audio & Wearables" });
    await ctx.db.insert("categories", { id: 4, name: "Accessories" });
    await ctx.db.insert("categories", { id: 5, name: "Home Appliances" });

    await ctx.db.insert("counters", { name: "products", value: 11 });
    await ctx.db.insert("products", { id: 1, name: "Samsung Galaxy A34 5G 256GB", categoryId: 1, barcode: "4901234567890", sellingPriceCents: 550000, costPriceCents: 470000, stockLevel: 8, lowStockThreshold: 3 });
    await ctx.db.insert("products", { id: 2, name: "iPhone 13 128GB", categoryId: 1, barcode: "4901234567891", sellingPriceCents: 950000, costPriceCents: 860000, stockLevel: 4, lowStockThreshold: 2 });
    await ctx.db.insert("products", { id: 3, name: "HP Pavilion 15 Laptop", categoryId: 2, barcode: "4901234567892", sellingPriceCents: 1100000, costPriceCents: 960000, stockLevel: 3, lowStockThreshold: 1 });
    await ctx.db.insert("products", { id: 4, name: "Logitech Wireless Mouse", categoryId: 2, barcode: "4901234567893", sellingPriceCents: 35000, costPriceCents: 22000, stockLevel: 22, lowStockThreshold: 5 });
    await ctx.db.insert("products", { id: 5, name: "Sony WH-CH720 Headphones", categoryId: 3, barcode: "4901234567894", sellingPriceCents: 150000, costPriceCents: 110000, stockLevel: 6, lowStockThreshold: 2 });
    await ctx.db.insert("products", { id: 6, name: "AirPods Pro (2nd Gen)", categoryId: 3, barcode: "4901234567895", sellingPriceCents: 300000, costPriceCents: 240000, stockLevel: 9, lowStockThreshold: 2 });
    await ctx.db.insert("products", { id: 7, name: "Anker Power Bank 20000mAh", categoryId: 4, barcode: "4901234567896", sellingPriceCents: 80000, costPriceCents: 55000, stockLevel: 15, lowStockThreshold: 3 });
    await ctx.db.insert("products", { id: 8, name: "65W Type-C Fast Charger", categoryId: 4, barcode: "4901234567897", sellingPriceCents: 35000, costPriceCents: 21000, stockLevel: 20, lowStockThreshold: 2 });
    await ctx.db.insert("products", { id: 9, name: "Smart LED Desk Lamp", categoryId: 5, barcode: "4901234567898", sellingPriceCents: 30000, costPriceCents: 18000, stockLevel: 12, lowStockThreshold: 3 });
    await ctx.db.insert("products", { id: 10, name: "Bluetooth Speaker Mini", categoryId: 5, barcode: "4901234567899", sellingPriceCents: 50000, costPriceCents: 32000, stockLevel: 7, lowStockThreshold: 2 });

    await ctx.db.insert("counters", { name: "customers", value: 5 });
    await ctx.db.insert("customers", { id: 1, name: "John Doe", phone: "+27 71 234 5678", balanceCents: 600000 });
    await ctx.db.insert("customers", { id: 2, name: "Jane Smith", phone: "+27 72 345 6789", balanceCents: 2950000 });
    await ctx.db.insert("customers", { id: 3, name: "Sipho Dlamini", phone: "+27 73 456 7890", balanceCents: 0 });
    await ctx.db.insert("customers", { id: 4, name: "Thandiwe Nkosi", phone: "+27 74 567 8901", balanceCents: 47000 });

    await ctx.db.insert("counters", { name: "customerLedgerEntries", value: 7 });
    await ctx.db.insert("customerLedgerEntries", { id: 1, customerId: 1, type: "charge", amountCents: 600000, note: "Phone + accessory purchase" });
    await ctx.db.insert("customerLedgerEntries", { id: 2, customerId: 2, type: "charge", amountCents: 1850000, note: "Headphones & charger" });
    await ctx.db.insert("customerLedgerEntries", { id: 3, customerId: 2, type: "charge", amountCents: 1100000, note: "Laptop & accessories on credit" });
    await ctx.db.insert("customerLedgerEntries", { id: 4, customerId: 4, type: "charge", amountCents: 50000, note: "Bluetooth speaker" });
    await ctx.db.insert("customerLedgerEntries", { id: 5, customerId: 4, type: "payment", amountCents: 3000, note: "Cash payment" });

    await ctx.db.insert("counters", { name: "sales", value: 5 });
    await ctx.db.insert("sales", { id: 1, operatorRole: "owner", status: "completed", items: [{ productId: 1, productName: "Samsung Galaxy A34 5G 256GB", quantity: 1, unitPriceCents: 550000, costPriceCents: 470000, lineTotalCents: 550000 }, { productId: 10, productName: "Bluetooth Speaker Mini", quantity: 1, unitPriceCents: 50000, costPriceCents: 32000, lineTotalCents: 50000 }], payments: [{ method: "cash", amountCents: 600000 }], subtotalCents: 600000, discountCents: 0, totalCents: 600000, customerId: 1, customerName: "John Doe" });
    await ctx.db.insert("sales", { id: 2, operatorRole: "owner", status: "completed", items: [{ productId: 5, productName: "Sony WH-CH720 Headphones", quantity: 1, unitPriceCents: 150000, costPriceCents: 110000, lineTotalCents: 150000 }, { productId: 7, productName: "Anker Power Bank 20000mAh", quantity: 2, unitPriceCents: 80000, costPriceCents: 55000, lineTotalCents: 160000 }], payments: [{ method: "transfer", amountCents: 310000 }], subtotalCents: 310000, discountCents: 0, totalCents: 310000, customerId: 2, customerName: "Jane Smith" });
    await ctx.db.insert("sales", { id: 3, operatorRole: "owner", status: "completed", items: [{ productId: 3, productName: "HP Pavilion 15 Laptop", quantity: 1, unitPriceCents: 1100000, costPriceCents: 960000, lineTotalCents: 1100000 }, { productId: 4, productName: "Logitech Wireless Mouse", quantity: 1, unitPriceCents: 35000, costPriceCents: 22000, lineTotalCents: 35000 }], payments: [{ method: "credit", amountCents: 1135000 }], subtotalCents: 1135000, discountCents: 0, totalCents: 1135000, customerId: 2, customerName: "Jane Smith" });
    await ctx.db.insert("sales", { id: 4, operatorRole: "owner", status: "completed", items: [{ productId: 9, productName: "Smart LED Desk Lamp", quantity: 2, unitPriceCents: 30000, costPriceCents: 18000, lineTotalCents: 60000 }, { productId: 8, productName: "65W Type-C Fast Charger", quantity: 1, unitPriceCents: 35000, costPriceCents: 21000, lineTotalCents: 35000 }], payments: [{ method: "cash", amountCents: 95000 }], subtotalCents: 95000, discountCents: 0, totalCents: 95000, customerId: 4, customerName: "Thandiwe Nkosi" });

    await ctx.db.insert("counters", { name: "expenses", value: 4 });
    await ctx.db.insert("expenses", { id: 1, category: "power", amountCents: 250000, description: "Monthly electricity bill", expenseDate: "2026-07-15" });
    await ctx.db.insert("expenses", { id: 2, category: "rent", amountCents: 1500000, description: "Shop rent", expenseDate: "2026-07-01" });
    await ctx.db.insert("expenses", { id: 3, category: "logistics", amountCents: 120000, description: "Product delivery", expenseDate: "2026-07-14" });

    await ctx.db.insert("counters", { name: "stockMovements", value: 11 });

    await ctx.db.insert("counters", { name: "aiReports", value: 1 });

    await ctx.db.insert("counters", { name: "aiChatMessages", value: 1 });

    return { done: true, message: "Seed complete" };
  },
});