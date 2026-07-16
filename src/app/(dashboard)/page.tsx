'use client';

import { useGetDashboardSummary, useGetSettings } from '@/lib/hooks';
import { formatMoney } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, CreditCard, Receipt, AlertCircle, ShoppingBag, ArrowRight, Package } from 'lucide-react';
import Link from 'next/link';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

function formatShortDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function Dashboard() {
  const { data: summary, isLoading } = useGetDashboardSummary();
  const { data: settings } = useGetSettings();

  const isOwner = settings?.activeRole === 'owner';

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-32" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-96 lg:col-span-2" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Overview</h1>
          <p className="text-muted-foreground mt-1">Here&apos;s what&apos;s happening in your shop today.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild>
            <Link href="/pos">
              <ShoppingBag className="w-4 h-4 mr-2" />
              Open POS
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <Card className="shadow-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Today&apos;s Revenue</CardTitle>
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono tracking-tight">{formatMoney(summary?.todayRevenueCents)}</div>
          </CardContent>
        </Card>

        {isOwner && (
          <Card className="shadow-sm border-border/50 bg-gradient-to-br from-card to-primary/5">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Today&apos;s Profit</CardTitle>
              <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-mono tracking-tight text-green-700 dark:text-green-400">
                {formatMoney(summary?.todayProfitCents)}
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="shadow-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Debt</CardTitle>
            <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono tracking-tight">{formatMoney(summary?.totalDebtCents)}</div>
            <p className="text-xs text-muted-foreground mt-1">Across {summary?.activeDebtAccounts} accounts</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Expenses</CardTitle>
            <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center">
              <Receipt className="w-4 h-4 text-destructive" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono tracking-tight">{formatMoney(summary?.monthlyExpensesCents)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-sm border-border/50">
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>Daily revenue for the past week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              {summary?.revenueChart && summary.revenueChart.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={summary.revenueChart} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(val) => formatShortDate(val)}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      dy={10}
                    />
                    <YAxis
                      tickFormatter={(val) => `$${val/100}`}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    />
                    <Tooltip
                      formatter={(value: any) => [formatMoney(value as number), 'Revenue']}
                      labelFormatter={(label: any) => formatShortDate(label)}
                      contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--card))' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenueCents"
                      stroke="hsl(var(--primary))"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                      animationDuration={1000}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground border-2 border-dashed border-border rounded-lg">
                  No revenue data yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6 flex flex-col">
          <Card className="shadow-sm border-border/50 flex-1">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-destructive" />
                Low Stock Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              {summary?.lowStockProducts && summary.lowStockProducts.length > 0 ? (
                <div className="space-y-4">
                  {summary.lowStockProducts.slice(0, 4).map((product: any) => (
                    <div key={product.id} className="flex items-center justify-between group">
                      <div>
                        <p className="font-medium text-sm truncate max-w-[150px] sm:max-w-[200px]" title={product.name}>
                          {product.name}
                        </p>
                        <p className="text-xs text-muted-foreground">{product.categoryName}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="destructive" className="font-mono text-xs px-2 py-0.5">
                          {product.stockLevel} left
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {summary.lowStockProducts.length > 4 && (
                    <Button variant="ghost" size="sm" className="w-full text-xs" asChild>
                      <Link href="/inventory">View all {summary.lowStockProducts.length} alerts</Link>
                    </Button>
                  )}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground text-sm flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                    <Package className="w-6 h-6 opacity-50" />
                  </div>
                  Stock levels are healthy
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-sm border-border/50 flex-1">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle>Recent Sales</CardTitle>
              <Button variant="ghost" size="icon" asChild className="h-8 w-8 -mr-2">
                <Link href="/sales"><ArrowRight className="w-4 h-4" /></Link>
              </Button>
            </CardHeader>
            <CardContent>
              {summary?.recentSales && summary.recentSales.length > 0 ? (
                <div className="space-y-4">
                  {summary.recentSales.slice(0, 4).map((sale: any) => (
                    <div key={sale.id} className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="font-mono text-sm">#{sale.id.toString().padStart(4, '0')}</span>
                        <span className="text-xs text-muted-foreground">{formatShortDate(sale.createdAt)}</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="font-semibold text-sm font-mono">{formatMoney(sale.totalCents)}</span>
                        {sale.status === 'voided' ? (
                          <Badge variant="outline" className="text-[10px] h-4 px-1.5 bg-destructive/10 text-destructive border-transparent">Voided</Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">{sale.items.length} items</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground text-sm">
                  No sales today
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
