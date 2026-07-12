import {
  CreateCategoryBody,
  CreateCategoryResponse,
  DeleteCategoryParams,
  ListCategoriesResponse,
} from "@workspace/api-zod";
import { categoriesTable, db } from "@workspace/db";
import { eq } from "drizzle-orm";
import { Router, type IRouter } from "express";

const router: IRouter = Router();

router.get("/categories", async (_req, res) => {
  const categories = await db.select().from(categoriesTable);
  res.json(ListCategoriesResponse.parse(categories));
});

router.post("/categories", async (req, res) => {
  const body = CreateCategoryBody.parse(req.body);
  const [created] = await db.insert(categoriesTable).values(body).returning();
  res.status(201).json(CreateCategoryResponse.parse(created));
});

router.delete("/categories/:id", async (req, res) => {
  const { id } = DeleteCategoryParams.parse(req.params);
  await db.delete(categoriesTable).where(eq(categoriesTable.id, id));
  res.status(204).end();
});

export default router;
