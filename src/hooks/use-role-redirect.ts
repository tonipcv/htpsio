import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { RoleType } from '@prisma/client';

/**
 * Hook to handle role-based redirects after login
 * Redirects users to different pages based on their role:
 * - CLIENT users go to /client-dashboard
 * - BUSINESS users go to /dashboard
 * - SUPER_ADMIN users go to /dashboard
 */
export function useRoleRedirect() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      // Get the user's role from the session
      const userRole = session.user.role as RoleType;
      
      // Redirect based on role
      if (userRole === 'CLIENT') {
        router.push('/client-dashboard');
      } else if (userRole === 'BUSINESS' || userRole === 'SUPER_ADMIN') {
        router.push('/dashboard');
      } else {
        // Default fallback if role is not recognized
        router.push('/dashboard');
      }
    }
  }, [status, session, router]);

  return { isLoading: status === 'loading' };
}
