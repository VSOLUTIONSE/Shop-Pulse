import type {
  Settings, Product, Category, Customer, CustomerDetail,
  CustomerLedgerEntry, Sale, SaleItem, SalePayment, Expense,
  AiReport, DashboardSummary, StockMovement, RevenuePoint,
  BackupBundle,
} from '@/types';

export const mockSettings: Settings = {
  id: 1,
  shopName: 'SalesPulse',
  ownerLabel: 'Owner',
  attendantLabel: 'Attendant',
  activeRole: 'owner',
  lowStockThreshold: 5,
};

export const mockCategories: Category[] = [
  { id: 1, name: 'Beverages' },
  { id: 2, name: 'Snacks' },
  { id: 3, name: 'Groceries' },
  { id: 4, name: 'Household' },
  { id: 5, name: 'Personal Care' },
];

export const mockProducts: Product[] = [
  { id: 1, name: 'Coca-Cola 500ml', categoryId: 1, categoryName: 'Beverages', barcode: '4901234567890', sellingPriceCents: 15000, costPriceCents: 9000, stockLevel: 48, lowStockThreshold: 5, isLowStock: false, createdAt: new Date('2026-01-15'), updatedAt: new Date('2026-07-10') },
  { id: 2, name: 'Pepsi 500ml', categoryId: 1, categoryName: 'Beverages', barcode: '4901234567891', sellingPriceCents: 15000, costPriceCents: 9000, stockLevel: 3, lowStockThreshold: 5, isLowStock: true, createdAt: new Date('2026-01-15'), updatedAt: new Date('2026-07-14') },
  { id: 3, name: 'Bottled Water 1L', categoryId: 1, categoryName: 'Beverages', barcode: '4901234567892', sellingPriceCents: 10000, costPriceCents: 5000, stockLevel: 120, lowStockThreshold: 10, isLowStock: false, createdAt: new Date('2026-01-20'), updatedAt: new Date('2026-07-12') },
  { id: 4, name: 'Lays Classic Chips', categoryId: 2, categoryName: 'Snacks', barcode: '4901234567893', sellingPriceCents: 20000, costPriceCents: 12000, stockLevel: 25, lowStockThreshold: 5, isLowStock: false, createdAt: new Date('2026-02-01'), updatedAt: new Date('2026-07-13') },
  { id: 5, name: 'Oreo Cookies 300g', categoryId: 2, categoryName: 'Snacks', barcode: '4901234567894', sellingPriceCents: 25000, costPriceCents: 15000, stockLevel: 2, lowStockThreshold: 5, isLowStock: true, createdAt: new Date('2026-02-01'), updatedAt: new Date('2026-07-14') },
  { id: 6, name: 'White Rice 5kg', categoryId: 3, categoryName: 'Groceries', barcode: '4901234567895', sellingPriceCents: 55000, costPriceCents: 40000, stockLevel: 15, lowStockThreshold: 3, isLowStock: false, createdAt: new Date('2026-03-01'), updatedAt: new Date('2026-07-10') },
  { id: 7, name: 'Cooking Oil 2L', categoryId: 3, categoryName: 'Groceries', barcode: '4901234567896', sellingPriceCents: 35000, costPriceCents: 25000, stockLevel: 8, lowStockThreshold: 3, isLowStock: false, createdAt: new Date('2026-03-01'), updatedAt: new Date('2026-07-11') },
  { id: 8, name: 'Dish Soap 500ml', categoryId: 4, categoryName: 'Household', barcode: '4901234567897', sellingPriceCents: 12000, costPriceCents: 7000, stockLevel: 20, lowStockThreshold: 5, isLowStock: false, createdAt: new Date('2026-04-01'), updatedAt: new Date('2026-07-09') },
  { id: 9, name: 'Toothpaste 100g', categoryId: 5, categoryName: 'Personal Care', barcode: '4901234567898', sellingPriceCents: 18000, costPriceCents: 10000, stockLevel: 30, lowStockThreshold: 5, isLowStock: false, createdAt: new Date('2026-04-15'), updatedAt: new Date('2026-07-08') },
  { id: 10, name: 'Shampoo 200ml', categoryId: 5, categoryName: 'Personal Care', barcode: '4901234567899', sellingPriceCents: 45000, costPriceCents: 28000, stockLevel: 12, lowStockThreshold: 3, isLowStock: false, createdAt: new Date('2026-05-01'), updatedAt: new Date('2026-07-12') },
];

