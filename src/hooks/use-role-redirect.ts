import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { RoleType } from '@prisma/client';

/**
 * Hook to handle role-based redirects after login
 * Redirects users to different pages based on their role:
 * - CLIENT users go to /client-dashboard
 * - BUSINESS users go to /documents
 * - SUPER_ADMIN users go to /documents
 * - admin users go to /documents
 * - client users go to /client-dashboard
 */
export function useRoleRedirect() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      // Get the user's role from the session
      const userRole = session.user.role;
      
      // Redirect based on role
      if (userRole === 'CLIENT' || userRole === 'client') {
        router.push('/client-dashboard');
      } else if (userRole === 'BUSINESS' || userRole === 'SUPER_ADMIN' || userRole === 'admin') {
        router.push('/documents');
      } else {
        // Default fallback if role is not recognized
        // For safety, direct unknown roles to client dashboard
        console.log('Unknown role:', userRole);
        router.push('/client-dashboard');
      }
    }
  }, [status, session, router]);

  return { isLoading: status === 'loading' };
}
