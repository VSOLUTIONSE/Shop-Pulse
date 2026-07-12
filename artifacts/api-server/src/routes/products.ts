import {
  CorrectProductStockBody,
  CorrectProductStockParams,
  CorrectProductStockResponse,
  CreateProductBody,
  CreateProductResponse,
  GetProductParams,
  GetProductResponse,
  ListProductMovementsParams,
  ListProductMovementsResponse,
  ListProductsQueryParams,
  ListProductsResponse,
  RestockProductBody,
  RestockProductParams,
  RestockProductResponse,
  UpdateProductBody,
  UpdateProductParams,
  UpdateProductResponse,
} from "@workspace/api-zod";
import {
  categoriesTable,
  db,
  productsTable,
  stockMovementsTable,
} from "@workspace/db";
import { and, desc, eq, ilike } from "drizzle-orm";
import { Router, type IRouter } from "express";
import { getActiveSettings } from "../lib/settings";
import { withCostPriceVisibility } from "../lib/roleView";

const router: IRouter = Router();

function shapeProduct(row: {
  id: number;
  name: string;
  categoryId: number;
  categoryName: string;
  barcode: string | null;
  sellingPriceCents: number;
  costPriceCents: number;
  stockLevel: number;
  lowStockThreshold: number;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    ...row,
    isLowStock: row.stockLevel <= row.lowStockThreshold,
  };
}

async function fetchProductRow(id: number) {
  const [row] = await db
    .select({
      id: productsTable.id,
      name: productsTable.name,
      categoryId: productsTable.categoryId,
      categoryName: categoriesTable.name,
      barcode: productsTable.barcode,
      sellingPriceCents: productsTable.sellingPriceCents,
      costPriceCents: productsTable.costPriceCents,
      stockLevel: productsTable.stockLevel,
      lowStockThreshold: productsTable.lowStockThreshold,
      createdAt: productsTable.createdAt,
      updatedAt: productsTable.updatedAt,
    })
    .from(productsTable)
    .innerJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .where(eq(productsTable.id, id));
  return row;
}

router.get("/products", async (req, res) => {
  const query = ListProductsQueryParams.parse(req.query);
  const settings = await getActiveSettings();

  const conditions = [];
  if (query.search) conditions.push(ilike(productsTable.name, `%${query.search}%`));
  if (query.categoryId) conditions.push(eq(productsTable.categoryId, query.categoryId));
  if (query.barcode) conditions.push(eq(productsTable.barcode, query.barcode));

  const rows = await db
    .select({
      id: productsTable.id,
      name: productsTable.name,
      categoryId: productsTable.categoryId,
      categoryName: categoriesTable.name,
      barcode: productsTable.barcode,
      sellingPriceCents: productsTable.sellingPriceCents,
      costPriceCents: productsTable.costPriceCents,
      stockLevel: productsTable.stockLevel,
      lowStockThreshold: productsTable.lowStockThreshold,
      createdAt: productsTable.createdAt,
      updatedAt: productsTable.updatedAt,
    })
    .from(productsTable)
    .innerJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(productsTable.name);

  const shaped = rows.map((row) => withCostPriceVisibility(shapeProduct(row), settings));
  res.json(ListProductsResponse.parse(shaped));
});

router.post("/products", async (req, res) => {
  const body = CreateProductBody.parse(req.body);
  const settings = await getActiveSettings();

  const [created] = await db.insert(productsTable).values(body).returning();
  const row = await fetchProductRow(created.id);
  res.status(201).json(CreateProductResponse.parse(withCostPriceVisibility(shapeProduct(row), settings)));
});

router.get("/products/:id", async (req, res) => {
  const { id } = GetProductParams.parse(req.params);
  const settings = await getActiveSettings();
  const row = await fetchProductRow(id);
  if (!row) {
    res.status(404).json({ message: "Product not found" });
    return;
  }
  res.json(GetProductResponse.parse(withCostPriceVisibility(shapeProduct(row), settings)));
});

router.patch("/products/:id", async (req, res) => {
  const { id } = UpdateProductParams.parse(req.params);
  const body = UpdateProductBody.parse(req.body);
  const settings = await getActiveSettings();

  const [updated] = await db
    .update(productsTable)
    .set(body)
    .where(eq(productsTable.id, id))
    .returning();
  if (!updated) {
    res.status(404).json({ message: "Product not found" });
    return;
  }

  const row = await fetchProductRow(id);
  res.json(UpdateProductResponse.parse(withCostPriceVisibility(shapeProduct(row), settings)));
});

router.post("/products/:id/restock", async (req, res) => {
  const { id } = RestockProductParams.parse(req.params);
  const body = RestockProductBody.parse(req.body);
  const settings = await getActiveSettings();

  const existing = await fetchProductRow(id);
  if (!existing) {
    res.status(404).json({ message: "Product not found" });
    return;
  }

  const [updated] = await db
    .update(productsTable)
    .set({
      stockLevel: existing.stockLevel + body.quantity,
      costPriceCents: body.costPriceCents,
    })
    .where(eq(productsTable.id, id))
    .returning();

  await db.insert(stockMovementsTable).values({
    productId: id,
    type: "restock",
    quantityChange: body.quantity,
    reason: body.note ?? null,
  });

  const row = await fetchProductRow(updated.id);
  res.json(RestockProductResponse.parse(withCostPriceVisibility(shapeProduct(row), settings)));
});

router.post("/products/:id/correction", async (req, res) => {
  const { id } = CorrectProductStockParams.parse(req.params);
  const body = CorrectProductStockBody.parse(req.body);
  const settings = await getActiveSettings();

  const existing = await fetchProductRow(id);
  if (!existing) {
    res.status(404).json({ message: "Product not found" });
    return;
  }

  const [updated] = await db
    .update(productsTable)
    .set({ stockLevel: existing.stockLevel + body.quantityChange })
    .where(eq(productsTable.id, id))
    .returning();

  await db.insert(stockMovementsTable).values({
    productId: id,
    type: "correction",
    quantityChange: body.quantityChange,
    reason: body.reason,
  });

  const row = await fetchProductRow(updated.id);
  res.json(CorrectProductStockResponse.parse(withCostPriceVisibility(shapeProduct(row), settings)));
});

router.get("/products/:id/movements", async (req, res) => {
  const { id } = ListProductMovementsParams.parse(req.params);
  const movements = await db
    .select()
    .from(stockMovementsTable)
    .where(eq(stockMovementsTable.productId, id))
    .orderBy(desc(stockMovementsTable.createdAt));
  res.json(ListProductMovementsResponse.parse(movements));
});

export default router;
