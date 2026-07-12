import type { Settings } from "@workspace/db";
import { isOwner } from "./settings";

/**
 * Cost price and profit are server-side secrets from the attendant role's
 * perspective: this must null the field out before it ever reaches
 * `res.json`, not just hide it in the UI, per the product's permission model.
 */
export function withCostPriceVisibility<T extends { costPriceCents: number | null }>(
  product: T,
  settings: Settings,
): T {
  if (isOwner(settings)) return product;
  return { ...product, costPriceCents: null };
}
