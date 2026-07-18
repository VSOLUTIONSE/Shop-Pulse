'use client';

import { useState } from 'react';
import {
  useListExpenses,
  useCreateExpense,
  useDeleteExpense,
} from '@/lib/hooks';
import { formatMoney, formatShortDate } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
  Plus,
  Trash2,
  Wallet,
  Zap,
  Users,
  Truck,
  Package,
  MoreHorizontal,
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
import { ExpenseCategory } from '@/types';

const categoryIcons: Record<string, React.ReactNode> = {
  rent: <Wallet className="w-4 h-4" />,
  power: <Zap className="w-4 h-4" />,
  staff: <Users className="w-4 h-4" />,
  transport: <Truck className="w-4 h-4" />,
  logistics: <Package className="w-4 h-4" />,
  other: <MoreHorizontal className="w-4 h-4" />,
};

export default function Expenses() {
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    category: 'other' as string,
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
  });

  const { data: expenses, isLoading } = useListExpenses();

  const createExpense = useCreateExpense();
  const deleteExpense = useDeleteExpense();
  const { toast } = useToast();

  const filteredExpenses = categoryFilter
    ? expenses?.filter(e => e.category === categoryFilter)
    : expenses;

  const handleCreate = () => {
    createExpense.mutate({
      category: formData.category as any,
      description: formData.description,
      amountCents: Math.round(Number(formData.amount) * 100),
      expenseDate: new Date(formData.date).toISOString(),
    }).then(() => {
      toast({ title: "Expense logged successfully" });
      setCreateModalOpen(false);
      setFormData({ ...formData, description: '', amount: '' });
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this expense record?")) {
      deleteExpense.mutate(id).then(() => {
        toast({ title: "Expense deleted" });
      });
    }
  };

  const totalExpenses = filteredExpenses?.reduce((acc, exp) => acc + exp.amountCents, 0) || 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Expenses</h1>
          <p className="text-muted-foreground mt-1">Track operational costs and overhead.</p>
        </div>
        <Button onClick={() => setCreateModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> Log Expense
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card className="border-border/50 shadow-sm h-full">
            <div className="p-4 border-b border-border/50 bg-muted/20 flex gap-4 items-center">
              <span className="text-sm font-medium">Filter:</span>
              <select
                className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="">All Categories</option>
                {Object.values(ExpenseCategory).map(cat => (
                  <option key={cat} value={cat} className="capitalize">{cat}</option>
                ))}
              </select>
            </div>

            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={5} className="h-16 text-center">
                        <div className="h-4 w-full bg-muted animate-pulse rounded" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : filteredExpenses?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                      No expenses logged yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredExpenses?.map(exp => (
                    <TableRow key={exp.id}>
                      <TableCell className="text-sm">{formatShortDate(exp.expenseDate)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize flex items-center gap-1.5 w-fit bg-background">
                          {categoryIcons[exp.category]} {exp.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{exp.description}</TableCell>
                      <TableCell className="text-right font-mono font-bold text-destructive">
                        {formatMoney(exp.amountCents)}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(exp.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </div>

        <div>
          <Card className="border-border/50 shadow-sm bg-gradient-to-br from-card to-destructive/5">
            <CardContent className="p-6">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Total Logged</h3>
              <div className="text-4xl font-mono font-black text-destructive tracking-tighter">
                {formatMoney(totalExpenses)}
              </div>
              <p className="text-sm text-muted-foreground mt-2 border-t border-border/50 pt-2">
                Based on current filters
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log New Expense</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Category</Label>
                <select
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                >
                  {Object.values(ExpenseCategory).map(cat => (
                    <option key={cat} value={cat} className="capitalize">{cat}</option>
                  ))}
                </select>
              </div>
              <div className="grid gap-2">
                <Label>Date</Label>
                <Input type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Description</Label>
              <Input value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="e.g. Electricity bill for July" />
            </div>
            <div className="grid gap-2">
              <Label>Amount ($)</Label>
              <Input type="number" step="0.01" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} placeholder="0.00" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateModalOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!formData.description || !formData.amount || createExpense.isPending}>
              Log Expense
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
