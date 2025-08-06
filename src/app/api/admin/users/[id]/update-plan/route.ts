import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { updateUserSubscription } from "@/lib/stripe";

// Schema para validação
const updatePlanSchema = z.object({
  plan: z.enum(['free', 'basic', 'pro', 'enterprise']),
  isPremium: z.boolean()
});

// PUT /api/admin/users/[id]/update-plan - Atualiza o plano de um usuário
export async function PUT(request: Request) {
  // Extrair o ID do usuário da URL
  const url = new URL(request.url);
  const pathParts = url.pathname.split('/');
  const userId = pathParts[pathParts.length - 2]; // O ID está antes de 'update-plan' na URL
  try {
    // Verificar autenticação e autorização
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Verificar se o usuário é superadmin
    if (session.user.role !== 'superadmin') {
      return NextResponse.json(
        { error: "Forbidden: Only superadmin can update user plans" },
        { status: 403 }
      );
    }

    // O ID do usuário já foi obtido da URL acima
    
    // Verificar se o usuário existe
    const userExists = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true }
    });
    
    if (!userExists) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Validar os dados da requisição
    const body = await request.json();
    
    try {
      const { plan, isPremium } = updatePlanSchema.parse(body);
      
      // Atualizar o plano do usuário e sua assinatura
      const status = plan === 'free' ? 'inactive' : 'active';
      
      // Atualizar a entidade subscription do usuário
      await updateUserSubscription(userId, plan, status);
      
      // Atualizar os campos do usuário
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          plan,
          isPremium
        },
        select: {
          id: true,
          name: true,
          email: true,
          plan: true,
          isPremium: true,
          subscription: true
        }
      });
      
      console.log(`User plan updated by admin: ${updatedUser.email} -> ${updatedUser.plan}`);
      
      return NextResponse.json({
        success: true,
        message: "User plan updated successfully",
        user: updatedUser
      });
      
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        return NextResponse.json(
          { error: "Invalid data", details: validationError.errors },
          { status: 400 }
        );
      }
      throw validationError;
    }
    
  } catch (error) {
    console.error("Error updating user plan:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
