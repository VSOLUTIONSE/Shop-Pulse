import {
  CreateCustomerBody,
  CreateCustomerResponse,
  GetCustomerParams,
  GetCustomerResponse,
  ListCustomersQueryParams,
  ListCustomersResponse,
  RecordCustomerPaymentBody,
  RecordCustomerPaymentParams,
  RecordCustomerPaymentResponse,
} from "@workspace/api-zod";
import {
  customerLedgerEntriesTable,
  customersTable,
  db,
} from "@workspace/db";
import { desc, eq, ilike } from "drizzle-orm";
import { Router, type IRouter } from "express";

const router: IRouter = Router();

router.get("/customers", async (req, res) => {
  const query = ListCustomersQueryParams.parse(req.query);
  const customers = await db
    .select()
    .from(customersTable)
    .where(query.search ? ilike(customersTable.name, `%${query.search}%`) : undefined)
    .orderBy(customersTable.name);
  res.json(ListCustomersResponse.parse(customers));
});

router.post("/customers", async (req, res) => {
  const body = CreateCustomerBody.parse(req.body);
  const [created] = await db.insert(customersTable).values(body).returning();
  res.status(201).json(CreateCustomerResponse.parse(created));
});

router.get("/customers/:id", async (req, res) => {
  const { id } = GetCustomerParams.parse(req.params);
  const [customer] = await db.select().from(customersTable).where(eq(customersTable.id, id));
  if (!customer) {
    res.status(404).json({ message: "Customer not found" });
    return;
  }
  const ledger = await db
    .select()
    .from(customerLedgerEntriesTable)
    .where(eq(customerLedgerEntriesTable.customerId, id))
    .orderBy(desc(customerLedgerEntriesTable.createdAt));

  res.json(GetCustomerResponse.parse({ ...customer, ledger }));
});

router.post("/customers/:id/payments", async (req, res) => {
  const { id } = RecordCustomerPaymentParams.parse(req.params);
  const body = RecordCustomerPaymentBody.parse(req.body);

  const [customer] = await db.select().from(customersTable).where(eq(customersTable.id, id));
  if (!customer) {
    res.status(404).json({ message: "Customer not found" });
    return;
  }

  await db
    .update(customersTable)
    .set({ balanceCents: customer.balanceCents - body.amountCents })
    .where(eq(customersTable.id, id));

  const [entry] = await db
    .insert(customerLedgerEntriesTable)
    .values({
      customerId: id,
      type: "payment",
      amountCents: body.amountCents,
      note: body.note ?? null,
      saleId: null,
    })
    .returning();

  res.status(201).json(RecordCustomerPaymentResponse.parse(entry));
});

export default router;
