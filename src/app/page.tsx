'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;
    if (session) {
      router.push('/dashboard');
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-black to-zinc-900">
        <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
      </div>
    );
  }

  if (session) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-zinc-900 relative flex flex-col items-center justify-center p-4">
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
          <p className="text-zinc-400 text-sm font-light tracking-wide">
            Your complete ecosystem for High Ticket Sales
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link href="/auth/signin" className="block">
            <Button 
              className="w-full py-5 bg-transparent hover:bg-white/5 text-white border border-white/10 rounded-lg text-sm font-light tracking-wide transition-all"
            >
              Sign in
            </Button>
          </Link>
          
          <a href="https://magic.htps.io/create" target="_blank" rel="noopener noreferrer" className="block">
            <Button 
              variant="outline"
              className="w-full py-5 bg-transparent hover:bg-white/5 text-zinc-400 hover:text-white border-white/10 rounded-lg text-sm font-light tracking-wide transition-all"
            >
              Get a demo
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}
