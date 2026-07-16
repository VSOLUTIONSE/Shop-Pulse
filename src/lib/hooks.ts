'use client';

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type {
  Settings, Product, ProductInput, ProductUpdate,
  Category, CategoryInput, Customer, CustomerInput,
  CustomerLedgerEntry, Sale, SaleInput, SaleStatus,
  Expense, ExpenseInput, AiReport, DashboardSummary,
  StockMovement, PaymentMethod, BackupBundle, ImportResult,
} from '@/types';

export function getAiReportsQueryKey() { return ["aiReports"] }
export function getListProductsQueryKey() { return ["products"] }
export function getListCategoriesQueryKey() { return ["categories"] }
export function getListCustomersQueryKey() { return ["customers"] }
export function getListExpensesQueryKey() { return ["expenses"] }
export function getListSalesQueryKey() { return ["sales"] }

function useConvexQuery<T>(query: () => T | undefined): { data: T | undefined; isLoading: boolean } {
  const data = query();
  return { data, isLoading: data === undefined };
}

function wrapMutation<TArgs, TResult>(
  fn: (args: TArgs) => Promise<TResult>,
) {
  return {
    mutate: (args: TArgs, options?: { onSuccess?: (result: TResult) => void; onError?: (e: Error) => void }) => {
      fn(args).then(options?.onSuccess).catch(options?.onError);
    },
    mutateAsync: fn,
    isPending: false,
  };
}

// Settings
export function useGetSettings() {
  return useConvexQuery(() => useQuery(api.settings.get));
}

export function useUpdateSettings() {
  const convexMutate = useMutation(api.settings.update);
  return {
    mutate: (
      params: { data: { shopName?: string; ownerLabel?: string; attendantLabel?: string; activeRole?: 'owner' | 'attendant'; lowStockThreshold?: number } },
      options?: { onSuccess?: () => void },
    ) => {
      convexMutate(params.data).then(options?.onSuccess);
    },
    isPending: false,
  };
}

// Categories
export function useListCategories() {
  return useConvexQuery(() => useQuery(api.categories.list));
}

export function useCreateCategory() {
  const convexMutate = useMutation(api.categories.create);
  return {
    mutate: (
      params: { data: { name: string } },
      options?: { onSuccess?: () => void },
    ) => {
      convexMutate({ name: params.data.name }).then(options?.onSuccess);
    },
    isPending: false,
  };
}

export function useDeleteCategory() {
  const convexMutate = useMutation(api.categories.remove);
  return {
    mutate: (id: number, options?: { onSuccess?: () => void }) => {
      convexMutate({ id }).then(options?.onSuccess);
    },
    isPending: false,
  };
}

// Products
export function useListProducts(params?: { search?: string }) {
  return useConvexQuery(() => useQuery(api.products.list, params?.search ? { search: params.search } : {}));
}

export function useGetProduct(id: number) {
  return useConvexQuery(() => useQuery(api.products.getById, id ? { id } : "skip"));
}

export function useCreateProduct() {
  const convexMutate = useMutation(api.products.create);
  return {
    mutate: (
      params: { data: ProductInput },
      options?: { onSuccess?: () => void },
    ) => {
      const d = params.data;
      convexMutate({
        name: d.name, categoryId: d.categoryId,
        barcode: d.barcode, sellingPriceCents: d.sellingPriceCents,
        costPriceCents: d.costPriceCents, stockLevel: d.stockLevel,
        lowStockThreshold: d.lowStockThreshold ?? 5,
      }).then(options?.onSuccess);
    },
    isPending: false,
  };
}

export function useUpdateProduct() {
  const convexMutate = useMutation(api.products.update);
  return {
    mutate: (
      params: { id: number; data: ProductUpdate },
      options?: { onSuccess?: () => void },
    ) => {
      convexMutate({ id: params.id, ...params.data }).then(options?.onSuccess);
    },
    isPending: false,
  };
}

export function useRestockProduct() {
  const convexMutate = useMutation(api.products.restock);
  return {
    mutate: (
      params: { id: number; data: { quantity: number; costPriceCents: number } },
      options?: { onSuccess?: () => void },
    ) => {
      convexMutate({ id: params.id, quantity: params.data.quantity, costPriceCents: params.data.costPriceCents }).then(options?.onSuccess);
    },
    isPending: false,
  };
}

export function useCorrectProductStock() {
  const convexMutate = useMutation(api.products.correctStock);
  return {
    mutate: (
      params: { id: number; data: { quantityChange: number; reason: string } },
      options?: { onSuccess?: () => void },
    ) => {
      convexMutate({ id: params.id, quantityChange: params.data.quantityChange, reason: params.data.reason }).then(options?.onSuccess);
    },
    isPending: false,
  };
}

