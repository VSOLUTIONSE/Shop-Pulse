import {
  CreateSaleBody,
  CreateSaleResponse,
  GetSaleParams,
  GetSaleResponse,
  ListSalesQueryParams,
  ListSalesResponse,
  VoidSaleBody,
  VoidSaleParams,
  VoidSaleResponse,
} from "@workspace/api-zod";
import {
  customerLedgerEntriesTable,
  customersTable,
  db,
  productsTable,
  saleItemsTable,
  salePaymentsTable,
  salesTable,
  stockMovementsTable,
} from "@workspace/db";
import { and, desc, eq, gte, inArray, lte } from "drizzle-orm";
import { Router, type IRouter } from "express";
import { hydrateSale } from "../lib/sales";
import { getActiveSettings, isOwner } from "../lib/settings";

const router: IRouter = Router();

router.get("/sales", async (req, res) => {
  const query = ListSalesQueryParams.parse(req.query);
  const conditions = [];
  if (query.status) conditions.push(eq(salesTable.status, query.status));
  if (query.from) conditions.push(gte(salesTable.createdAt, new Date(query.from)));
  if (query.to) conditions.push(lte(salesTable.createdAt, new Date(query.to)));

  const rows = await db
    .select()
    .from(salesTable)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(salesTable.createdAt));

  const hydratedAll = await Promise.all(rows.map((row) => hydrateSale(row.id)));
  let hydrated = hydratedAll.filter(
    (sale): sale is NonNullable<typeof sale> => !!sale,
  );

  if (query.paymentMethod) {
    hydrated = hydrated.filter((sale) =>
      sale.payments.some((p) => p.method === query.paymentMethod),
    );
  }
  if (query.search) {
    const term = query.search.toLowerCase();
    hydrated = hydrated.filter(
      (sale) =>
        sale.customerName?.toLowerCase().includes(term) ||
        sale.items.some((item) => item.productName.toLowerCase().includes(term)),
    );
  }

  res.json(ListSalesResponse.parse(hydrated));
});

router.post("/sales", async (req, res) => {
  const body = CreateSaleBody.parse(req.body);
  const settings = await getActiveSettings();

  const usesCredit = body.payments.some((p) => p.method === "credit");
  if (usesCredit && !body.customerId) {
    res.status(400).json({ message: "customerId is required for credit payments" });
    return;
  }

  const productIds = body.items.map((item) => item.productId);
  const products = await db
    .select()
    .from(productsTable)
    .where(inArray(productsTable.id, productIds));
  const productById = new Map(products.map((p) => [p.id, p]));

  for (const item of body.items) {
    const product = productById.get(item.productId);
    if (!product) {
      res.status(400).json({ message: `Unknown product ${item.productId}` });
      return;
    }
    if (product.stockLevel < item.quantity) {
      res.status(400).json({ message: `Insufficient stock for ${product.name}` });
      return;
    }
  }

  const subtotalCents = body.items.reduce((sum, item) => {
    const product = productById.get(item.productId)!;
    return sum + product.sellingPriceCents * item.quantity;
  }, 0);
  const discountCents = body.discountCents ?? 0;
  const totalCents = subtotalCents - discountCents;

  const [sale] = await db
    .insert(salesTable)
    .values({
      operatorRole: settings.activeRole,
      status: "completed",
      subtotalCents,
      discountCents,
      totalCents,
      customerId: body.customerId ?? null,
    })
    .returning();

  for (const item of body.items) {
    const product = productById.get(item.productId)!;
    const lineTotalCents = product.sellingPriceCents * item.quantity;
    await db.insert(saleItemsTable).values({
      saleId: sale.id,
      productId: product.id,
      productName: product.name,
      quantity: item.quantity,
      unitPriceCents: product.sellingPriceCents,
      lineTotalCents,
    });
    await db
      .update(productsTable)
      .set({ stockLevel: product.stockLevel - item.quantity })
      .where(eq(productsTable.id, product.id));
    await db.insert(stockMovementsTable).values({
      productId: product.id,
      type: "sale",
      quantityChange: -item.quantity,
      referenceSaleId: sale.id,
    });
  }

  for (const payment of body.payments) {
    await db.insert(salePaymentsTable).values({
      saleId: sale.id,
      method: payment.method,
      amountCents: payment.amountCents,
    });
  }

  const creditCents = body.payments
    .filter((p) => p.method === "credit")
    .reduce((sum, p) => sum + p.amountCents, 0);

  if (creditCents > 0 && body.customerId) {
    const [customer] = await db
      .select()
      .from(customersTable)
      .where(eq(customersTable.id, body.customerId));
    await db
      .update(customersTable)
      .set({ balanceCents: customer.balanceCents + creditCents })
      .where(eq(customersTable.id, body.customerId));
    await db.insert(customerLedgerEntriesTable).values({
      customerId: body.customerId,
      type: "charge",
      amountCents: creditCents,
      note: `Sale #${sale.id}`,
      saleId: sale.id,
    });
  }

  const hydrated = await hydrateSale(sale.id);
  res.status(201).json(CreateSaleResponse.parse(hydrated));
});

router.get("/sales/:id", async (req, res) => {
  const { id } = GetSaleParams.parse(req.params);
  const hydrated = await hydrateSale(id);
  if (!hydrated) {
    res.status(404).json({ message: "Sale not found" });
    return;
  }
  res.json(GetSaleResponse.parse(hydrated));
});

router.post("/sales/:id/void", async (req, res) => {
  const { id } = VoidSaleParams.parse(req.params);
  const body = VoidSaleBody.parse(req.body);
  const settings = await getActiveSettings();

  if (!isOwner(settings)) {
    res.status(403).json({ message: "Only the owner can void a sale" });
    return;
  }

  const existing = await hydrateSale(id);
  if (!existing) {
    res.status(404).json({ message: "Sale not found" });
    return;
  }
  if (existing.status === "voided") {
    res.status(400).json({ message: "Sale is already voided" });
    return;
  }

  for (const item of existing.items) {
    const [product] = await db
      .select()
      .from(productsTable)
      .where(eq(productsTable.id, item.productId));
    if (product) {
      await db
        .update(productsTable)
        .set({ stockLevel: product.stockLevel + item.quantity })
        .where(eq(productsTable.id, item.productId));
    }
    await db.insert(stockMovementsTable).values({
      productId: item.productId,
      type: "void",
      quantityChange: item.quantity,
      referenceSaleId: id,
    });
  }

  const creditCents = existing.payments
    .filter((p) => p.method === "credit")
    .reduce((sum, p) => sum + p.amountCents, 0);
  if (creditCents > 0 && existing.customerId) {
    const [customer] = await db
      .select()
      .from(customersTable)
      .where(eq(customersTable.id, existing.customerId));
    if (customer) {
      await db
        .update(customersTable)
        .set({ balanceCents: customer.balanceCents - creditCents })
        .where(eq(customersTable.id, existing.customerId));
    }
    await db.insert(customerLedgerEntriesTable).values({
      customerId: existing.customerId,
      type: "payment",
      amountCents: creditCents,
      note: `Void of sale #${id}`,
      saleId: id,
    });
  }

  await db
    .update(salesTable)
    .set({ status: "voided", voidReason: body.reason, voidedAt: new Date() })
    .where(eq(salesTable.id, id));

  const hydrated = await hydrateSale(id);
  res.json(VoidSaleResponse.parse(hydrated));
});

export default router;
