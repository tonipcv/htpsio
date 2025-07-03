/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { slugify } from "@/lib/utils";

interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações básicas
    if (!formData.name.trim() || !formData.email.trim() || !formData.password) {
      toast({
        title: "Erro de validação",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Erro de validação",
        description: "As senhas não coincidem.",
        variant: "destructive",
      });
      return;
    }

    // Validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Email inválido",
        description: "Por favor, insira um email válido.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Gerar slug a partir do nome
      const slug = slugify(formData.name);

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          slug: slug
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao criar conta');
      }

      toast({
        title: "Conta criada com sucesso!",
        description: "Redirecionando para o login...",
      });
      
      // Redireciona para o login após um breve delay para mostrar a mensagem de sucesso
      setTimeout(() => {
        router.push(data.redirect || '/auth/signin');
      }, 2000);

    } catch (error) {
      console.error('Erro no registro:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Não foi possível criar sua conta. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold tracking-tight text-white">
              Criar Conta
            </CardTitle>
            <CardDescription className="text-zinc-400">
              Preencha seus dados para começar a proteger seu ambiente
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {/* Nome */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-zinc-300">
                  Nome completo
                </Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Digite seu nome"
                  value={formData.name}
                  onChange={handleChange}
                  autoComplete="name"
                  required
                  className="bg-zinc-900/50 border-zinc-800 text-zinc-300 placeholder:text-zinc-500 focus:border-zinc-700 focus:ring-zinc-700"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-zinc-300">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  required
                  className="bg-zinc-900/50 border-zinc-800 text-zinc-300 placeholder:text-zinc-500 focus:border-zinc-700 focus:ring-zinc-700"
                />
              </div>

              {/* Senha */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-zinc-300">
                  Senha
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  required
                  className="bg-zinc-900/50 border-zinc-800 text-zinc-300 placeholder:text-zinc-500 focus:border-zinc-700 focus:ring-zinc-700"
                />
              </div>

              {/* Confirmar Senha */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-zinc-300">
                  Confirmar senha
                </Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                  required
                  className="bg-zinc-900/50 border-zinc-800 text-zinc-300 placeholder:text-zinc-500 focus:border-zinc-700 focus:ring-zinc-700"
                />
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-4">
              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-500 text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-zinc-700 border-t-zinc-400 mr-2" />
                    Criando conta...
                  </div>
                ) : (
                  <div className="flex items-center">
                    Criar conta
                    <ArrowRightIcon className="h-4 w-4 ml-2" />
                  </div>
                )}
              </Button>

              <div className="text-sm text-zinc-400">
                Já tem uma conta?{' '}
                <Link 
                  href="/auth/signin" 
                  className="text-blue-500 hover:text-blue-400 font-medium"
                >
                  Fazer login
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
} 