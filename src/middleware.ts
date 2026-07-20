import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)']);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    const signInUrl = new URL('/sign-in', req.url).toString();
    await auth.protect({ unauthenticatedUrl: signInUrl });
  }
});

export const config = {
  matcher: [
    '/((?!_next|.*\\..*).*)',
  ],
};
