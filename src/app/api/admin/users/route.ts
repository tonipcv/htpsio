import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/users - Lista todos os usuários
export async function GET() {
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
        { error: "Forbidden: Only superadmin can access this resource" },
        { status: 403 }
      );
    }

    // Buscar todos os usuários
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        plan: true,
        isPremium: true,
        emailVerified: true,
        createdAt: true,
        slug: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    // Buscar os papéis de cada usuário
    const usersWithRoles = await Promise.all(users.map(async (user) => {
      const userRoles = await prisma.userRole.findMany({
        where: { userId: user.id },
        select: { role: true }
      });
      
      // Determinar o papel principal do usuário (prioridade para SUPER_ADMIN > BUSINESS > CLIENT)
      let primaryRole = userRoles.find(ur => ur.role === 'SUPER_ADMIN')?.role ||
                       userRoles.find(ur => ur.role === 'BUSINESS')?.role ||
                       userRoles.find(ur => ur.role === 'CLIENT')?.role ||
                       'USER';
      
      return {
        ...user,
        primaryRole,
        roles: userRoles.map(ur => ur.role)
      };
    }));

    return NextResponse.json({ users: usersWithRoles });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
