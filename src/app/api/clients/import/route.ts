import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { parse } from 'csv-parse/sync';

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

    // Get the form data
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Read and parse CSV
    const csvText = await file.text();
    const records = parse(csvText, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });

    // Validate records
    if (!Array.isArray(records) || records.length === 0) {
      return NextResponse.json({ error: "CSV file is empty" }, { status: 400 });
    }

    // Process each record
    const results = {
      imported: 0,
      errors: [] as string[],
    };

    for (const record of records) {
      try {
        // Validate required fields
        if (!record.name || !record.email) {
          results.errors.push(`Missing required fields for record: ${JSON.stringify(record)}`);
          continue;
        }

        // Check if email already exists
        const existingUser = await prisma.user.findUnique({
          where: { email: record.email },
        });

        if (existingUser) {
          results.errors.push(`Email already exists: ${record.email}`);
          continue;
        }

        // Generate slug
        const baseSlug = record.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
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

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString("hex");
        const hashedToken = crypto
          .createHash("sha256")
          .update(resetToken)
          .digest("hex");

        // Create client
        const client = await prisma.user.create({
          data: {
            name: record.name,
            email: record.email,
            password: "",
            slug,
            role: "client",
            adminId: user.id,
            resetToken: hashedToken,
            resetTokenExpiry: new Date(Date.now() + 3600000), // 1 hour from now
          },
        });

        // Send welcome email
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
              to: record.email,
              subject: 'Bem-vindo ao MED1 - Configure sua senha',
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                  <h1 style="color: #1a365d; margin-bottom: 24px;">Bem-vindo ao MED1!</h1>
                  <p style="color: #4a5568; font-size: 16px; line-height: 1.5;">Olá ${record.name},</p>
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
            console.error('Error sending welcome email:', emailError);
            results.errors.push(`Failed to send welcome email to ${record.email}`);
          }
        }

        results.imported++;
      } catch (error) {
        console.error('Error processing record:', error);
        results.errors.push(`Failed to process record: ${JSON.stringify(record)}`);
      }
    }

    return NextResponse.json({
      imported: results.imported,
      errors: results.errors,
      message: `Successfully imported ${results.imported} clients${results.errors.length > 0 ? ` with ${results.errors.length} errors` : ''}`
    });
  } catch (error) {
    console.error("Error importing clients:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 