'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  useListProducts,
  useListCustomers,
  useCreateSale,
  useGetSettings,
  useGetTodaySession,
  useOpenTodaySession,
  useCloseTodaySession,
} from '@/lib/hooks';
import { formatMoney, useDebouncedValue } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Banknote,
  ArrowRightLeft,
  UserCheck,
  CheckCircle2,
  Package as PackageIcon,
  ChevronLeft,
  ChevronRight,
  Play,
  Square,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import type { SaleInput } from '@/types';

interface CartItem {
  productId: number;
  name: string;
  unitPriceCents: number;
  quantity: number;
  maxStock: number;
}

type PaymentMethod = 'cash' | 'transfer' | 'card' | 'credit';

const PAGE_SIZE = 50;

export default function POS() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 250);
  const [page, setPage] = useState(0);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discountCents, setDiscountCents] = useState(0);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);

  const { data: products, isLoading: productsLoading } = useListProducts();
  const { data: customers } = useListCustomers();
  const { data: settings } = useGetSettings();
  const { data: todaySession, isLoading: sessionLoading } = useGetTodaySession();
  const openSession = useOpenTodaySession();
  const closeSession = useCloseTodaySession();

  const isOpen = todaySession?.status === 'open';

  const createSale = useCreateSale();
  const { toast } = useToast();

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    if (!debouncedSearch) return products;
    const lowerSearch = debouncedSearch.toLowerCase();
    return products.filter(p =>
      p.name.toLowerCase().includes(lowerSearch) ||
      p.barcode?.toLowerCase().includes(lowerSearch) ||
      p.categoryName.toLowerCase().includes(lowerSearch)
    );
  }, [products, debouncedSearch]);

  const totalPages = Math.ceil(filteredProducts.length / PAGE_SIZE);
  const pagedProducts = useMemo(() => {
    return filteredProducts.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  }, [filteredProducts, page]);

  useEffect(() => {
    setPage(0);
  }, [debouncedSearch]);

  const subtotal = cart.reduce((acc, item) => acc + (item.unitPriceCents * item.quantity), 0);
  const total = Math.max(0, subtotal - discountCents);

  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        if (existing.quantity >= product.stockLevel) {
          toast({ title: 'Not enough stock', variant: 'destructive' });
          return prev;
        }
        return prev.map(item => item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      if (product.stockLevel <= 0) {
        toast({ title: 'Out of stock', variant: 'destructive' });
        return prev;
      }
      return [...prev, {
        productId: product.id,
        name: product.name,
        unitPriceCents: product.sellingPriceCents,
        quantity: 1,
        maxStock: product.stockLevel,
      }];
    });
  };

  const updateQuantity = (productId: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.productId === productId) {
        const newQ = item.quantity + delta;
        if (newQ > item.maxStock) {
          toast({ title: 'Not enough stock', variant: 'destructive' });
          return item;
        }
        return { ...item, quantity: Math.max(1, newQ) };
      }
      return item;
    }));
  };

  const removeFromCart = (productId: number) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    if (paymentMethod === 'credit' && !selectedCustomerId) {
      toast({ title: 'Select a customer for credit sales', variant: 'destructive' });
      return;
    }

    const payload: SaleInput = {
      items: cart.map(i => ({ productId: i.productId, quantity: i.quantity })),
      payments: [{ method: paymentMethod, amountCents: total }],
      discountCents: discountCents || undefined,
      customerId: paymentMethod === 'credit' ? selectedCustomerId || undefined : undefined,
      sessionId: todaySession?.id,
    };

    createSale.mutate(payload).then(() => {
      toast({ title: 'Sale completed successfully!' });
      setCart([]);
      setDiscountCents(0);
      setCheckoutOpen(false);
    }).catch((err) => {
      toast({ title: 'Failed to complete sale', description: String(err), variant: 'destructive' });
    });
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col gap-4 overflow-hidden">
      <div className="shrink-0 flex items-center justify-between gap-4 p-4 bg-card border border-border/50 rounded-xl shadow-sm">
        <div className="flex items-center gap-4">
          <div className={`w-3 h-3 rounded-full ${sessionLoading ? 'bg-muted animate-pulse' : isOpen ? 'bg-green-500' : 'bg-red-500'}`} />
          <div>
            <p className="text-sm font-semibold">
              {sessionLoading ? 'Loading...' : isOpen ? 'Sales Open' : 'Sales Closed'}
            </p>
            <p className="text-xs text-muted-foreground">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </p>
          </div>
        </div>

        {!sessionLoading && (
          <div className="flex items-center gap-2 min-w-0 flex-shrink">
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Revenue</p>
              <p className="font-mono font-bold text-xs sm:text-sm">{formatMoney(todaySession?.totalSalesCents ?? 0)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Profit</p>
              <p className={`font-mono font-bold text-xs sm:text-sm ${(todaySession?.totalProfitCents ?? 0) >= 0 ? 'text-green-600' : 'text-destructive'}`}>
                {formatMoney(todaySession?.totalProfitCents ?? 0)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Txns</p>
              <p className="font-mono font-bold text-xs sm:text-sm">{todaySession?.saleCount ?? 0}</p>
            </div>
            {isOpen ? (
              <Button variant="outline" size="sm" onClick={() => closeSession.mutate()} disabled={closeSession.isPending}>
                <Square className="w-4 h-4 mr-1.5 text-red-500" />
                Close Sales
              </Button>
            ) : (
              <Button size="sm" onClick={() => openSession.mutate()} disabled={openSession.isPending}>
                <Play className="w-4 h-4 mr-1.5" />
                Open Sales
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-6 flex-1 min-h-0">
      <div className="max-md:h-[55%] max-md:flex-none flex-1 flex flex-col min-h-0 min-w-0 bg-card border border-border/50 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border/50 bg-muted/20 shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, barcode, category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-background"
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4">
            {productsLoading ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-muted-foreground border-b border-border/50">
                    <th className="text-left font-medium py-2 px-3">Item</th>
                    <th className="text-left font-medium py-2 px-3 hidden sm:table-cell">Category</th>
                    <th className="text-right font-medium py-2 px-3">Price</th>
                    <th className="text-right font-medium py-2 px-3">Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <tr key={i} className="border-b border-border/25">
                      <td className="py-2.5 px-3"><div className="h-4 bg-muted animate-pulse rounded w-32" /></td>
                      <td className="py-2.5 px-3 hidden sm:table-cell"><div className="h-4 bg-muted animate-pulse rounded w-20" /></td>
                      <td className="py-2.5 px-3 text-right"><div className="h-4 bg-muted animate-pulse rounded w-16 ml-auto" /></td>
                      <td className="py-2.5 px-3 text-right"><div className="h-4 bg-muted animate-pulse rounded w-10 ml-auto" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-muted-foreground py-20">
                <PackageIcon className="w-12 h-12 mb-4 opacity-20" />
                <p>No products found</p>
              </div>
            ) : (
              <>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-muted-foreground border-b border-border/50">
                      <th className="text-left font-medium py-2 px-3">Item</th>
                      <th className="text-left font-medium py-2 px-3 hidden sm:table-cell">Category</th>
                      <th className="text-right font-medium py-2 px-3">Price</th>
                      <th className="text-right font-medium py-2 px-3">Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedProducts.map(product => (
                      <tr
                        key={product.id}
                        onClick={() => addToCart(product)}
                        className={`border-b border-border/25 cursor-pointer transition-colors hover:bg-muted/40 active:bg-muted/60 ${
                          product.stockLevel <= 0 ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        <td className="py-2.5 px-3 font-medium truncate max-w-[200px]">{product.name}</td>
                        <td className="py-2.5 px-3 text-muted-foreground hidden sm:table-cell">{product.categoryName}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-semibold">{formatMoney(product.sellingPriceCents)}</td>
                        <td className="py-2.5 px-3 text-right">
                          {product.stockLevel <= 0 ? (
                            <span className="text-destructive text-xs font-medium">Out of Stock</span>
                          ) : product.isLowStock ? (
                            <span className="text-orange-500 text-xs font-mono">{product.stockLevel}</span>
                          ) : (
                            <span className="text-muted-foreground text-xs font-mono">{product.stockLevel}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-3 px-1">
                    <p className="text-xs text-muted-foreground">
                      {filteredProducts.length} item{filteredProducts.length !== 1 ? 's' : ''}
                    </p>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setPage(p => Math.max(0, p - 1))}
                        disabled={page === 0}
                        className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-muted disabled:opacity-30 transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <span className="text-xs text-muted-foreground px-2 min-w-[60px] text-center tabular-nums">
                        {page + 1} / {totalPages}
                      </span>
                      <button
                        onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                        disabled={page >= totalPages - 1}
                        className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-muted disabled:opacity-30 transition-colors"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </ScrollArea>
      </div>

      <div className="w-full md:w-[380px] lg:w-[420px] flex flex-col bg-card border border-border/50 rounded-xl shadow-sm shrink-0 max-md:flex-1 max-md:min-h-0 overflow-hidden">
        <div className="p-4 border-b border-border/50 bg-primary text-primary-foreground rounded-t-xl">
          <div className="flex items-center gap-2 font-semibold">
            <ShoppingCart className="w-5 h-5" />
            Current Sale
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4">
            {cart.length === 0 ? (
              <div className="flex items-center justify-center text-muted-foreground min-h-[200px]">
                <div className="flex flex-col items-center">
                  <ShoppingCart className="w-12 h-12 mb-4 opacity-20" />
                  <p>Cart is empty</p>
                  <p className="text-sm mt-1 opacity-70">Click products to add them</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map(item => (
                  <div key={item.productId} className="flex flex-col gap-2 p-3 bg-muted/20 border border-border/50 rounded-lg">
                    <div className="flex justify-between items-start">
                      <span className="font-medium text-sm max-w-[200px] truncate" title={item.name}>{item.name}</span>
                      <button onClick={() => removeFromCart(item.productId)} className="text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <div className="flex items-center gap-2 bg-background border border-border/50 rounded-md p-0.5">
                        <button
                          onClick={() => updateQuantity(item.productId, -1)}
                          className="w-7 h-7 flex items-center justify-center hover:bg-muted rounded"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center font-mono text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, 1)}
                          className="w-7 h-7 flex items-center justify-center hover:bg-muted rounded"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="font-mono font-bold text-sm">
                        {formatMoney(item.unitPriceCents * item.quantity)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="shrink-0 border-t border-border/50 p-4 space-y-2 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal</span>
            <span className="font-mono">{formatMoney(subtotal)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Discount</span>
            <div className="w-20 md:w-24">
              <Input
                type="number"
                min="0"
                step="0.01"
                value={discountCents === 0 ? '' : (discountCents / 100).toFixed(2)}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  if (isNaN(val)) setDiscountCents(0);
                  else setDiscountCents(Math.round(val * 100));
                }}
                className="h-7 md:h-8 text-right font-mono text-xs md:text-sm"
                placeholder="0.00"
              />
            </div>
          </div>
          <Separator className="my-2" />
          <div className="flex justify-between font-bold text-lg md:text-xl">
            <span>Total</span>
            <span className="font-mono text-primary">{formatMoney(total)}</span>
          </div>
          <Button
            className="w-full h-11 md:h-14 text-base md:text-lg font-bold"
            size="lg"
            disabled={cart.length === 0}
            onClick={() => setCheckoutOpen(true)}
          >
            Charge {formatMoney(total)}
          </Button>
        </div>
      </div>

      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Complete Sale</DialogTitle>
            <DialogDescription>
              Select payment method to finish checkout.
            </DialogDescription>
          </DialogHeader>

          <div className="py-6 space-y-6">
            <div className="flex justify-center mb-6">
              <div className="text-4xl font-black font-mono tracking-tighter text-primary">
                {formatMoney(total)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setPaymentMethod('cash')}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                  paymentMethod === 'cash' ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:border-primary/50 text-muted-foreground hover:text-foreground'
                }`}
              >
                <Banknote className="w-8 h-8 mb-2" />
                <span className="font-semibold">Cash</span>
              </button>
              <button
                onClick={() => setPaymentMethod('transfer')}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                  paymentMethod === 'transfer' ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:border-primary/50 text-muted-foreground hover:text-foreground'
                }`}
              >
                <ArrowRightLeft className="w-8 h-8 mb-2" />
                <span className="font-semibold">Transfer</span>
              </button>
              <button
                onClick={() => setPaymentMethod('card')}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                  paymentMethod === 'card' ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:border-primary/50 text-muted-foreground hover:text-foreground'
                }`}
              >
                <CreditCard className="w-8 h-8 mb-2" />
                <span className="font-semibold">Card</span>
              </button>
              <button
                onClick={() => setPaymentMethod('credit')}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                  paymentMethod === 'credit' ? 'border-orange-500 bg-orange-500/5 text-orange-600 dark:text-orange-400' : 'border-border hover:border-orange-500/50 text-muted-foreground hover:text-foreground'
                }`}
              >
                <UserCheck className="w-8 h-8 mb-2" />
                <span className="font-semibold">Credit</span>
              </button>
            </div>

            {paymentMethod === 'credit' && (
              <div className="space-y-3 animate-in fade-in slide-in-from-top-2 pt-2 border-t border-border">
                <Label>Select Customer for Credit</Label>
                <select
                  className="w-full flex h-10 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  value={selectedCustomerId || ''}
                  onChange={(e) => setSelectedCustomerId(e.target.value ? Number(e.target.value) : null)}
                >
                  <option value="">-- Choose a customer --</option>
                  {customers?.map(c => (
                    <option key={c.id} value={c.id}>{c.name} (Bal: {formatMoney(c.balanceCents)})</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCheckoutOpen(false)}>Cancel</Button>
            <Button onClick={handleCheckout} disabled={createSale.isPending} className="w-full sm:w-auto font-bold gap-2">
              {createSale.isPending ? <div className="w-4 h-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              Confirm Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </div>
  );
}
