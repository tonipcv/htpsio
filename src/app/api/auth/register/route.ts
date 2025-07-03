import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";
import crypto from "crypto";

if (!process.env.SMTP_HOST || !process.env.SMTP_PORT || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD || !process.env.SMTP_FROM) {
  throw new Error('Missing SMTP configuration environment variables');
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: 465,
  secure: true, // use SSL
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
});

export async function POST(req: Request) {
  try {
    console.log('=== STARTING REGISTRATION PROCESS ===');
    const { name, email, password, slug } = await req.json();
    console.log('Registration data received:', { name, email, slug, passwordLength: password?.length });

    // Basic validation
    if (!name || !email || !password || !slug) {
      console.log('Validation failed: missing required fields');
      return NextResponse.json(
        { message: "Nome, email, senha e slug são obrigatórios" },
        { status: 400 }
      );
    }

    console.log('Basic validation passed');

    // Check if user already exists
    console.log('Checking if user exists with email:', email);
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log('User already exists with email:', email);
      return NextResponse.json(
        { message: "Este email já está em uso" },
        { status: 400 }
      );
    }

    console.log('Email is available');

    // Check if slug is already taken
    console.log('Checking if slug exists:', slug);
    const existingSlug = await prisma.user.findUnique({
      where: { slug },
    });

    if (existingSlug) {
      console.log('Slug already exists:', slug);
      return NextResponse.json(
        { message: "Este username já está em uso. Por favor, escolha outro." },
        { status: 400 }
      );
    }

    console.log('Slug is available');

    // Hash password
    console.log('Hashing password...');
    const hashedPassword = await hash(password, 12);
    console.log('Password hashed successfully');

    // Create user
    console.log('Creating user in database...');
    const user = await prisma.user.create({
      data: {
        id: crypto.randomUUID(),
        name,
        email,
        password: hashedPassword,
        slug
      },
    });

    console.log('User created successfully:', user.id);

    // Send welcome email
    console.log('=== EMAIL SENDING START ===');
    console.log('Sending welcome email to:', email);
    try {
      await transporter.verify();
      console.log('SMTP connection verified');

      await transporter.sendMail({
        from: {
          name: 'MED1',
          address: 'ai@booplabs.com'
        },
        to: email,
        subject: 'Bem-vindo ao MED1',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #1a365d; margin-bottom: 24px;">Bem-vindo ao MED1!</h1>
            <p style="color: #4a5568; font-size: 16px; line-height: 1.5;">Olá ${name},</p>
            <p style="color: #4a5568; font-size: 16px; line-height: 1.5;">Seu cadastro foi realizado com sucesso! Agora você já pode acessar sua conta e começar a usar todas as funcionalidades do MED1.</p>
            <p style="color: #4a5568; font-size: 16px; line-height: 1.5;">Para completar sua configuração, não se esqueça de ativar sua conta Acronis após fazer login.</p>
            <div style="margin: 32px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/auth/signin" 
                 style="background-color: #3b82f6; 
                        color: white; 
                        text-decoration: none; 
                        padding: 12px 24px; 
                        border-radius: 6px;
                        font-weight: 500;
                        display: inline-block;">
                Acessar minha conta
              </a>
            </div>
            <p style="color: #4a5568; font-size: 16px; line-height: 1.5;">Se tiver alguma dúvida, estamos à disposição para ajudar.</p>
            <p style="color: #4a5568; font-size: 16px; line-height: 1.5;">Atenciosamente,<br>Equipe MED1</p>
          </div>
        `
      });
      console.log('Welcome email sent successfully');
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      // Don't fail the registration if email fails, just log the error
    }

    console.log('=== REGISTRATION COMPLETED SUCCESSFULLY ===');
    return NextResponse.json({
      message: 'Conta criada com sucesso',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        slug: user.slug
      },
      redirect: '/auth/signin'
    });

  } catch (error) {
    console.error('=== REGISTRATION PROCESS FAILED ===');
    console.error('Erro no registro:', error);
    return NextResponse.json(
      { error: 'Erro ao criar conta. Por favor, tente novamente.' },
      { status: 500 }
    );
  }
} 