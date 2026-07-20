'use client';

import { useState } from 'react';
import {
  useListSales,
  useVoidSale,
} from '@/lib/hooks';
import { formatMoney, formatDate, useDebouncedValue } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Search,
  Ban,
  Receipt,
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
import type { SaleStatus, PaymentMethod } from '@/types';

export default function Sales() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 250);
  const [statusFilter, setStatusFilter] = useState<SaleStatus | ''>('');
  const [paymentFilter, setPaymentFilter] = useState<PaymentMethod | ''>('');

  const [voidSaleId, setVoidSaleId] = useState<number | null>(null);
  const [voidReason, setVoidReason] = useState('');

  const { data: sales, isLoading } = useListSales({
    search: debouncedSearch || undefined,
    status: statusFilter as SaleStatus || undefined,
    paymentMethod: paymentFilter as PaymentMethod || undefined,
  });

  const voidSaleMutation = useVoidSale();
  const { toast } = useToast();

  const handleVoid = () => {
    if (!voidSaleId || !voidReason) return;

    voidSaleMutation.mutate(voidSaleId, voidReason)
      .then(() => {
        toast({ title: "Sale voided successfully", description: "Inventory and ledgers updated." });
        setVoidSaleId(null);
        setVoidReason('');
      })
      .catch((err) => {
        toast({ title: "Failed to void sale", description: String(err), variant: "destructive" });
      });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Sales Logs</h1>
        <p className="text-muted-foreground mt-1">View and manage transaction history.</p>
      </div>

      <Card className="border-border/50 shadow-sm">
        <div className="p-4 border-b border-border/50 bg-muted/20 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by ID, customer name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-background max-w-md"
            />
          </div>
          <div className="flex gap-2">
            <select
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
            >
              <option value="">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="voided">Voided</option>
            </select>
            <select
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value as any)}
            >
              <option value="">All Payments</option>
              <option value="cash">Cash</option>
              <option value="transfer">Transfer</option>
              <option value="card">Card</option>
              <option value="credit">Credit</option>
            </select>
          </div>
        </div>

        <div className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={8} className="h-16 text-center">
                      <div className="h-4 w-full bg-muted animate-pulse rounded" />
                    </TableCell>
                  </TableRow>
                ))
              ) : sales?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                    <Receipt className="w-8 h-8 mx-auto mb-2 opacity-20" />
                    No sales found matching your criteria.
                  </TableCell>
                </TableRow>
              ) : (
                sales?.map(sale => (
                  <TableRow key={sale.id} className={sale.status === 'voided' ? 'opacity-60 bg-muted/10' : ''}>
                    <TableCell className="font-mono font-medium">#{sale.id.toString().padStart(4, '0')}</TableCell>
                    <TableCell className="text-sm">{formatDate(sale.createdAt)}</TableCell>
                    <TableCell>{sale.customerName || <span className="text-muted-foreground italic">Walk-in</span>}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {sale.items.length} items
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {sale.payments.map(p => (
                          <Badge key={p.id} variant="secondary" className="text-[10px] capitalize">
                            {p.method}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold">
                      {formatMoney(sale.totalCents)}
                    </TableCell>
                    <TableCell className="text-center">
                      {sale.status === 'completed' ? (
                        <Badge className="bg-green-500/10 text-green-700 hover:bg-green-500/20 border-transparent dark:text-green-400">Completed</Badge>
                      ) : (
                        <Badge variant="destructive" className="bg-destructive/10 text-destructive hover:bg-destructive/20 border-transparent">Voided</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {sale.status === 'completed' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setVoidSaleId(sale.id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 px-2"
                        >
                          <Ban className="w-4 h-4 mr-1" /> Void
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Dialog open={!!voidSaleId} onOpenChange={(open) => !open && setVoidSaleId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <Ban className="w-5 h-5" /> Void Sale #{voidSaleId?.toString().padStart(4, '0')}
            </DialogTitle>
            <DialogDescription>
              This is a serious action. It will reverse the revenue, restock the inventory, and reverse any credit assigned. The record will remain visible but marked as voided.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-3">
            <Label htmlFor="voidReason">Reason for voiding (Required)</Label>
            <Input
              id="voidReason"
              placeholder="e.g. Customer returned items, entered wrong amount..."
              value={voidReason}
              onChange={e => setVoidReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setVoidSaleId(null)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={handleVoid}
              disabled={!voidReason || voidSaleMutation.isPending}
            >
              {voidSaleMutation.isPending ? 'Processing...' : 'Confirm Void'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