export function useListProductMovements(id: number) {
  return useConvexQuery(() => useQuery(api.products.listMovements, id ? { productId: id } : "skip"));
}

// Customers
export function useListCustomers(params?: { search?: string }) {
  return useConvexQuery(() => useQuery(api.customers.list, params?.search ? { search: params.search } : {}));
}

export function useGetCustomer(id: number) {
  const result = useQuery(api.customers.getById, id ? { id } : "skip");
  return { data: result as (Customer & { ledger: CustomerLedgerEntry[] }) | undefined, isLoading: result === undefined };
}

export function useCreateCustomer() {
  const convexMutate = useMutation(api.customers.create);
  return {
    mutate: (
      params: { data: CustomerInput },
      options?: { onSuccess?: (result: any) => void },
    ) => {
      convexMutate({ name: params.data.name, phone: params.data.phone }).then(options?.onSuccess);
    },
    isPending: false,
  };
}

export function useRecordCustomerPayment() {
  const convexMutate = useMutation(api.customers.recordPayment);
  return {
    mutate: (
      params: { id: number; data: { amountCents: number; note?: string } },
      options?: { onSuccess?: () => void },
    ) => {
      convexMutate({ customerId: params.id, amountCents: params.data.amountCents, note: params.data.note }).then(options?.onSuccess);
    },
    isPending: false,
  };
}

// Sales
export function useListSales(params?: { search?: string; status?: SaleStatus; paymentMethod?: PaymentMethod }) {
  return useConvexQuery(() => useQuery(api.sales.list, {
    search: params?.search, status: params?.status, paymentMethod: params?.paymentMethod,
  }));
}

export function useGetSale(id: number) {
  return useConvexQuery(() => useQuery(api.sales.getById, id ? { id } : "skip"));
}

export function useCreateSale() {
  const convexMutate = useMutation(api.sales.create);
  return {
    mutate: (
      params: { data: SaleInput },
      options?: { onSuccess?: () => void; onError?: (e: Error) => void },
    ) => {
      const d = params.data;
      convexMutate({
        items: d.items.map(i => ({ productId: i.productId, quantity: i.quantity })),
        payments: d.payments.map(p => ({ method: p.method, amountCents: p.amountCents })),
        discountCents: d.discountCents,
        customerId: d.customerId,
      }).then(options?.onSuccess).catch(options?.onError);
    },
    isPending: false,
  };
}

export function useVoidSale() {
  const convexMutate = useMutation(api.sales.voidSale);
  return {
    mutate: (
      params: { id: number; data: { reason: string } },
      options?: { onSuccess?: () => void; onError?: (e: Error) => void },
    ) => {
      convexMutate({ id: params.id, reason: params.data.reason }).then(options?.onSuccess).catch(options?.onError);
    },
    isPending: false,
  };
}

// Expenses
export function useListExpenses() {
  return useConvexQuery(() => useQuery(api.expenses.list));
}

export function useCreateExpense() {
  const convexMutate = useMutation(api.expenses.create);
  return {
    mutate: (
      params: { data: ExpenseInput },
      options?: { onSuccess?: () => void },
    ) => {
      convexMutate(params.data).then(options?.onSuccess);
    },
    isPending: false,
  };
}

export function useDeleteExpense() {
  const convexMutate = useMutation(api.expenses.remove);
  return {
    mutate: (id: number, options?: { onSuccess?: () => void }) => {
      convexMutate({ id }).then(options?.onSuccess);
    },
    isPending: false,
  };
}

// Dashboard
export function useGetDashboardSummary() {
  return useConvexQuery(() => useQuery(api.dashboard.getSummary));
}

// AI Reports
export function useListAiReports() {
  return useConvexQuery(() => useQuery(api.aiReports.list));
}

export function useGenerateAiReport() {
  const convexMutate = useMutation(api.aiReports.generate);
  return {
    mutate: (
      _args?: undefined,
      options?: { onSuccess?: () => void; onError?: (e: Error) => void },
    ) => {
      convexMutate({}).then(options?.onSuccess).catch(options?.onError);
    },
    isPending: false,
  };
}

// Backup
export async function exportBackup(): Promise<BackupBundle> {
  throw new Error('Backup not yet implemented with Convex');
}

export function useImportBackup() {
  return {
    mutate: (
      _params: { data: BackupBundle },
      options?: { onSuccess?: () => void; onError?: (e: Error) => void },
    ) => {
      options?.onError?.(new Error('Import not yet implemented with Convex'));
    },
    isPending: false,
  };
}
