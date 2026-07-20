'use client';

import { useSignUp } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { Store, Loader2, ArrowLeft } from 'lucide-react';

export default function SignUpPage() {
  const { signUp, fetchStatus } = useSignUp();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'create' | 'verify'>('create');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isLoaded = fetchStatus !== 'fetching';

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!isLoaded || loading || !signUp) return;

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const { error: createError } = await signUp.create({ emailAddress: email, password });
      if (createError) throw createError;

      if (signUp.status === 'complete') {
        const { error: finalizeError } = await signUp.finalize();
        if (finalizeError) throw finalizeError;
        router.push('/');
      } else if (signUp.status === 'missing_requirements') {
        const { error: sendError } = await signUp.verifications.sendEmailCode();
        if (sendError) throw sendError;
        setStep('verify');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message
          : typeof err === 'object' && err !== null && 'message' in err
            ? (err as { message: string }).message
            : 'Something went wrong.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!isLoaded || loading || !signUp) return;

    setError('');
    setLoading(true);

    try {
      const { error: verifyError } = await signUp.verifications.verifyEmailCode({ code });
      if (verifyError) throw verifyError;

      if (signUp.status === 'complete') {
        const { error: finalizeError } = await signUp.finalize();
        if (finalizeError) throw finalizeError;
        router.push('/');
      } else {
        setError('Invalid verification code. Please try again.');
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message
          : typeof err === 'object' && err !== null && 'message' in err
            ? (err as { message: string }).message
            : 'Invalid verification code.';
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
                {step === 'create' ? 'Create your account' : 'Check your email'}
              </p>
            </div>

            {step === 'create' ? (
              <form onSubmit={handleCreate} className="space-y-4">
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
                    autoComplete="new-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-border/50 bg-background text-foreground placeholder:text-muted-foreground/60 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    required
                    autoComplete="new-password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                      Creating account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </button>

                <p className="text-center text-sm text-muted-foreground">
                  Already have an account?{' '}
                  <Link href="/sign-in" className="text-primary font-medium hover:underline">
                    Sign in
                  </Link>
                </p>
              </form>
            ) : (
              <form onSubmit={handleVerify} className="space-y-4">
                <p className="text-sm text-muted-foreground text-center">
                  We sent a verification code to{' '}
                  <span className="font-medium text-foreground">{email}</span>
                </p>

                <div className="space-y-2">
                  <label htmlFor="code" className="text-sm font-medium text-foreground">
                    Verification Code
                  </label>
                  <input
                    id="code"
                    type="text"
                    required
                    placeholder="000000"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-border/50 bg-background text-foreground placeholder:text-muted-foreground/60 text-sm text-center tracking-widest focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50"
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
                      Verifying...
                    </>
                  ) : (
                    'Verify Email'
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => { setStep('create'); setCode(''); setError(''); }}
                  className="flex items-center justify-center gap-1.5 w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back to registration
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
