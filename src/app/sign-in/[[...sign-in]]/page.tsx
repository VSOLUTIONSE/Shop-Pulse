'use client';

import { useSignIn } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { Store, Loader2, Eye, EyeOff } from 'lucide-react';

export default function SignInPage() {
  const { signIn, errors, fetchStatus } = useSignIn();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const isLoaded = fetchStatus !== 'fetching';
  const fieldError = errors.fields;

  const needsVerify =
    submitted && (signIn?.status === 'needs_client_trust' || signIn?.status === 'needs_second_factor');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isLoaded || loading || !signIn) return;

    setError('');
    setLoading(true);

    const { error: pwdError } = await signIn.password({ emailAddress: email, password });
    if (pwdError) {
      setError(pwdError.message);
      setLoading(false);
      return;
    }

    setSubmitted(true);

    if (signIn.status === 'complete') {
      await signIn.finalize({
        navigate: ({ session, decorateUrl }) => {
          if (session?.currentTask) return;
          const url = decorateUrl('/');
          if (url.startsWith('http')) {
            window.location.href = url;
          } else {
            router.push(url);
          }
        },
      });
      return;
    }

    if (signIn.status === 'needs_client_trust' || signIn.status === 'needs_second_factor') {
      const emailCodeFactor = signIn.supportedSecondFactors.find(
        (f) => f.strategy === 'email_code',
      );
      if (emailCodeFactor) {
        await signIn.mfa.sendEmailCode();
      }
    }

    setLoading(false);
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!isLoaded || loading || !signIn) return;

    setError('');
    setLoading(true);

    const { error: verifyError } = await signIn.mfa.verifyEmailCode({ code });
    if (verifyError) {
      setError(verifyError.message);
      setLoading(false);
      return;
    }

    if (signIn.status === 'complete') {
      await signIn.finalize({
        navigate: ({ session, decorateUrl }) => {
          if (session?.currentTask) return;
          const url = decorateUrl('/');
          if (url.startsWith('http')) {
            window.location.href = url;
          } else {
            router.push(url);
          }
        },
      });
    } else {
      setError('Verification failed. Please try again.');
      setLoading(false);
    }
  }

  if (needsVerify) {
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
                  Verify your identity
                </p>
              </div>

              <form onSubmit={handleVerify} className="space-y-4">
                <p className="text-sm text-muted-foreground text-center">
                  We sent a verification code to your email
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
                  {fieldError.code && (
                    <p className="text-xs text-destructive">{fieldError.code.message}</p>
                  )}
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
                    'Verify'
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
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
              <div id="clerk-captcha"></div>
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
                {fieldError.identifier && (
                  <p className="text-xs text-destructive">{fieldError.identifier.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-foreground">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-10 px-3 pr-10 rounded-lg border border-border/50 bg-background text-foreground placeholder:text-muted-foreground/60 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {fieldError.password && (
                  <p className="text-xs text-destructive">{fieldError.password.message}</p>
                )}
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
