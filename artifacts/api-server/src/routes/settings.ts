import { GetSettingsResponse, UpdateSettingsBody, UpdateSettingsResponse } from "@workspace/api-zod";
import { db, settingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { Router, type IRouter } from "express";
import { getActiveSettings } from "../lib/settings";

const router: IRouter = Router();

router.get("/settings", async (_req, res) => {
  const settings = await getActiveSettings();
  res.json(GetSettingsResponse.parse(settings));
});

router.patch("/settings", async (req, res) => {
  const body = UpdateSettingsBody.parse(req.body);
  const current = await getActiveSettings();

  const [updated] = await db
    .update(settingsTable)
    .set(body)
    .where(eq(settingsTable.id, current.id))
    .returning();

  res.json(UpdateSettingsResponse.parse(updated));
});

export default router;
