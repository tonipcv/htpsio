import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import nodemailer from "nodemailer";

if (!process.env.SMTP_HOST || !process.env.SMTP_PORT || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD || !process.env.SMTP_FROM) {
  console.warn('SMTP configuration missing - emails will not be sent');
}

const transporter = process.env.SMTP_HOST ? nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
}) : null;

// GET - Listar clientes do admin
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true }
    });

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const clients = await prisma.user.findMany({
      where: {
        role: "client",
        adminId: user.id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        slug: true,
        createdAt: true,
        _count: {
          select: {
            documentAccess: true,
          }
        }
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(clients);
  } catch (error) {
    console.error("Error fetching clients:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Criar novo cliente
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true }
    });

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { name, email } = await req.json();

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
    }

    // Verificar se email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 });
    }

    // Gerar slug único
    const baseSlug = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
    let slug = baseSlug;
    let counter = 1;
    
    while (true) {
      const existingSlug = await prisma.user.findUnique({
        where: { slug },
      });
      
      if (!existingSlug) break;
      slug = `${baseSlug}${counter}`;
      counter++;
    }

    // Generate reset token for password creation
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Criar cliente
    const client = await prisma.user.create({
      data: {
        name,
        email,
        password: "",
        slug,
        role: "client",
        adminId: user.id,
        resetToken: hashedToken,
        resetTokenExpiry: new Date(Date.now() + 3600000), // 1 hour from now
      },
      select: {
        id: true,
        name: true,
        email: true,
        slug: true,
        createdAt: true,
      },
    });

    // Send password creation email
    if (transporter) {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
                     process.env.NEXTAUTH_URL || 
                     'http://localhost:3000';
      
      const resetUrl = `${baseUrl}/auth/reset-password?token=${resetToken}`;

      try {
        await transporter.verify();
        await transporter.sendMail({
          from: {
            name: 'MED1',
            address: process.env.SMTP_FROM as string
          },
          to: email,
          subject: 'Bem-vindo ao MED1 - Configure sua senha',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #1a365d; margin-bottom: 24px;">Bem-vindo ao MED1!</h1>
              <p style="color: #4a5568; font-size: 16px; line-height: 1.5;">Olá ${name},</p>
              <p style="color: #4a5568; font-size: 16px; line-height: 1.5;">Uma conta foi criada para você no MED1. Para começar a usar, por favor configure sua senha clicando no botão abaixo:</p>
              <div style="margin: 32px 0;">
                <a href="${resetUrl}" 
                   style="background-color: #3b82f6; 
                          color: white; 
                          text-decoration: none; 
                          padding: 12px 24px; 
                          border-radius: 6px;
                          font-weight: 500;
                          display: inline-block;">
                  Configurar minha senha
                </a>
              </div>
              <p style="color: #4a5568; font-size: 16px; line-height: 1.5;">Este link é válido por 1 hora. Se você não solicitou esta conta, por favor ignore este email.</p>
              <p style="color: #4a5568; font-size: 16px; line-height: 1.5;">Atenciosamente,<br>Equipe MED1</p>
            </div>
          `
        });
      } catch (emailError) {
        console.error('Error sending password creation email:', emailError);
        // Don't fail the client creation if email fails
      }
    }

    return NextResponse.json(client);
  } catch (error) {
    console.error("Error creating client:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 