'use client';

import { DocumentManager } from "@/components/DocumentManager";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "@/components/ui/use-toast";

export default function DocumentsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  // Note: role field has been removed from User model
  const isAdmin = true; // All users are considered admins in the simplified role model
  const [isLoading, setIsLoading] = useState(true);
  const [isAllowed, setIsAllowed] = useState(false);

  useEffect(() => {
    // Verificar se o usuário tem permissão para acessar a página de documentos
    const checkSubscription = async () => {
      if (!session?.user?.id) return;
      
      // Note: role field has been removed from User model
      // All authenticated users can access the page, but document upload is restricted by subscription
      // The actual restriction for uploads is handled in the API endpoint
      
      try {
        const response = await fetch('/api/check-subscription');
        const data = await response.json();
        
        if (!response.ok) {
          if (data.upgrade) {
            toast({
              title: "Plano gratuito",
              description: "O plano gratuito não permite acesso a documentos. Faça upgrade para continuar.",
              variant: "destructive",
            });
            router.push('/pricing');
            return;
          }
          throw new Error(data.error || "Erro ao verificar assinatura");
        }
        
        setIsAllowed(true);
      } catch (error) {
        console.error("Erro ao verificar assinatura:", error);
        toast({
          title: "Erro",
          description: "Não foi possível verificar sua assinatura",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    checkSubscription();
  }, [session, router]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#f5f5f7] border-r-transparent align-[-0.125em]"></div>
      </div>
    );
  }

  if (!isAllowed) {
    return null; // Não renderiza nada enquanto redireciona
  }

  return (
    <div className="flex-1 space-y-3 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-medium text-[#f5f5f7]">
            {isAdmin ? "Documents" : "My Documents"}
          </h2>
          <p className="text-xs text-[#f5f5f7]/50">
            Manage and share your documents
          </p>
        </div>
      </div>
      <DocumentManager />
    </div>
  );
} 