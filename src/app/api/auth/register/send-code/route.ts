import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { transporter } from "@/lib/email";
import { ZodError, z } from "zod";

// Schema for validation
const emailSchema = z.object({
  email: z.string().email("Invalid email format")
});

export async function POST(req: Request) {
  try {
    // Parse request body
    let body;
    try {
      body = await req.json();
      console.log('Request body:', body);
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return NextResponse.json(
        { 
          success: false, 
          message: "Invalid request format", 
          details: "Could not parse JSON body" 
        },
        { status: 400 }
      );
    }
    
    // Enhanced validation with Zod
    let email;
    try {
      const result = emailSchema.parse(body);
      email = result.email;
      console.log('Processing verification code request for:', email);
    } catch (validationError) {
      console.error('Validation error:', validationError);
      if (validationError instanceof ZodError) {
        return NextResponse.json(
          { 
            success: false, 
            message: "Validation error", 
            details: validationError.errors.map(e => e.message)
          },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { 
          success: false, 
          message: "Invalid email format" 
        },
        { status: 400 }
      );
    }

    // Check if email is already in use
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log('Email already in use:', email);
      // Verificar se o usuário já está verificado
      const isVerified = existingUser.emailVerified !== null;
      
      if (isVerified) {
        // Se o email já está verificado, não permitir reenvio
        console.log('Email already verified, cannot resend code:', email);
        return NextResponse.json(
          { 
            success: false, 
            message: "This email is already in use and verified" 
          },
          { status: 400 }
        );
      } else {
        // Se o email existe mas não está verificado, permitir reenvio do código
        console.log('Email exists but not verified, allowing code resend:', email);
      }
    }

    // Generate verification code (6 digits)
    const verificationCode = crypto.randomInt(100000, 999999).toString();
    console.log('Generated verification code for', email, ':', verificationCode);
    
    // Store the code temporarily (expires in 10 minutes)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);
    
    try {
      // Check if a code already exists for this email and update or create
      const existingCode = await prisma.verificationCode.findFirst({
        where: { email },
      });

      if (existingCode) {
        console.log('Updating existing verification code for:', email);
        await prisma.verificationCode.update({
          where: { id: existingCode.id },
          data: {
            code: verificationCode,
            expiresAt,
            verified: false
          }
        });
      } else {
        console.log('Creating new verification code for:', email);
        await prisma.verificationCode.create({
          data: {
            email,
            code: verificationCode,
            expiresAt,
            verified: false
          }
        });
      }
    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { 
          success: false, 
          message: "Error storing verification code", 
          details: dbError instanceof Error ? dbError.message : "Unknown database error" 
        },
        { status: 500 }
      );
    }

    // Send email with verification code
    try {
      if (!transporter) {
        console.warn('SMTP not configured, cannot send verification email');
        console.log('Verification code for testing:', verificationCode);
      } else {
        console.log('Attempting to verify SMTP connection...');
        try {
          await transporter.verify();
          console.log('SMTP connection verified for verification code email');
          
          console.log('Attempting to send email to:', email);
          const info = await transporter.sendMail({
            from: {
              name: 'Xase',
              address: process.env.SMTP_FROM as string
            },
            to: email,
            subject: 'Your Verification Code',
            text: `Your verification code is: ${verificationCode}\n\nThis code will expire in 10 minutes.\n\nIf you did not request this code, please ignore this email.\n\nRegards,\nXase Team`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">Email Verification</h2>
                <p>Your verification code is:</p>
                <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; letter-spacing: 5px; font-weight: bold; margin: 20px 0;">
                  ${verificationCode}
                </div>
                <p>This code will expire in 10 minutes.</p>
                <p>If you did not request this code, please ignore this email.</p>
                <p>Regards,<br>Xase Team</p>
              </div>
            `
          });
          
          console.log('Verification code email sent to:', email, 'Message ID:', info.messageId);
        } catch (smtpError) {
          console.error('SMTP error during sending:', smtpError);
          // Log the error but don't fail the request
          console.log('SMTP error, verification code for testing:', verificationCode);
        }
      }
    } catch (emailError) {
      console.error('Email setup error:', emailError);
      // Even with email error, we return success since the code was generated
      console.log('Email setup error, verification code for testing:', verificationCode);
    }

    return NextResponse.json(
      { 
        success: true,
        message: "Verification code sent",
        email
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Unhandled error in send-code endpoint:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Error processing request",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
