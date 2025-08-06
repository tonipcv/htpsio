import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isFreePlan } from "@/lib/stripe";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Verificar se o usuário está no plano gratuito
    const userIsFreePlan = await isFreePlan(session.user.id);
    
    if (userIsFreePlan) {
      return NextResponse.json({ 
        error: "O plano gratuito não permite acesso a documentos",
        upgrade: true
      }, { status: 403 });
    }
    
    // Usuário tem um plano pago ativo
    return NextResponse.json({ 
      success: true,
      message: "Usuário tem acesso a documentos"
    });
    
  } catch (error) {
    console.error("Erro ao verificar assinatura:", error);
    return NextResponse.json({ 
      error: "Erro ao verificar assinatura" 
    }, { status: 500 });
  }
}
