import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

/**
 * Landing page is temporarily disabled.
 *  - Signed-in users go straight to the dashboard.
 *  - Signed-out users go to sign-in.
 *
 * To re-enable the marketing page later, replace this file with:
 *   import { LandingPage } from '@/components/landing/LandingPage';
 *   export default function Page() {
 *     return <LandingPage />;
 *   }
 * The full landing implementation is preserved in src/components/landing/.
 */
export default async function RootPage() {
  const { userId } = await auth();
  redirect(userId ? '/overview' : '/sign-in');
}

