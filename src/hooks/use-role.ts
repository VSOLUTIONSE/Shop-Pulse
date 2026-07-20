import { useUser } from '@clerk/nextjs';

export function useRole() {
  const { user, isLoaded, isSignedIn } = useUser();

  const role = (user?.publicMetadata?.role ?? 'staff') as 'owner' | 'staff';
  const isOwner = role === 'owner';

  return { role, isOwner, isLoaded, isSignedIn };
}
