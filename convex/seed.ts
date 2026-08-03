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
      phone: "+2348000000000",
      address: "Tech Hub, Lagos",
      tinVat: "12345678-0001",
    });

    await ctx.db.insert("counters", { name: "categories", value: 6 });
    await ctx.db.insert("categories", { id: 1, name: "Phones & Tablets" });
    await ctx.db.insert("categories", { id: 2, name: "Laptops & Computers" });
    await ctx.db.insert("categories", { id: 3, name: "Audio & Wearables" });
    await ctx.db.insert("categories", { id: 4, name: "Accessories" });
    await ctx.db.insert("categories", { id: 5, name: "Home Appliances" });

    await ctx.db.insert("counters", { name: "products", value: 11 });
    await ctx.db.insert("products", { id: 1, name: "Samsung Galaxy A34 5G 256GB", categoryId: 1, barcode: "4901234567890", sellingPriceCents: 38000000, costPriceCents: 34000000, stockLevel: 8, lowStockThreshold: 3 });
    await ctx.db.insert("products", { id: 2, name: "iPhone 13 128GB", categoryId: 1, barcode: "4901234567891", sellingPriceCents: 420000000, costPriceCents: 395000000, stockLevel: 4, lowStockThreshold: 2 });
    await ctx.db.insert("products", { id: 3, name: "HP Pavilion 15 Laptop", categoryId: 2, barcode: "4901234567892", sellingPriceCents: 650000000, costPriceCents: 590000000, stockLevel: 3, lowStockThreshold: 1 });
    await ctx.db.insert("products", { id: 4, name: "Logitech Wireless Mouse", categoryId: 2, barcode: "4901234567893", sellingPriceCents: 32500, costPriceCents: 21000, stockLevel: 22, lowStockThreshold: 5 });
    await ctx.db.insert("products", { id: 5, name: "Sony WH-CH720 Headphones", categoryId: 3, barcode: "4901234567894", sellingPriceCents: 26500000, costPriceCents: 21000000, stockLevel: 6, lowStockThreshold: 2 });
    await ctx.db.insert("products", { id: 6, name: "AirPods Pro (2nd Gen)", categoryId: 3, barcode: "4901234567895", sellingPriceCents: 16500000, costPriceCents: 13500000, stockLevel: 9, lowStockThreshold: 2 });
    await ctx.db.insert("products", { id: 7, name: "Anker Power Bank 20000mAh", categoryId: 4, barcode: "4901234567896", sellingPriceCents: 800000, costPriceCents: 560000, stockLevel: 15, lowStockThreshold: 3 });
    await ctx.db.insert("products", { id: 8, name: "65W Type-C Fast Charger", categoryId: 4, barcode: "4901234567897", sellingPriceCents: 380000, costPriceCents: 240000, stockLevel: 20, lowStockThreshold: 2 });
    await ctx.db.insert("products", { id: 9, name: "Smart LED Desk Lamp", categoryId: 5, barcode: "4901234567898", sellingPriceCents: 120000, costPriceCents: 75000, stockLevel: 12, lowStockThreshold: 3 });
    await ctx.db.insert("products", { id: 10, name: "Bluetooth Speaker Mini", categoryId: 5, barcode: "4901234567899", sellingPriceCents: 1050000, costPriceCents: 700000, stockLevel: 7, lowStockThreshold: 2 });

    await ctx.db.insert("counters", { name: "customers", value: 5 });
    await ctx.db.insert("customers", { id: 1, name: "John Doe", phone: "+2348012345678", balanceCents: 5050000 });
    await ctx.db.insert("customers", { id: 2, name: "Jane Smith", phone: "+2348023456789", balanceCents: 69250000 });
    await ctx.db.insert("customers", { id: 3, name: "Ahmed Musa", phone: "+2348034567890", balanceCents: 0 });
    await ctx.db.insert("customers", { id: 4, name: "Sarah Okafor", phone: "+2348045678901", balanceCents: 15950000 });

    await ctx.db.insert("counters", { name: "customerLedgerEntries", value: 7 });
    await ctx.db.insert("customerLedgerEntries", { id: 1, customerId: 1, type: "charge", amountCents: 5050000, note: "Phone + accessory purchase" });
    await ctx.db.insert("customerLedgerEntries", { id: 2, customerId: 2, type: "charge", amountCents: 4250000, note: "Headphones & charger" });
    await ctx.db.insert("customerLedgerEntries", { id: 3, customerId: 2, type: "charge", amountCents: 65000000, note: "Laptop & accessories on credit" });
    await ctx.db.insert("customerLedgerEntries", { id: 4, customerId: 4, type: "charge", amountCents: 16250000, note: "Bluetooth speaker" });
    await ctx.db.insert("customerLedgerEntries", { id: 5, customerId: 4, type: "payment", amountCents: 300000, note: "Cash payment" });

    await ctx.db.insert("counters", { name: "sales", value: 5 });
    await ctx.db.insert("sales", { id: 1, operatorRole: "owner", status: "completed", items: [{ productId: 1, productName: "Samsung Galaxy A34 5G 256GB", quantity: 1, unitPriceCents: 38000000, costPriceCents: 34000000, lineTotalCents: 38000000 }, { productId: 10, productName: "Bluetooth Speaker Mini", quantity: 1, unitPriceCents: 1050000, costPriceCents: 700000, lineTotalCents: 1050000 }], payments: [{ method: "cash", amountCents: 39050000 }], subtotalCents: 39050000, discountCents: 0, totalCents: 39050000, customerId: 1, customerName: "John Doe" });
    await ctx.db.insert("sales", { id: 2, operatorRole: "owner", status: "completed", items: [{ productId: 5, productName: "Sony WH-CH720 Headphones", quantity: 1, unitPriceCents: 26500000, costPriceCents: 21000000, lineTotalCents: 26500000 }, { productId: 7, productName: "Anker Power Bank 20000mAh", quantity: 2, unitPriceCents: 800000, costPriceCents: 560000, lineTotalCents: 1600000 }], payments: [{ method: "transfer", amountCents: 28100000 }], subtotalCents: 28100000, discountCents: 0, totalCents: 28100000, customerId: 2, customerName: "Jane Smith" });
    await ctx.db.insert("sales", { id: 3, operatorRole: "owner", status: "completed", items: [{ productId: 3, productName: "HP Pavilion 15 Laptop", quantity: 1, unitPriceCents: 650000000, costPriceCents: 590000000, lineTotalCents: 650000000 }, { productId: 4, productName: "Logitech Wireless Mouse", quantity: 1, unitPriceCents: 32500, costPriceCents: 21000, lineTotalCents: 32500 }], payments: [{ method: "credit", amountCents: 650032500 }], subtotalCents: 650032500, discountCents: 0, totalCents: 650032500, customerId: 2, customerName: "Jane Smith" });
    await ctx.db.insert("sales", { id: 4, operatorRole: "owner", status: "completed", items: [{ productId: 9, productName: "Smart LED Desk Lamp", quantity: 2, unitPriceCents: 120000, costPriceCents: 75000, lineTotalCents: 240000 }, { productId: 8, productName: "65W Type-C Fast Charger", quantity: 1, unitPriceCents: 380000, costPriceCents: 240000, lineTotalCents: 380000 }], payments: [{ method: "cash", amountCents: 620000 }], subtotalCents: 620000, discountCents: 0, totalCents: 620000, customerId: 4, customerName: "Sarah Okafor" });

    await ctx.db.insert("counters", { name: "expenses", value: 4 });
    await ctx.db.insert("expenses", { id: 1, category: "power", amountCents: 150000, description: "Monthly electricity bill", expenseDate: "2026-07-15" });
    await ctx.db.insert("expenses", { id: 2, category: "rent", amountCents: 500000, description: "Shop rent", expenseDate: "2026-07-01" });
    await ctx.db.insert("expenses", { id: 3, category: "logistics", amountCents: 75000, description: "Product delivery", expenseDate: "2026-07-14" });

    await ctx.db.insert("counters", { name: "stockMovements", value: 11 });

    await ctx.db.insert("counters", { name: "aiReports", value: 1 });

    await ctx.db.insert("counters", { name: "aiChatMessages", value: 1 });

    return { done: true, message: "Seed complete" };
  },
});