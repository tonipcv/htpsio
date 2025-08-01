'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { Logo } from '@/components/ui/logo';

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-[100dvh] h-full bg-[#1c1d20] flex flex-col items-center justify-center">
        <div className="mb-8">
          <Logo className="scale-100" variant="light" />
        </div>
        <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-[#f5f5f7] border-t-transparent"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen h-full bg-[#1c1d20]">
      <Navigation />
      <main className="h-full min-h-[100dvh] lg:pl-14 pt-14 lg:pt-0">
        {children}
      </main>
    </div>
  );
} 