/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import Link from "next/link";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error sending reset email');
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error sending reset email');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black relative flex items-center justify-center">
      <div className="w-full max-w-[480px] mx-auto px-4">
        <div className="flex justify-center mb-8 items-center">
          <Image
            src="/logo.png"
            alt="Logo"
            width={48}
            height={48}
            priority
            className="h-12 w-12 brightness-0 invert"
          />
        </div>
        
        <div className="bg-zinc-900/50 backdrop-blur-sm rounded-xl p-8 border border-zinc-800 shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-zinc-300 font-medium">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Digite seu e-mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-zinc-800/50 border-zinc-700 text-zinc-300 placeholder:text-zinc-500 focus:ring-2 focus:ring-zinc-700 focus:border-transparent"
                />
              </div>
              {error && (
                <div className="text-red-400 text-sm">{error}</div>
              )}
              <Button 
                type="submit" 
                className="w-full bg-zinc-800 hover:bg-zinc-700 text-white transition-colors border-zinc-700 rounded-xl"
                disabled={isLoading}
              >
                {isLoading ? "Enviando..." : "Enviar link de recuperação"}
              </Button>
            </form>
          ) : (
            <div className="text-center space-y-4">
              <div className="text-zinc-300">
                Se uma conta existir com este e-mail, você receberá um link para redefinir sua senha.
              </div>
              <Button 
                onClick={() => setSuccess(false)}
                className="bg-zinc-800 hover:bg-zinc-700 text-white transition-colors border-zinc-700 rounded-xl"
              >
                Tentar novamente
              </Button>
            </div>
          )}

          <div className="mt-6 text-center">
            <Link 
              href="/auth/signin" 
              className="text-zinc-400 hover:text-zinc-300 text-sm"
            >
              Voltar para o login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 