'use client';

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

export default function SignIn() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignInContent />
    </Suspense>
  );
}

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const error = searchParams.get('error');

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(error || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      const result = await signIn('credentials', {
        email,
        password,
        type: 'user',
        redirect: false,
        callbackUrl
      });

      if (result?.error) {
        setErrorMsg(result.error);
        return;
      }

      if (result?.ok) {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err) {
      console.error('Login error:', err);
      setErrorMsg("An error occurred while signing in. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

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

        <form onSubmit={handleSubmit} className="relative space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              autoComplete="email"
              disabled={isLoading}
              className="relative"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              disabled={isLoading}
              className="relative"
            />
          </div>

          {errorMsg && (
            <div className="relative text-red-400 text-sm text-center">{errorMsg}</div>
          )}

          <Button 
            type="submit"
            disabled={isLoading}
            className="relative w-full bg-[#1c1d20] hover:bg-[#f5f5f7]/5 text-[#f5f5f7] border border-[#f5f5f7]/10 py-6"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border border-[#f5f5f7]/30 border-t-[#f5f5f7] mr-2"></div>
                <span>Signing in...</span>
              </div>
            ) : (
              'Sign in'
            )}
          </Button>

          <div className="relative text-center space-y-2">
            <Link 
              href="/auth/forgot-password" 
              className="relative text-[#f5f5f7]/70 hover:text-[#f5f5f7] text-sm block"
            >
              Forgot your password?
            </Link>
            <Link 
              href="/auth/register" 
              className="relative text-[#f5f5f7]/70 hover:text-[#f5f5f7] text-sm block"
            >
              Don't have an account? Sign up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
} 