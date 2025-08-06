import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signJwtToken } from "@/lib/auth";
import { RoleType } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json({ error: "Email and code are required" }, { status: 400 });
    }

    // Verificar se o usuário existe
    const user = await prisma.user.findUnique({
      where: { email },
      select: { 
        id: true, 
        email: true, 
        name: true, 
        slug: true,
        image: true,
        plan: true,
        isPremium: true,
        tenantId: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid email or code" }, { status: 400 });
    }

    // Buscar o código de verificação
    const verificationRecord = await prisma.verificationCode.findUnique({
      where: { email: user.email }
    });

    if (!verificationRecord) {
      return NextResponse.json({ error: "No verification code found" }, { status: 400 });
    }

    // Verificar se o código é válido e não expirou
    const now = new Date();
    if (verificationRecord.code !== code || verificationRecord.expiresAt < now) {
      return NextResponse.json({ error: "Invalid or expired code" }, { status: 400 });
    }

    // Buscar os papéis do usuário
    const userRoles = await prisma.userRole.findMany({
      where: { userId: user.id },
      select: { role: true, tenantId: true }
    });
    
    // Determinar o papel principal do usuário (prioridade para SUPER_ADMIN > BUSINESS > CLIENT)
    let primaryRole: RoleType = RoleType.CLIENT; // Default role
    
    if (userRoles.some(ur => ur.role === RoleType.SUPER_ADMIN)) {
      primaryRole = RoleType.SUPER_ADMIN;
    } else if (userRoles.some(ur => ur.role === RoleType.BUSINESS)) {
      primaryRole = RoleType.BUSINESS;
    }
    
    // Código válido, gerar token JWT
    const token = await signJwtToken({
      id: user.id,
      email: user.email,
      name: user.name,
      type: 'user',
      role: primaryRole,
      userSlug: user.slug,
      image: user.image,
      plan: user.plan || undefined,
      isPremium: user.isPremium || false
      // tenantId removido pois não é aceito na interface JWT
    });

    // Remover o código de verificação usado
    await prisma.verificationCode.delete({
      where: { email: user.email }
    });

    return NextResponse.json({ 
      success: true,
      token
    });
  } catch (error) {
    console.error("Error verifying login code:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
