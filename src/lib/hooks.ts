'use client';

import { useQuery, useMutation, useAction } from "convex/react";
import { useState, useCallback } from "react";
import { api } from "../../convex/_generated/api";
import type {
  Product, ProductInput, ProductUpdate,
  SaleInput, SaleStatus, PaymentMethod,
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
  const mutate = useMutation(api.settings.update);
  return {
    mutate: (d: { shopName?: string; ownerLabel?: string; attendantLabel?: string; activeRole?: 'owner' | 'attendant'; lowStockThreshold?: number }) => mutate(d),
    isPending: false,
  };
}

export function useListCategories() {
  return useCq(() => useQuery(api.categories.list));
}

export function useCreateCategory() {
  const mutate = useMutation(api.categories.create).withOptimisticUpdate((ls, args) => {
    const cur = ls.getQuery(api.categories.list, {});
    if (cur !== undefined) {
      ls.setQuery(api.categories.list, {}, [...cur, { id: -Date.now(), name: args.name }]);
    }
  });
  return { mutate: (d: { name: string }) => mutate({ name: d.name }), isPending: false };
}

export function useDeleteCategory() {
  const mutate = useMutation(api.categories.remove).withOptimisticUpdate((ls, args) => {
    const cur = ls.getQuery(api.categories.list, {});
    if (cur !== undefined) {
      ls.setQuery(api.categories.list, {}, cur.filter(c => c.id !== args.id));
    }
  });
  return { mutate: (id: number) => mutate({ id }), isPending: false };
}

export function useListProducts(params?: { search?: string }) {
  return useCq(() => useQuery(api.products.list, params?.search ? { search: params.search } : {}));
}

export function useGetProduct(id: number) {
  return useCq(() => useQuery(api.products.getById, id ? { id } : "skip"));
}

export function useCreateProduct() {
  const mutate = useMutation(api.products.create).withOptimisticUpdate((ls, args) => {
    const cur = ls.getQuery(api.products.list, {});
    if (cur !== undefined) {
      ls.setQuery(api.products.list, {}, [...cur, {
        id: -Date.now(), name: args.name, categoryId: args.categoryId,
        categoryName: '', barcode: args.barcode ?? null,
        sellingPriceCents: args.sellingPriceCents,
        costPriceCents: args.costPriceCents ?? null,
        stockLevel: args.stockLevel, lowStockThreshold: args.lowStockThreshold,
        isLowStock: args.stockLevel <= args.lowStockThreshold,
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      } as Product]);
    }
  });
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
  const mutate = useMutation(api.products.update).withOptimisticUpdate((ls, args) => {
    const cur = ls.getQuery(api.products.list, {});
    if (cur !== undefined) {
      ls.setQuery(api.products.list, {}, cur.map(p =>
        p.id === args.id ? { ...p, ...args } as unknown as Product : p
      ));
    }
  });
  return { mutate: (id: number, d: ProductUpdate) => mutate({ id, ...d }), isPending: false };
}

export function useDeleteProduct() {
  const mutate = useMutation(api.products.remove).withOptimisticUpdate((ls, args) => {
    const cur = ls.getQuery(api.products.list, {});
    if (cur !== undefined) {
      ls.setQuery(api.products.list, {}, cur.filter(p => p.id !== args.id));
    }
  });
  return { mutate: (id: number) => mutate({ id }), isPending: false };
}

export function useRestockProduct() {
  const mutate = useMutation(api.products.restock).withOptimisticUpdate((ls, args) => {
    const cur = ls.getQuery(api.products.list, {});
    if (cur !== undefined) {
      ls.setQuery(api.products.list, {}, cur.map(p =>
        p.id === args.id
          ? { ...p, stockLevel: p.stockLevel + args.quantity, costPriceCents: args.costPriceCents }
          : p
      ));
    }
  });
  return { mutate: (id: number, q: number, c: number) => mutate({ id, quantity: q, costPriceCents: c }), isPending: false };
}

export function useCorrectProductStock() {
  const mutate = useMutation(api.products.correctStock).withOptimisticUpdate((ls, args) => {
    const cur = ls.getQuery(api.products.list, {});
    if (cur !== undefined) {
      ls.setQuery(api.products.list, {}, cur.map(p =>
        p.id === args.id
          ? { ...p, stockLevel: p.stockLevel + args.quantityChange }
          : p
      ));
    }
  });
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
  const mutate = useMutation(api.customers.create).withOptimisticUpdate((ls, args) => {
    const cur = ls.getQuery(api.customers.list, {});
    if (cur !== undefined) {
      ls.setQuery(api.customers.list, {}, [...cur, {
        id: -Date.now(), name: args.name, phone: args.phone ?? null,
        balanceCents: 0, createdAt: new Date().toISOString(),
      }]);
    }
  });
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
  discountCents: d.discountCents, customerId: d.customerId, sessionId: d.sessionId,
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
  const mutate = useMutation(api.expenses.create).withOptimisticUpdate((ls, args) => {
    const cur = ls.getQuery(api.expenses.list, {});
    if (cur !== undefined) {
      ls.setQuery(api.expenses.list, {}, [...cur, {
        id: -Date.now(), category: args.category, description: args.description,
        amountCents: args.amountCents, expenseDate: args.expenseDate,
        createdAt: new Date().toISOString(),
      }]);
    }
  });
  return { mutate: (d: ExpenseInput) => mutate(d), isPending: false };
}

export function useDeleteExpense() {
  const mutate = useMutation(api.expenses.remove).withOptimisticUpdate((ls, args) => {
    const cur = ls.getQuery(api.expenses.list, {});
    if (cur !== undefined) {
      ls.setQuery(api.expenses.list, {}, cur.filter(e => e.id !== args.id));
    }
  });
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

export function useGetTodaySession() {
  return useCq(() => useQuery(api.dailySessions.getToday));
}

export function useOpenTodaySession() {
  const mutate = useMutation(api.dailySessions.open).withOptimisticUpdate((ls) => {
    const cur: any = ls.getQuery(api.dailySessions.getToday, {});
    if (cur) {
      ls.setQuery(api.dailySessions.getToday, {}, {
        ...cur, status: 'open', closedAt: null,
      });
    }
  });
  const [p, sp] = useState(false);
  const m = useCallback(() => {
    sp(true);
    return mutate({}).finally(() => sp(false));
  }, [mutate]);
  return { mutate: m, isPending: p };
}

export function useCloseTodaySession() {
  const mutate = useMutation(api.dailySessions.close).withOptimisticUpdate((ls) => {
    const cur: any = ls.getQuery(api.dailySessions.getToday, {});
    if (cur) {
      ls.setQuery(api.dailySessions.getToday, {}, {
        ...cur, status: 'closed', closedAt: Date.now(),
      });
    }
  });
  const [p, sp] = useState(false);
  const m = useCallback(() => {
    sp(true);
    return mutate({}).finally(() => sp(false));
  }, [mutate]);
  return { mutate: m, isPending: p };
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
