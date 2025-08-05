import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signJwtToken } from "@/lib/auth";

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
        role: true,
        slug: true,
        image: true,
        plan: true,
        isPremium: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid email or code" }, { status: 400 });
    }

    // Buscar o código de verificação
    const verificationRecord = await prisma.verificationCode.findUnique({
      where: { userId: user.id }
    });

    if (!verificationRecord) {
      return NextResponse.json({ error: "No verification code found" }, { status: 400 });
    }

    // Verificar se o código é válido e não expirou
    const now = new Date();
    if (verificationRecord.code !== code || verificationRecord.expiresAt < now) {
      return NextResponse.json({ error: "Invalid or expired code" }, { status: 400 });
    }

    // Código válido, gerar token JWT
    const token = await signJwtToken({
      id: user.id,
      email: user.email,
      name: user.name,
      type: 'user',
      role: user.role,
      userSlug: user.slug,
      image: user.image,
      plan: user.plan || undefined,
      isPremium: user.isPremium || false
    });

    // Remover o código de verificação usado
    await prisma.verificationCode.delete({
      where: { userId: user.id }
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
