import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { transporter } from "@/lib/email";

// Função para gerar um código de 6 dígitos
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Função para enviar o código por email
async function sendVerificationCode(email: string, code: string, name?: string) {
  if (!transporter) {
    throw new Error('Email transporter not configured');
  }
  
  await transporter.verify();
  
  await transporter.sendMail({
    from: {
      name: 'Xase',
      address: process.env.SMTP_FROM as string
    },
    to: email,
    subject: 'Your Login Code',
    text: `Hello ${name || ''},\n\nYour login code is: ${code}\n\nThis code will expire in 15 minutes.\n\nRegards,\nXase Team`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Your Login Code</h2>
        <p>Hello ${name || ''},</p>
        <p>Your login code is:</p>
        <div style="background-color: #f5f5f7; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0; border-radius: 4px;">
          ${code}
        </div>
        <p>This code will expire in 15 minutes.</p>
        <p>Regards,<br>Xase Team</p>
      </div>
    `
  });
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Verificar se o usuário existe
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true }
    });

    if (!user) {
      // Por segurança, não informamos que o email não existe
      return NextResponse.json({ success: true });
    }

    // Gerar um código de verificação
    const verificationCode = generateVerificationCode();
    
    // Calcular a data de expiração (15 minutos)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    // Salvar o código no banco de dados
    await prisma.verificationCode.upsert({
      where: { email: user.email },
      update: {
        code: verificationCode,
        expiresAt
      },
      create: {
        email: user.email,
        code: verificationCode,
        expiresAt
      }
    });

    // Enviar o código por email
    await sendVerificationCode(user.email, verificationCode, user.name);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error requesting login code:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