export const mockCustomers: Customer[] = [
  { id: 1, name: 'John Doe', phone: '+2348012345678', balanceCents: 450000, createdAt: new Date('2026-03-15') },
  { id: 2, name: 'Jane Smith', phone: '+2348023456789', balanceCents: 120000, createdAt: new Date('2026-04-01') },
  { id: 3, name: 'Ahmed Musa', phone: '+2348034567890', balanceCents: 0, createdAt: new Date('2026-05-10') },
  { id: 4, name: 'Sarah Okafor', phone: '+2348045678901', balanceCents: 75000, createdAt: new Date('2026-06-01') },
];

export const mockLedgerEntries: Record<number, CustomerLedgerEntry[]> = {
  1: [
    { id: 1, customerId: 1, type: 'charge', amountCents: 300000, note: 'Purchase on credit', saleId: 1, createdAt: new Date('2026-07-10') },
    { id: 2, customerId: 1, type: 'payment', amountCents: 200000, note: 'Partial payment', saleId: null, createdAt: new Date('2026-07-12') },
    { id: 3, customerId: 1, type: 'charge', amountCents: 350000, note: 'More groceries', saleId: 3, createdAt: new Date('2026-07-14') },
  ],
  2: [
    { id: 4, customerId: 2, type: 'charge', amountCents: 150000, note: 'Weekend supplies', saleId: 2, createdAt: new Date('2026-07-11') },
    { id: 5, customerId: 2, type: 'payment', amountCents: 30000, note: 'Cash payment', saleId: null, createdAt: new Date('2026-07-13') },
  ],
  3: [],
  4: [
    { id: 6, customerId: 4, type: 'charge', amountCents: 75000, note: 'Snacks and drinks', saleId: 4, createdAt: new Date('2026-07-14') },
  ],
};

function makeSaleItem(product: Product, qty: number): SaleItem {
  return {
    id: Math.floor(Math.random() * 1000),
    productId: product.id,
    productName: product.name,
    quantity: qty,
    unitPriceCents: product.sellingPriceCents,
    lineTotalCents: product.sellingPriceCents * qty,
  };
}

function makePayment(method: 'cash' | 'transfer' | 'card' | 'credit', amount: number): SalePayment {
  return { id: Math.floor(Math.random() * 1000), method, amountCents: amount };
}

export const mockSales: Sale[] = [
  {
    id: 1, createdAt: new Date('2026-07-14T10:30:00'), operatorRole: 'owner', status: 'completed',
    items: [makeSaleItem(mockProducts[0], 2), makeSaleItem(mockProducts[4], 1)],
    payments: [makePayment('cash', 55000)], subtotalCents: 55000, discountCents: 0, totalCents: 55000,
    customerId: null, customerName: null, voidReason: null, voidedAt: null,
  },
  {
    id: 2, createdAt: new Date('2026-07-14T12:15:00'), operatorRole: 'attendant', status: 'completed',
    items: [makeSaleItem(mockProducts[3], 3), makeSaleItem(mockProducts[2], 2)],
    payments: [makePayment('transfer', 80000)], subtotalCents: 80000, discountCents: 0, totalCents: 80000,
    customerId: null, customerName: null, voidReason: null, voidedAt: null,
  },
  {
    id: 3, createdAt: new Date('2026-07-14T14:00:00'), operatorRole: 'owner', status: 'completed',
    items: [makeSaleItem(mockProducts[5], 1), makeSaleItem(mockProducts[6], 2)],
    payments: [makePayment('credit', 125000)], subtotalCents: 125000, discountCents: 0, totalCents: 125000,
    customerId: 1, customerName: 'John Doe', voidReason: null, voidedAt: null,
  },
  {
    id: 4, createdAt: new Date('2026-07-14T16:45:00'), operatorRole: 'owner', status: 'completed',
    items: [makeSaleItem(mockProducts[0], 1), makeSaleItem(mockProducts[3], 2), makeSaleItem(mockProducts[8], 1)],
    payments: [makePayment('cash', 68000)], subtotalCents: 73000, discountCents: 5000, totalCents: 68000,
    customerId: null, customerName: null, voidReason: null, voidedAt: null,
  },
  {
    id: 5, createdAt: new Date('2026-07-13T09:00:00'), operatorRole: 'attendant', status: 'voided',
    items: [makeSaleItem(mockProducts[1], 5)],
    payments: [makePayment('cash', 75000)], subtotalCents: 75000, discountCents: 0, totalCents: 75000,
    customerId: null, customerName: null, voidReason: 'Customer returned items', voidedAt: new Date('2026-07-13T11:00:00'),
  },
];

