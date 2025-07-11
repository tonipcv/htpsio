'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function InsideSalesPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard if needed
    // router.push('/dashboard');
  }, [router]);

  return (
    <div className="min-h-[100dvh] bg-black pt-20 pb-24 md:pt-12 md:pb-16">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">
            Inside Sales
          </h1>
          <p className="text-zinc-400">
            Welcome to the inside sales portal
          </p>
        </div>
      </div>
    </div>
  );
} 