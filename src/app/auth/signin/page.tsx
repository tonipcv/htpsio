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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('Attempting login with:', { email, type: 'user' });
      const result = await signIn('credentials', {
        email,
        password,
        type: 'user',
        redirect: false,
        callbackUrl
      });

      console.log('Login result:', result);

      if (result?.error) {
        toast.error(result.error);
        return;
      }

      if (result?.ok) {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err) {
      console.error('Login error:', err);
      toast.error("Ocorreu um erro ao tentar fazer login. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-zinc-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-zinc-900/50 backdrop-blur-sm rounded-xl p-8 border border-zinc-800">
        <div className="text-center mb-8">
          <Image
            src="/logo.png"
            alt="Logo"
            width={48}
            height={48}
            priority
            className="h-12 w-12 brightness-0 invert mx-auto"
          />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-zinc-300">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              className="bg-zinc-800/50 border-zinc-700 text-zinc-300 placeholder:text-zinc-500"
              autoComplete="email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-zinc-300">
              Senha
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="bg-zinc-800/50 border-zinc-700 text-zinc-300 placeholder:text-zinc-500"
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="text-red-400 text-sm">{error}</div>
          )}

          <Button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-6"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border border-white/30 border-t-white mr-2"></div>
                <span>Entrando...</span>
              </div>
            ) : (
              'Entrar'
            )}
          </Button>

          <div className="text-center space-y-2">
            <Link 
              href="/auth/forgot-password" 
              className="text-zinc-400 hover:text-zinc-300 text-sm block"
            >
              Esqueceu sua senha?
            </Link>
            <Link 
              href="/auth/register" 
              className="text-zinc-400 hover:text-zinc-300 text-sm block"
            >
              Não tem uma conta? Cadastre-se
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
} 