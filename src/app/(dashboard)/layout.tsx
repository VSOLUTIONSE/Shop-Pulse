import { AppLayout } from '@/components/layout';
import { ChatWidget } from '@/components/chat-widget';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppLayout>
      {children}
      <ChatWidget />
    </AppLayout>
  );
}
