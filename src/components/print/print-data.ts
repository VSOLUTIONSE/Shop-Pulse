import type { PaymentMethod, Role, Sale, Settings } from '@/types';

export interface PrintShop {
  name: string;
  phone?: string;
  address?: string;
  tinVat?: string;
}

export interface PrintItem {
  productName: string;
  quantity: number;
  unitPriceCents: number;
  lineTotalCents: number;
}

export interface PrintPayment {
  method: PaymentMethod;
  amountCents: number;
}

export interface PrintData {
  saleId: number;
  date: string;
  operatorRole: Role;
  shop: PrintShop;
  items: PrintItem[];
  subtotalCents: number;
  discountCents: number;
  totalCents: number;
  payments: PrintPayment[];
  customerName?: string;
}

export interface CartPrintItem {
  productId: number;
  name: string;
  unitPriceCents: number;
  quantity: number;
}

export function shopFromSettings(
  settings: Pick<Partial<Settings>, 'shopName' | 'phone' | 'address' | 'tinVat'>
): PrintShop {
  return {
    name: settings.shopName || 'SalesPulse',
    phone: settings.phone ?? undefined,
    address: settings.address ?? undefined,
    tinVat: settings.tinVat ?? undefined,
  };
}

export function saleToPrintData(sale: Sale, shop: PrintShop): PrintData {
  return {
    saleId: sale.id,
    date: sale.createdAt,
    operatorRole: sale.operatorRole,
    shop,
    items: sale.items.map((i) => ({
      productName: i.productName,
      quantity: i.quantity,
      unitPriceCents: i.unitPriceCents,
      lineTotalCents: i.lineTotalCents,
    })),
    subtotalCents: sale.subtotalCents,
    discountCents: sale.discountCents,
    totalCents: sale.totalCents,
    payments: sale.payments.map((p) => ({ method: p.method, amountCents: p.amountCents })),
    customerName: sale.customerName ?? undefined,
  };
}

export function cartToPrintData(args: {
  saleId: number;
  items: CartPrintItem[];
  discountCents: number;
  totalCents: number;
  paymentMethod: PaymentMethod;
  customerName?: string;
  operatorRole: Role;
  shop: PrintShop;
}): PrintData {
  const items: PrintItem[] = args.items.map((i) => ({
    productName: i.name,
    quantity: i.quantity,
    unitPriceCents: i.unitPriceCents,
    lineTotalCents: i.unitPriceCents * i.quantity,
  }));
  const subtotalCents = items.reduce((acc, i) => acc + i.lineTotalCents, 0);
  return {
    saleId: args.saleId,
    date: new Date().toISOString(),
    operatorRole: args.operatorRole,
    shop: args.shop,
    items,
    subtotalCents,
    discountCents: args.discountCents,
    totalCents: args.totalCents,
    payments: [{ method: args.paymentMethod, amountCents: args.totalCents }],
    customerName: args.customerName,
  };
}