export const mockExpenses: Expense[] = [
  { id: 1, category: 'rent', description: 'Monthly rent', amountCents: 500000, expenseDate: '2026-07-01', createdAt: new Date('2026-07-01') },
  { id: 2, category: 'power', description: 'Electricity bill', amountCents: 85000, expenseDate: '2026-07-05', createdAt: new Date('2026-07-05') },
  { id: 3, category: 'staff', description: 'Staff salary - John', amountCents: 300000, expenseDate: '2026-07-10', createdAt: new Date('2026-07-10') },
  { id: 4, category: 'logistics', description: 'Stock transport fee', amountCents: 45000, expenseDate: '2026-07-12', createdAt: new Date('2026-07-12') },
  { id: 5, category: 'other', description: 'Cleaning supplies', amountCents: 15000, expenseDate: '2026-07-13', createdAt: new Date('2026-07-13') },
];

export const mockAiReports: AiReport[] = [
  { id: 1, title: 'Weekly Business Report', type: 'insight', model: 'grok-2', tokens: 523, promptTokens: 320, completionTokens: 203, createdAt: new Date('2026-07-10'), content: '**Weekly Business Report**\n\nYour business had a solid week with total revenue of ₦850,000 across 34 transactions. Beverages and snacks continue to be your top-performing categories, accounting for 62% of total sales.\n\n**Key Insights:**\n- Top seller: Coca-Cola 500ml (47 units sold)\n- Low stock alert: Oreo Cookies and Pepsi need restocking\n- Credit accounts: ₦645,000 outstanding across 4 customers\n- Expenses: ₦945,000 this month (rent is the biggest at 53%)\n\n**Recommendation:** Consider increasing your Pepsi order and following up with John Doe on his ₦450,000 outstanding balance.' },
  { id: 2, title: 'Weekly Business Report', type: 'insight', model: 'grok-2', tokens: 445, promptTokens: 310, completionTokens: 135, createdAt: new Date('2026-07-03'), content: '**Weekly Business Report**\n\nRevenue decreased by 12% compared to the previous week. This appears to be seasonal — the first week of the month is typically slower.\n\n**Key Insights:**\n- 28 transactions completed\n- Average transaction value: ₦21,400\n- Most profitable day: Saturday\n- No new credit accounts opened\n\n**Recommendation:** Run a weekend promotion on slow-moving household items to boost mid-month traffic.' },
];

export function generateRevenueChart(): RevenuePoint[] {
  const points: RevenuePoint[] = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    points.push({ date: dateStr, revenueCents: Math.floor(Math.random() * 200000) + 50000 });
  }
  return points;
}

export const mockStockMovements: StockMovement[] = [
  { id: 1, productId: 1, type: 'restock', quantityChange: 50, reason: 'Regular restock', referenceSaleId: null, createdAt: new Date('2026-07-10') },
  { id: 2, productId: 1, type: 'sale', quantityChange: -2, reason: null, referenceSaleId: 1, createdAt: new Date('2026-07-14') },
  { id: 3, productId: 5, type: 'correction', quantityChange: 2, reason: 'Found in back storage', referenceSaleId: null, createdAt: new Date('2026-07-13') },
];

export const mockDashboardSummary: DashboardSummary = {
  todayRevenueCents: 383000,
  activeDebtAccounts: 3,
  totalDebtCents: 645000,
  monthlyExpensesCents: 945000,
  todayProfitCents: 185000,
  lowStockProducts: mockProducts.filter(p => p.isLowStock),
  recentSales: mockSales.filter(s => s.status === 'completed').slice(0, 4),
  revenueChart: generateRevenueChart(),
};

export function generateBackupBundle(): BackupBundle {
  return {
    settings: [mockSettings],
    categories: mockCategories,
    products: mockProducts,
    customers: mockCustomers,
    sales: mockSales,
    expenses: mockExpenses,
  };
}
