/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as aiChat from "../aiChat.js";
import type * as aiReports from "../aiReports.js";
import type * as aiReportsGenerate from "../aiReportsGenerate.js";
import type * as aiReportsHelpers from "../aiReportsHelpers.js";
import type * as categories from "../categories.js";
import type * as customers from "../customers.js";
import type * as dailySessions from "../dailySessions.js";
import type * as dashboard from "../dashboard.js";
import type * as expenses from "../expenses.js";
import type * as helpers from "../helpers.js";
import type * as products from "../products.js";
import type * as sales from "../sales.js";
import type * as seed from "../seed.js";
import type * as settings from "../settings.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  aiChat: typeof aiChat;
  aiReports: typeof aiReports;
  aiReportsGenerate: typeof aiReportsGenerate;
  aiReportsHelpers: typeof aiReportsHelpers;
  categories: typeof categories;
  customers: typeof customers;
  dailySessions: typeof dailySessions;
  dashboard: typeof dashboard;
  expenses: typeof expenses;
  helpers: typeof helpers;
  products: typeof products;
  sales: typeof sales;
  seed: typeof seed;
  settings: typeof settings;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
