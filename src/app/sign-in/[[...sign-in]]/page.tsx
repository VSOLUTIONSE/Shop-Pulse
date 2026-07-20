import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <SignIn
          appearance={{
            elements: {
              rootBox: 'mx-auto',
              card: 'shadow-lg border border-border/50',
              headerTitle: 'text-foreground',
              headerSubtitle: 'text-muted-foreground',
              socialButtonsBlockButton: 'border-border/50 text-foreground hover:bg-muted/50',
              dividerLine: 'bg-border/50',
              dividerText: 'text-muted-foreground',
              formFieldLabel: 'text-foreground',
              formFieldInput: 'bg-background border-border/50 text-foreground',
              footerActionLink: 'text-primary',
              formButtonPrimary: 'bg-primary hover:bg-primary/90',
            },
          }}
          fallbackRedirectUrl="/"
        />
      </div>
    </div>
  );
}
