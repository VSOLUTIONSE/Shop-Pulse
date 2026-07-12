import React from 'react';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AppLayout } from '@/components/layout';

import { Dashboard } from '@/pages/dashboard';
import { POS } from '@/pages/pos';
import { Sales } from '@/pages/sales';
import { Inventory } from '@/pages/inventory';
import { Customers } from '@/pages/customers';
import { Expenses } from '@/pages/expenses';
import { Reports } from '@/pages/reports';
import { SettingsPage } from '@/pages/settings';
import NotFound from '@/pages/not-found';

const queryClient = new QueryClient();

function Router() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/pos" component={POS} />
        <Route path="/sales" component={Sales} />
        <Route path="/inventory" component={Inventory} />
        <Route path="/customers" component={Customers} />
        <Route path="/expenses" component={Expenses} />
        <Route path="/reports" component={Reports} />
        <Route path="/settings" component={SettingsPage} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
