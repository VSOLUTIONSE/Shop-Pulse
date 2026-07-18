'use client';

import { useQuery, useMutation, useAction } from "convex/react";
import { useState, useCallback } from "react";
import { api } from "../../convex/_generated/api";
import type {
  ProductInput, ProductUpdate, CategoryInput, CustomerInput,
  CustomerLedgerEntry, SaleInput, SaleStatus, PaymentMethod,
  BackupBundle, ExpenseInput,
} from '@/types';

export function getListProductsQueryKey() { return ["products"] }

function useCq<T>(fn: () => T | undefined): { data: T | undefined; isLoading: boolean } {
  const data = fn();
  return { data, isLoading: data === undefined };
}

export function useGetSettings() {
  return useCq(() => useQuery(api.settings.get));
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

export function useListCategories() {
  return useCq(() => useQuery(api.categories.list));
}

export function useCreateCategory() {
  const mutate = useMutation(api.categories.create);
  return { mutate: (d: { name: string }) => mutate({ name: d.name }), isPending: false };
}

export function useDeleteCategory() {
  const mutate = useMutation(api.categories.remove);
  return { mutate: (id: number) => mutate({ id }), isPending: false };
}

export function useListProducts(params?: { search?: string }) {
  return useCq(() => useQuery(api.products.list, params?.search ? { search: params.search } : {}));
}

export function useGetProduct(id: number) {
  return useCq(() => useQuery(api.products.getById, id ? { id } : "skip"));
}

export function useCreateProduct() {
  const mutate = useMutation(api.products.create);
  return {
    mutate: (d: ProductInput) => mutate({
      name: d.name, categoryId: d.categoryId, barcode: d.barcode,
      sellingPriceCents: d.sellingPriceCents, costPriceCents: d.costPriceCents,
      stockLevel: d.stockLevel, lowStockThreshold: d.lowStockThreshold ?? 5,
    }),
    isPending: false,
  };
}

export function useUpdateProduct() {
  const mutate = useMutation(api.products.update);
  return { mutate: (id: number, d: ProductUpdate) => mutate({ id, ...d }), isPending: false };
}

export function useRestockProduct() {
  const mutate = useMutation(api.products.restock);
  return { mutate: (id: number, q: number, c: number) => mutate({ id, quantity: q, costPriceCents: c }), isPending: false };
}

export function useCorrectProductStock() {
  const mutate = useMutation(api.products.correctStock);
  return { mutate: (id: number, q: number, r: string) => mutate({ id, quantityChange: q, reason: r }), isPending: false };
}

export function useListProductMovements(id: number) {
  return useCq(() => useQuery(api.products.listMovements, id ? { productId: id } : "skip"));
}

export function useListCustomers(params?: { search?: string }) {
  return useCq(() => useQuery(api.customers.list, params?.search ? { search: params.search } : {}));
}

export function useGetCustomer(id: number) {
  return useCq(() => useQuery(api.customers.getById, id ? { id } : "skip"));
}

export function useCreateCustomer() {
  const mutate = useMutation(api.customers.create);
  return { mutate: (d: { name: string; phone?: string }) => mutate({ name: d.name, phone: d.phone }), isPending: false };
}

export function useRecordCustomerPayment() {
  const mutate = useMutation(api.customers.recordPayment);
  return { mutate: (id: number, a: number, n?: string) => mutate({ customerId: id, amountCents: a, note: n }), isPending: false };
}

export function useListSales(params?: { search?: string; status?: SaleStatus; paymentMethod?: PaymentMethod }) {
  return useCq(() => useQuery(api.sales.list, {
    search: params?.search, status: params?.status, paymentMethod: params?.paymentMethod,
  }));
}

export function useGetSale(id: number) {
  return useCq(() => useQuery(api.sales.getById, id ? { id } : "skip"));
}

const toSalePayload = (d: SaleInput) => ({
  items: d.items.map(i => ({ productId: i.productId, quantity: i.quantity })),
  payments: d.payments.map(p => ({ method: p.method, amountCents: p.amountCents })),
  discountCents: d.discountCents, customerId: d.customerId,
});

export function useCreateSale() {
  const mutate = useMutation(api.sales.create);
  return { mutate: (d: SaleInput) => mutate(toSalePayload(d)), isPending: false };
}

export function useVoidSale() {
  const mutate = useMutation(api.sales.voidSale);
  return { mutate: (id: number, reason: string) => mutate({ id, reason }), isPending: false };
}

export function useListExpenses() {
  return useCq(() => useQuery(api.expenses.list));
}

export function useCreateExpense() {
  const mutate = useMutation(api.expenses.create);
  return { mutate: (d: ExpenseInput) => mutate(d), isPending: false };
}

export function useDeleteExpense() {
  const mutate = useMutation(api.expenses.remove);
  return { mutate: (id: number) => mutate({ id }), isPending: false };
}

export function useGetDashboardSummary() {
  return useCq(() => useQuery(api.dashboard.getSummary));
}

export function useListAiReports() {
  return useCq(() => useQuery(api.aiReports.list));
}

export function useGenerateAiReport() {
  const act = useAction(api.aiReportsGenerate.generate);
  const [p, sp] = useState(false);
  const mutate = useCallback((cb?: () => void) => {
    sp(true);
    return act({}).then(() => cb?.()).finally(() => sp(false));
  }, [act]);
  return { mutate, isPending: p };
}

export function useListAiChatMessages() {
  return useCq(() => useQuery(api.aiChat.list));
}

export function useSendAiChatMessage() {
  const act = useAction(api.aiChat.chat);
  const [p, sp] = useState(false);
  const mutate = useCallback((msg: string, cb?: (r: { reply: string; model: string; tokens: number }) => void) => {
    sp(true);
    return act({ message: msg }).then((r) => cb?.(r as any)).finally(() => sp(false));
  }, [act]);
  return { mutate, isPending: p };
}

export async function exportBackup(): Promise<BackupBundle> {
  throw new Error('Backup not yet implemented with Convex');
}

export function useImportBackup() {
  return {
    mutate: (_data: BackupBundle, opts?: { onSuccess?: () => void; onError?: (e: Error) => void }) => {
      opts?.onError?.(new Error('Import not yet implemented with Convex'));
    },
    isPending: false,
  };
}
