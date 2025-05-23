'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { motion } from 'framer-motion';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default function BloqueadoPage() {
  const router = useRouter();
  const [isAnimating, setIsAnimating] = useState(false);

  const handleContinue = () => {
    setIsAnimating(true);
    setTimeout(() => {
      router.push('/onboarding');
    }, 300);
  };

  return (
    <div className="min-h-screen bg-black relative flex items-center justify-center">
      <div className="w-full max-w-[480px] mx-auto px-4">
        <div className="flex justify-center mb-8 items-center gap-3">
          <Image
            src="/logo.png"
            alt="Logo"
            width={48}
            height={48}
            priority
            className="h-12 w-12 brightness-0 invert"
          />
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-zinc-900/50 backdrop-blur-sm rounded-xl p-8 border border-zinc-800 shadow-[0_8px_30px_rgba(0,0,0,0.12)]"
        >
          <div className="text-center space-y-6">
            <h1 className="text-2xl font-semibold text-zinc-100">
              Libere seu acesso
            </h1>
            
            <p className="text-zinc-400 leading-relaxed">
              Para ter acesso é necessário conversar com nosso time e iniciar o Onboarding, nossa solução é personalizada para sua situação atual e nosso foco é no mínimo duplicar seu faturamento.
            </p>
            
            <p className="text-zinc-400 leading-relaxed">
              O Onboarding é feito por ordem de chegada. Para agendar o seu, clique no botão abaixo e preencha os dados.
            </p>
            
            <Button 
              className="w-full bg-zinc-800 text-zinc-100 hover:bg-zinc-700 transition-colors border-none rounded-full"
              onClick={handleContinue}
              disabled={isAnimating}
            >
              Continuar
              <ChevronRightIcon className="h-5 w-5 ml-2" />
            </Button>
          </div>

          <div className="mt-6 text-center">
            <Link 
              href="/auth/signin" 
              className="text-zinc-500 hover:text-zinc-300 text-sm"
            >
              Voltar para o login
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 