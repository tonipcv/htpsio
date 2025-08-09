'use client';

import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import RegisterSteps from "@/components/auth/RegisterSteps";

export default function RegisterPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RegisterContent />
    </Suspense>
  );
}

function RegisterContent() {
  return (
    <div className="relative min-h-screen bg-[#1c1d20] flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-[#1c1d20] rounded-xl p-8 border border-[#f5f5f7]/10">
        <div className="relative text-center mb-8">
          <Image
            src="/logo.png"
            alt="Logo"
            width={48}
            height={48}
            priority
            className="relative h-12 w-12 brightness-0 invert mx-auto"
          />
        </div>

        <h1 className="text-xl font-medium text-[#f5f5f7] text-center mb-6">Create Account</h1>
        
        <RegisterSteps />

        <div className="relative text-center mt-6">
          <Link 
            href="/auth/signin" 
            className="relative text-[#f5f5f7]/70 hover:text-[#f5f5f7] text-sm block"
          >
            Already have an account? Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}