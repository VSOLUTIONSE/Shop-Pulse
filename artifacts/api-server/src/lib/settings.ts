import { db, settingsTable, type Settings } from "@workspace/db";

/**
 * ShopPulse runs on a single shared device with a global active-role switch
 * (Owner/Attendant) stored in a single-row settings table, instead of
 * per-user authentication. This helper lazily creates that row on first use.
 */
export async function getActiveSettings(): Promise<Settings> {
  const [existing] = await db.select().from(settingsTable).limit(1);
  if (existing) return existing;

  const [created] = await db.insert(settingsTable).values({}).returning();
  return created;
}

export function isOwner(settings: Settings): boolean {
  return settings.activeRole === "owner";
}
