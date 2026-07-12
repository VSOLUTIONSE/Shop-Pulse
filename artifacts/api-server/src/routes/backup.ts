import { ExportBackupResponse, ImportBackupBody, ImportBackupResponse } from "@workspace/api-zod";
import {
  aiReportsTable,
  categoriesTable,
  customerLedgerEntriesTable,
  customersTable,
  db,
  expensesTable,
  productsTable,
  saleItemsTable,
  salePaymentsTable,
  salesTable,
  settingsTable,
  stockMovementsTable,
} from "@workspace/db";
import { Router, type IRouter } from "express";

const router: IRouter = Router();

const TABLES = {
  settings: settingsTable,
  categories: categoriesTable,
  products: productsTable,
  customers: customersTable,
  customerLedgerEntries: customerLedgerEntriesTable,
  sales: salesTable,
  saleItems: saleItemsTable,
  salePayments: salePaymentsTable,
  stockMovements: stockMovementsTable,
  expenses: expensesTable,
  aiReports: aiReportsTable,
} as const;

router.get("/backup/export", async (_req, res) => {
  const bundle: Record<string, unknown> = { exportedAt: new Date().toISOString() };
  for (const [key, table] of Object.entries(TABLES)) {
    bundle[key] = await db.select().from(table);
  }
  res.json(ExportBackupResponse.parse(bundle));
});

router.post("/backup/import", async (req, res) => {
  const bundle = ImportBackupBody.parse(req.body);

  try {
    await db.transaction(async (tx) => {
      // Delete children before parents to satisfy foreign key constraints.
      const deletionOrder = [
        "customerLedgerEntries",
        "salePayments",
        "saleItems",
        "sales",
        "stockMovements",
        "products",
        "customers",
        "categories",
        "aiReports",
        "expenses",
        "settings",
      ] as const;
      for (const key of deletionOrder) {
        await tx.delete(TABLES[key]);
      }

      const insertionOrder = [
        "settings",
        "categories",
        "customers",
        "products",
        "sales",
        "saleItems",
        "salePayments",
        "stockMovements",
        "customerLedgerEntries",
        "expenses",
        "aiReports",
      ] as const;
      for (const key of insertionOrder) {
        const rows = bundle[key];
        if (Array.isArray(rows) && rows.length > 0) {
          await tx.insert(TABLES[key]).values(rows as never[]);
        }
      }
    });
  } catch (error) {
    res.status(400).json(
      ImportBackupResponse.parse({
        success: false,
        message: error instanceof Error ? error.message : "Import failed",
      }),
    );
    return;
  }

  res.json(ImportBackupResponse.parse({ success: true, message: "Backup restored successfully" }));
});

export default router;
