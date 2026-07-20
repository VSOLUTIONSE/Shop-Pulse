export const Role = { owner: 'owner', staff: 'staff' } as const;
export type Role = (typeof Role)[keyof typeof Role];

export const SaleStatus = { completed: 'completed', voided: 'voided' } as const;
export type SaleStatus = (typeof SaleStatus)[keyof typeof SaleStatus];

export const PaymentMethod = { cash: 'cash', transfer: 'transfer', card: 'card', credit: 'credit' } as const;
export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];

export const ExpenseCategory = { rent: 'rent', power: 'power', staff: 'staff', transport: 'transport', logistics: 'logistics', other: 'other' } as const;
export type ExpenseCategory = (typeof ExpenseCategory)[keyof typeof ExpenseCategory];

export const CustomerLedgerEntryType = { charge: 'charge', payment: 'payment' } as const;
export type CustomerLedgerEntryType = (typeof CustomerLedgerEntryType)[keyof typeof CustomerLedgerEntryType];

export const StockMovementType = { sale: 'sale', void: 'void', restock: 'restock', correction: 'correction' } as const;
export type StockMovementType = (typeof StockMovementType)[keyof typeof StockMovementType];

export interface Settings {
  id: number;
  shopName: string;
  ownerLabel: string;
  attendantLabel: string;
  activeRole: Role;
  lowStockThreshold: number;
}

export interface SettingsUpdate {
  shopName?: string;
  ownerLabel?: string;
  attendantLabel?: string;
  activeRole?: Role;
  lowStockThreshold?: number;
}

export interface Category {
  id: number;
  name: string;
}

export interface CategoryInput {
  name: string;
}

export interface Product {
  id: number;
  name: string;
  categoryId: number;
  categoryName: string;
  barcode: string | null;
  sellingPriceCents: number;
  costPriceCents: number | null;
  stockLevel: number;
  lowStockThreshold: number;
  isLowStock: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductInput {
  name: string;
  categoryId: number;
  barcode?: string;
  sellingPriceCents: number;
  costPriceCents: number;
  stockLevel: number;
  lowStockThreshold?: number;
}

export interface ProductUpdate {
  name?: string;
  categoryId?: number;
  barcode?: string;
  sellingPriceCents?: number;
  costPriceCents?: number;
  lowStockThreshold?: number;
}

export interface RestockInput {
  quantity: number;
  costPriceCents: number;
  note?: string;
}

export interface CorrectionInput {
  quantityChange: number;
  reason: string;
}

export interface StockMovement {
  id: number;
  productId: number;
  type: StockMovementType;
  quantityChange: number;
  reason: string | null;
  referenceSaleId?: number | null;
  createdAt: string;
}

export interface Customer {
  id: number;
  name: string;
  phone: string | null;
  balanceCents: number;
  createdAt: string;
}

export interface CustomerDetail extends Customer {
  ledger: CustomerLedgerEntry[];
}

export interface CustomerInput {
  name: string;
  phone?: string;
}

export interface CustomerLedgerEntry {
  id: number;
  customerId: number;
  type: CustomerLedgerEntryType;
  amountCents: number;
  note: string | null;
  saleId: number | null;
  createdAt: string;
}

export interface SaleItem {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPriceCents: number;
  lineTotalCents: number;
}

export interface SaleItemInput {
  productId: number;
  quantity: number;
}

export interface SalePayment {
  id: number;
  method: PaymentMethod;
  amountCents: number;
}

export interface SalePaymentInput {
  method: PaymentMethod;
  amountCents: number;
}

export interface Sale {
  id: number;
  createdAt: string;
  operatorRole: Role;
  status: SaleStatus;
  items: SaleItem[];
  payments: SalePayment[];
  subtotalCents: number;
  discountCents: number;
  totalCents: number;
  customerId: number | null;
  customerName: string | null;
  voidReason: string | null;
  voidedAt: string | null;
}

export interface SaleInput {
  items: SaleItemInput[];
  payments: SalePaymentInput[];
  discountCents?: number;
  customerId?: number;
  sessionId?: number;
}

export interface VoidInput {
  reason: string;
}

export interface Expense {
  id: number;
  category: ExpenseCategory;
  description: string;
  amountCents: number;
  expenseDate: string;
  createdAt: string;
}

export interface ExpenseInput {
  category: ExpenseCategory;
  description: string;
  amountCents: number;
  expenseDate: string;
}

export interface DashboardSummary {
  todayRevenueCents: number;
  activeDebtAccounts: number;
  totalDebtCents: number;
  monthlyExpensesCents: number;
  todayProfitCents: number | null;
  lowStockProducts: Product[];
  recentSales: Sale[];
  revenueChart: RevenuePoint[];
}

export interface RevenuePoint {
  date: string;
  revenueCents: number;
}

export interface AiReport {
  id: number;
  title: string | null;
  content: string;
  type: string | null;
  model: string | null;
  tokens: number | null;
  promptTokens: number | null;
  completionTokens: number | null;
  createdAt: string;
}

export interface AiChatMessage {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  model: string | null;
  tokens: number | null;
  createdAt: string;
}

export interface BackupBundle {
  [key: string]: unknown;
}

export interface HealthStatus {
  status: string;
}

export interface ImportResult {
  success: boolean;
  message: string;
}

export type ListCustomersParams = { search?: string };
export type ListProductsParams = { search?: string; categoryId?: number; barcode?: string };
export type ListSalesParams = { status?: SaleStatus; paymentMethod?: PaymentMethod; search?: string; from?: string; to?: string };
export type ListExpensesParams = { category?: ExpenseCategory; from?: string; to?: string };
export interface PaymentInput { amountCents: number; note?: string }
