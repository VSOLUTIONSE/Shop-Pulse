import { db, pool } from "./index";
import { categoriesTable, customersTable, productsTable, settingsTable } from "./schema";

async function seed() {
  const [existingSettings] = await db.select().from(settingsTable).limit(1);
  if (!existingSettings) {
    await db.insert(settingsTable).values({});
    console.log("Seeded settings");
  }

  const existingCategories = await db.select().from(categoriesTable);
  let beverages = existingCategories.find((c) => c.name === "Beverages");
  let snacks = existingCategories.find((c) => c.name === "Snacks");
  let household = existingCategories.find((c) => c.name === "Household");

  if (existingCategories.length === 0) {
    const [b, s, h] = await db
      .insert(categoriesTable)
      .values([{ name: "Beverages" }, { name: "Snacks" }, { name: "Household" }])
      .returning();
    beverages = b;
    snacks = s;
    household = h;
    console.log("Seeded categories");
  }

  const existingProducts = await db.select().from(productsTable);
  if (existingProducts.length === 0 && beverages && snacks && household) {
    await db.insert(productsTable).values([
      {
        name: "Coca-Cola 50cl",
        categoryId: beverages.id,
        barcode: "6001234567890",
        sellingPriceCents: 50000,
        costPriceCents: 35000,
        stockLevel: 40,
        lowStockThreshold: 10,
      },
      {
        name: "Indomie Noodles",
        categoryId: snacks.id,
        barcode: "6001234567891",
        sellingPriceCents: 20000,
        costPriceCents: 14000,
        stockLevel: 4,
        lowStockThreshold: 10,
      },
      {
        name: "Dettol Soap",
        categoryId: household.id,
        barcode: "6001234567892",
        sellingPriceCents: 80000,
        costPriceCents: 55000,
        stockLevel: 25,
        lowStockThreshold: 5,
      },
    ]);
    console.log("Seeded products");
  }

  const existingCustomers = await db.select().from(customersTable);
  if (existingCustomers.length === 0) {
    await db.insert(customersTable).values([
      { name: "Adaeze Okafor", phone: "08031234567" },
    ]);
    console.log("Seeded customers");
  }

  console.log("Seed complete");
}

seed()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
