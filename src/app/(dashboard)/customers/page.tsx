'use client';

import { useState } from 'react';
import {
  useListCustomers,
  useCreateCustomer,
  useGetCustomer,
  useRecordCustomerPayment,
} from '@/lib/hooks';
import { formatMoney, formatDate } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  UserPlus,
  Phone,
  ArrowRight,
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';

export default function Customers() {
  const [search, setSearch] = useState('');
  const [activeCustomerId, setActiveCustomerId] = useState<number | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  const [formData, setFormData] = useState({ name: '', phone: '' });
  const [paymentData, setPaymentData] = useState({ amount: '', note: '' });

  const { data: customers, isLoading: customersLoading } = useListCustomers({ search: search || undefined });
  const { data: customerDetail, isLoading: detailLoading } = useGetCustomer(activeCustomerId as number);

  const createCustomer = useCreateCustomer();
  const recordPayment = useRecordCustomerPayment();
  const { toast } = useToast();

  const handleCreate = () => {
    createCustomer.mutate({ name: formData.name, phone: formData.phone || undefined }).then((newCust) => {
      toast({ title: "Customer registered" });
      setCreateModalOpen(false);
      setFormData({ name: '', phone: '' });
      setActiveCustomerId((newCust as any).id);
    });
  };

  const handlePayment = () => {
    if (!activeCustomerId) return;
    recordPayment.mutate(
      activeCustomerId,
      Math.round(Number(paymentData.amount) * 100),
      paymentData.note || undefined
    ).then(() => {
      toast({ title: "Payment recorded successfully" });
      setPaymentModalOpen(false);
      setPaymentData({ amount: '', note: '' });
    });
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col md:flex-row gap-6">
      <div className="w-full md:w-[350px] lg:w-[400px] flex flex-col bg-card border border-border/50 rounded-xl shadow-sm shrink-0">
        <div className="p-4 border-b border-border/50 bg-muted/10 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-semibold text-lg">Customer Registry</h2>
            <Button size="sm" onClick={() => setCreateModalOpen(true)}>
              <UserPlus className="w-4 h-4 mr-2" /> New
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search customers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-background"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto p-3 space-y-2">
          {customersLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
            ))
          ) : customers?.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground pt-10">
              <Wallet className="w-12 h-12 mb-4 opacity-20" />
              <p>No customers found</p>
            </div>
          ) : (
            customers?.map(customer => (
              <button
                key={customer.id}
                onClick={() => setActiveCustomerId(customer.id)}
                className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all text-left ${
                  activeCustomerId === customer.id
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-border/50 hover:border-border hover:bg-muted/30'
                }`}
              >
                <div className="flex flex-col overflow-hidden mr-3">
                  <span className="font-semibold truncate">{customer.name}</span>
                  {customer.phone && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3" /> {customer.phone}
                    </span>
                  )}
                </div>
                <div className="flex flex-col items-end shrink-0">
                  <span className={`font-mono font-bold ${customer.balanceCents > 0 ? 'text-orange-600 dark:text-orange-400' : 'text-muted-foreground'}`}>
                    {formatMoney(customer.balanceCents)}
                  </span>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Balance</span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0 bg-card border border-border/50 rounded-xl shadow-sm overflow-hidden">
        {!activeCustomerId ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground bg-muted/5">
            <ArrowRight className="w-12 h-12 mb-4 opacity-20 hidden md:block" />
            <p>Select a customer to view their ledger</p>
          </div>
        ) : detailLoading ? (
          <div className="p-8 space-y-8">
            <div className="h-20 bg-muted animate-pulse rounded-lg" />
            <div className="h-64 bg-muted animate-pulse rounded-lg" />
          </div>
        ) : customerDetail && (
          <>
            <div className="p-6 border-b border-border/50 bg-gradient-to-r from-muted/30 to-background flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold">{customerDetail.name}</h2>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  {customerDetail.phone && <span className="flex items-center gap-1.5"><Phone className="w-4 h-4" /> {customerDetail.phone}</span>}
                  <span>Customer since {formatDate(customerDetail.createdAt).split(',')[0]}</span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">Current Debt</span>
                <span className={`text-4xl font-mono font-black tracking-tighter ${customerDetail.balanceCents > 0 ? 'text-orange-600 dark:text-orange-400' : 'text-primary'}`}>
                  {formatMoney(customerDetail.balanceCents)}
                </span>
                {customerDetail.balanceCents > 0 && (
                  <Button className="mt-4" onClick={() => setPaymentModalOpen(true)}>
                    Record Payment
                  </Button>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-auto p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                Ledger History
              </h3>

              {customerDetail.ledger.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground border-2 border-dashed border-border rounded-xl">
                  No transactions on record for this customer.
                </div>
              ) : (
                <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                  {customerDetail.ledger.map((entry: any) => (
                    <div key={entry.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-card shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                        {entry.type === 'charge' ? (
                          <ArrowUpRight className="w-4 h-4 text-orange-500" />
                        ) : (
                          <ArrowDownLeft className="w-4 h-4 text-green-500" />
                        )}
                      </div>

                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] border border-border/50 bg-background p-4 rounded-xl shadow-sm">
                        <div className="flex justify-between items-start mb-1">
                          <Badge variant={entry.type === 'charge' ? 'outline' : 'secondary'} className={entry.type === 'charge' ? 'text-orange-600 border-orange-200 bg-orange-50' : 'bg-green-100 text-green-800'}>
                            {entry.type === 'charge' ? 'Credit Purchase' : 'Payment Received'}
                          </Badge>
                          <span className={`font-mono font-bold text-lg ${entry.type === 'charge' ? 'text-orange-600 dark:text-orange-400' : 'text-green-600 dark:text-green-500'}`}>
                            {entry.type === 'charge' ? '+' : '-'}{formatMoney(entry.amountCents)}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground mb-2">{formatDate(entry.createdAt)}</div>
                        {(entry.note || entry.saleId) && (
                          <div className="text-sm border-t border-border/50 pt-2 mt-2">
                            {entry.saleId && <span className="font-mono text-muted-foreground mr-2">Sale #{entry.saleId.toString().padStart(4, '0')}</span>}
                            {entry.note}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Register Customer</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="grid gap-2">
              <Label>Full Name</Label>
              <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="John Doe" />
            </div>
            <div className="grid gap-2">
              <Label>Phone Number (Optional)</Label>
              <Input value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="+1 234 567 8900" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateModalOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!formData.name || createCustomer.isPending}>Register</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={paymentModalOpen} onOpenChange={setPaymentModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="bg-orange-50 dark:bg-orange-950/20 text-orange-800 dark:text-orange-300 p-3 rounded-lg flex justify-between items-center border border-orange-200 dark:border-orange-900/50">
              <span className="font-semibold text-sm uppercase tracking-wider">Outstanding Balance</span>
              <span className="font-mono font-bold text-xl">{formatMoney(customerDetail?.balanceCents)}</span>
            </div>
            <div className="grid gap-2">
              <Label>Payment Amount ($)</Label>
              <Input type="number" step="0.01" value={paymentData.amount} onChange={e => setPaymentData({ ...paymentData, amount: e.target.value })} placeholder="0.00" />
            </div>
            <div className="grid gap-2">
              <Label>Note (Optional)</Label>
              <Input value={paymentData.note} onChange={e => setPaymentData({ ...paymentData, note: e.target.value })} placeholder="Cash partial payment" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentModalOpen(false)}>Cancel</Button>
            <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={handlePayment} disabled={!paymentData.amount || recordPayment.isPending}>
              Confirm Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
