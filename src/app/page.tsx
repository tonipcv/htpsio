'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useRoleRedirect } from '@/hooks/use-role-redirect';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { isLoading } = useRoleRedirect(); // Use our custom hook for role-based redirection

  // This effect is now handled by the useRoleRedirect hook

  if (status === 'loading') {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-black to-zinc-900">
        <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
      </div>
    );
  }

  if (session) return null;

  return (
    <div className="min-h-screen bg-[#1c1d20] relative flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-[400px] mx-auto text-center space-y-12">
        {/* Logo */}
        <div className="space-y-4">
          <Image
            src="/logo.png"
            alt="Logo"
            width={48}
            height={48}
            priority
            className="h-12 w-12 brightness-0 invert mx-auto"
          />
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link href="/auth/signin-docs" className="block">
            <Button 
              className="w-full py-5 bg-transparent hover:bg-[#f5f5f7]/5 text-[#f5f5f7] border border-[#f5f5f7]/10 rounded-lg text-sm font-light tracking-wide transition-all"
            >
              I'm client
            </Button>
          </Link>
          
          <Link href="/auth/signin" className="block">
            <Button 
              variant="outline"
              className="w-full py-5 bg-transparent hover:bg-[#f5f5f7]/5 text-[#f5f5f7]/70 hover:text-[#f5f5f7] border-[#f5f5f7]/10 rounded-lg text-sm font-light tracking-wide transition-all"
            >
              I'm business
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
