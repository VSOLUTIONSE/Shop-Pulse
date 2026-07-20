'use client';

import { useSignIn } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { Store, Loader2 } from 'lucide-react';

export default function SignInPage() {
  const { signIn, fetchStatus } = useSignIn();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isLoaded = fetchStatus !== 'fetching';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isLoaded || loading || !signIn) return;

    setError('');
    setLoading(true);

    try {
      const { error: createError } = await signIn.create({ identifier: email, password });
      if (createError) throw createError;

      if (signIn.status === 'complete') {
        const { error: finalizeError } = await signIn.finalize();
        if (finalizeError) throw finalizeError;
        router.push('/');
      } else {
        setError('Please complete all required steps.');
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message
          : typeof err === 'object' && err !== null && 'message' in err
            ? (err as { message: string }).message
            : 'Invalid email or password.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="w-full max-w-sm">
        <div className="rounded-xl border border-border/50 bg-card shadow-2xl shadow-primary/5 overflow-hidden">
          <div className="p-8 space-y-6">
            <div className="text-center space-y-2">
              <div className="mx-auto h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Store className="h-7 w-7 text-primary" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                SalesPulse
              </h1>
              <p className="text-sm text-muted-foreground">
                Sign in to your account
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-foreground">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-border/50 bg-background text-foreground placeholder:text-muted-foreground/60 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-foreground">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-border/50 bg-background text-foreground placeholder:text-muted-foreground/60 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50"
                />
              </div>

              {error && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !isLoaded}
                className="w-full h-10 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 transition-colors"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>

              <p className="text-center text-sm text-muted-foreground">
                Don&apos;t have an account?{' '}
                <Link href="/sign-up" className="text-primary font-medium hover:underline">
                  Create one
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
