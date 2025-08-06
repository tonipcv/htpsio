/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { RegisterSteps } from "@/components/auth/RegisterSteps";
import Image from "next/image";
import { ArrowLeft } from 'lucide-react';

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-zinc-900 pb-12 flex flex-col items-center">
      <div className="container max-w-3xl px-4 py-16 flex flex-col items-center">
        {/* Logo */}
        <div className="mb-12">
          <div className="relative w-40 h-12">
            <Image
              src="/logo.png"
              alt="MED1 Logo"
              fill
              priority
              className="object-contain invert brightness-200"
            />
          </div>
        </div>
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-medium text-white tracking-tight">Create Account</h1>
          <p className="mt-3 text-lg text-zinc-400 max-w-2xl">Follow the steps below to create your account</p>
        </div>

        {/* Navigation buttons */}
        <div className="absolute top-4 left-4">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-zinc-500 hover:text-zinc-400 flex items-center gap-2"
            asChild
          >
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </Button>
        </div>

        {/* Login link */}
        <div className="absolute top-4 right-4">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-zinc-500 hover:text-zinc-400"
            asChild
          >
            <Link href="/auth/signin">
              Sign in
            </Link>
          </Button>
        </div>

        {/* Registration Form */}
        <div className="w-full max-w-md bg-zinc-800 border border-zinc-700 shadow-sm rounded-lg p-6">
          <RegisterSteps />
        </div>
      </div>
      
      {/* CSS para corrigir o fundo branco do preenchimento automático */}
      <style jsx global>{`
        input:-webkit-autofill,
        input:-webkit-autofill:hover, 
        input:-webkit-autofill:focus, 
        input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 30px #27272a inset !important;
          -webkit-text-fill-color: white !important;
          transition: background-color 5000s ease-in-out 0s;
        }
      `}</style>
    </div>
  );
}