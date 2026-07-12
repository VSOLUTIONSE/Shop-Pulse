import {
  CreateExpenseBody,
  CreateExpenseResponse,
  DeleteExpenseParams,
  ListExpensesQueryParams,
  ListExpensesResponse,
} from "@workspace/api-zod";
import { db, expensesTable } from "@workspace/db";
import { and, eq, gte, lte } from "drizzle-orm";
import { Router, type IRouter } from "express";

const router: IRouter = Router();

router.get("/expenses", async (req, res) => {
  const query = ListExpensesQueryParams.parse(req.query);
  const conditions = [];
  if (query.category) conditions.push(eq(expensesTable.category, query.category));
  if (query.from) conditions.push(gte(expensesTable.expenseDate, query.from));
  if (query.to) conditions.push(lte(expensesTable.expenseDate, query.to));

  const expenses = await db
    .select()
    .from(expensesTable)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(expensesTable.expenseDate);

  res.json(ListExpensesResponse.parse(expenses));
});

router.post("/expenses", async (req, res) => {
  const body = CreateExpenseBody.parse(req.body);
  const [created] = await db.insert(expensesTable).values(body).returning();
  res.status(201).json(CreateExpenseResponse.parse(created));
});

router.delete("/expenses/:id", async (req, res) => {
  const { id } = DeleteExpenseParams.parse(req.params);
  await db.delete(expensesTable).where(eq(expensesTable.id, id));
  res.status(204).end();
});

export default router;
