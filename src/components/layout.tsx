'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useGetSettings } from '@/lib/hooks';
import { useRole } from '@/hooks/use-role';
import {
  LayoutDashboard,
  ShoppingCart,
  Receipt,
  Package,
  Users,
  Wallet,
  LineChart,
  Settings,
  Store,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { UserButton } from '@clerk/nextjs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

function SidebarNav() {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();
  const { isOwner, isLoaded } = useRole();
  const { data: settings } = useGetSettings();

  const navItems = [
    { label: 'Overview', href: '/', icon: LayoutDashboard, exact: true },
    { label: 'POS Terminal', href: '/pos', icon: ShoppingCart },
    { label: 'Sales Logs', href: '/sales', icon: Receipt },
    { label: 'Inventory', href: '/inventory', icon: Package },
    { label: 'Customers', href: '/customers', icon: Users },
    ...(isOwner ? [{ label: 'Expenses', href: '/expenses', icon: Wallet }] : []),
    ...(isOwner ? [{ label: 'AI Reports', href: '/reports', icon: LineChart }] : []),
    ...(isOwner ? [{ label: 'Settings', href: '/settings', icon: Settings }] : []),
  ];

  return (
    <>
      <SidebarHeader className="border-b border-border/50 py-4 px-4">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-primary">
          <Store className="h-6 w-6" />
          <span className="truncate group-data-[collapsible=icon]:hidden">
            {settings === undefined ? <Skeleton className="h-6 w-24" /> : settings?.shopName || 'SalesPulse'}
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent className="px-2 py-4">
        <SidebarMenu>
          {navItems.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);

            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild isActive={isActive} tooltip={item.label}>
                  <Link href={item.href} onClick={() => setOpenMobile(false)} className="flex items-center gap-3">
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="border-t border-border/50 p-4">
        <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
          <UserButton
            appearance={{
              elements: {
                userButtonAvatarBox: 'h-8 w-8 shrink-0',
                userButtonOuterIdentifier: 'text-sm font-semibold truncate text-foreground',
                userButtonTrigger: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md',
              },
            }}
            userProfileMode="navigation"
            userProfileUrl="/user-profile"
          />
          <div className="flex flex-col overflow-hidden group-data-[collapsible=icon]:hidden leading-tight">
            <span className="text-sm font-semibold truncate capitalize">
              {isOwner ? 'Owner' : 'Staff'}
            </span>
            <span className="text-xs text-muted-foreground truncate">{isOwner ? 'Full Access' : 'Limited Access'}</span>
          </div>
        </div>
      </SidebarFooter>
    </>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { isOwner, isLoaded } = useRole();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <Sidebar variant="inset" collapsible="icon">
          <SidebarNav />
        </Sidebar>

        <SidebarInset>
          <header className="h-16 flex items-center gap-4 border-b border-border/40 bg-card/50 px-6 shrink-0 sticky top-0 z-10 backdrop-blur-sm">
            <SidebarTrigger />
            <div className="flex-1" />
            {isLoaded && (
              <Badge variant="secondary" className="px-3 py-1 text-xs font-semibold capitalize tracking-wide">
                {isOwner ? 'Owner View' : 'Staff View'}
              </Badge>
            )}
          </header>
          <div className="flex-1 p-6 lg:p-8 overflow-auto">
            {children}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
