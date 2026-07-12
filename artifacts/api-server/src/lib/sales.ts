import { and, eq, gte, ilike, lte, or } from "drizzle-orm";
import {
  customersTable,
  db,
  saleItemsTable,
  salePaymentsTable,
  salesTable,
  type Sale,
} from "@workspace/db";

export type SaleWithDetails = Sale & {
  items: {
    id: number;
    productId: number;
    productName: string;
    quantity: number;
    unitPriceCents: number;
    lineTotalCents: number;
  }[];
  payments: { id: number; method: string; amountCents: number }[];
  customerName: string | null;
};

/** Loads a sale plus its items/payments/customer name, shaped for API responses. */
export async function hydrateSale(saleId: number): Promise<SaleWithDetails | undefined> {
  const [sale] = await db
    .select()
    .from(salesTable)
    .where(eq(salesTable.id, saleId));
  if (!sale) return undefined;

  const [items, payments, customer] = await Promise.all([
    db.select().from(saleItemsTable).where(eq(saleItemsTable.saleId, saleId)),
    db
      .select()
      .from(salePaymentsTable)
      .where(eq(salePaymentsTable.saleId, saleId)),
    sale.customerId
      ? db
          .select()
          .from(customersTable)
          .where(eq(customersTable.id, sale.customerId))
      : Promise.resolve([]),
  ]);

  return {
    ...sale,
    items,
    payments,
    customerName: customer[0]?.name ?? null,
  };
}

export { and, eq, gte, ilike, lte, or };
