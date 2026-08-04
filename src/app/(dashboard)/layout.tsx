import { auth } from '@clerk/nextjs/server';
import { AppLayout } from '@/components/layout';
import { ChatWidget } from '@/components/chat-widget';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await auth.protect();
  return (
    <AppLayout>
      {children}
      <ChatWidget />
    </AppLayout>
  );
}
