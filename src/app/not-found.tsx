'use client';

import Link from 'next/link';
import { BrandLogo } from '@/components/brand-logo';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-8 bg-background">
      <BrandLogo className="h-16 w-auto mb-8" />
      <h1 className="text-7xl font-black text-foreground mb-4">404</h1>
      <h2 className="text-2xl font-bold text-foreground mb-2">Page Not Found</h2>
      <p className="text-muted-foreground max-w-md mb-8">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
      >
        Go Home
      </Link>
    </div>
  );
}


// npx convex run --prod convex/seed.ts:seed
// for the popups use a shadcn style scroll pls, the naitive browser isnt looking good