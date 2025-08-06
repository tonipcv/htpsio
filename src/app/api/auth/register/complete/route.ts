import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hash } from "bcrypt";
import nodemailer from "nodemailer";
import { ZodError, z } from "zod";
import { signJwtToken } from "@/lib/auth";

// Schema for validation
const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  slug: z.string().min(1, "Username is required")
});

// Email transport configuration
const transporter = process.env.SMTP_HOST ? nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
}) : null;

export async function POST(req: Request) {
  try {
    // Parse request body
    let body;
    try {
      body = await req.json();
      console.log('Request body for complete registration:', body);
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
    let validatedData;
    try {
      validatedData = registerSchema.parse(body);
      console.log('Validated registration data for:', validatedData.email);
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
          message: "Invalid registration data" 
        },
        { status: 400 }
      );
    }
    
    const { name, email, password, slug } = validatedData;

    // Check if email has been verified
    const verificationRecord = await prisma.verificationCode.findFirst({
      where: { email },
    });

    if (!verificationRecord) {
      console.log('No verification record found for email:', email);
      return NextResponse.json(
        { 
          success: false, 
          message: "Email verification required", 
          details: "No verification code was requested for this email. Please request a verification code first." 
        },
        { status: 400 }
      );
    }
    
    if (!verificationRecord.verified) {
      console.log('Email not verified:', email);
      return NextResponse.json(
        { 
          success: false, 
          message: "Email not verified", 
          details: "Please verify your email with the code that was sent to you before completing registration." 
        },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log('Email already registered, updating user data:', email);
      
      // Check if slug is already in use by another user
      if (existingUser.slug !== slug) {
        const slugInUse = await prisma.user.findUnique({
          where: { slug },
        });
        
        if (slugInUse) {
          console.log('Username already in use by another user:', slug);
          return NextResponse.json(
            { 
              success: false, 
              message: "This username is already in use", 
              details: "Please choose a different username." 
            },
            { status: 400 }
          );
        }
      }
      
      // Hash the password if it's provided
      const hashedPassword = await hash(password, 10);
      
      // Update the existing user
      const updatedUser = await prisma.user.update({
        where: { email },
        data: {
          name,
          password: hashedPassword,
          slug,
          // Não atualiza o papel ou plano do usuário existente
        },
      });
      
      // Gerar token JWT para login automático
      const token = await signJwtToken({
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        type: 'user',
        role: updatedUser.role || 'user',
        userSlug: updatedUser.slug,
        image: updatedUser.image || undefined,
        plan: updatedUser.plan || 'free',
        isPremium: updatedUser.isPremium || false
      });
      
      console.log('User data updated successfully for:', email);
      return NextResponse.json(
        { 
          success: true,
          message: "User data updated successfully",
          user: {
            name,
            email,
            slug
          },
          token // Incluir token JWT na resposta
        },
        { status: 200 }
      );
    }

    // Check if slug is already in use
    const existingSlug = await prisma.user.findUnique({
      where: { slug },
    });

    if (existingSlug) {
      console.log('Username already in use:', slug);
      return NextResponse.json(
        { 
          success: false, 
          message: "This username is already in use", 
          details: "Please choose a different username." 
        },
        { status: 400 }
      );
    }

    // Hash the password
    const hashedPassword = await hash(password, 10);

    // Create the user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        slug,
        role: "admin",
        plan: "free",
      },
    });

    // Remove the verification code
    await prisma.verificationCode.delete({
      where: { id: verificationRecord.id },
    });

    // Gerar token JWT para login automático
    const token = await signJwtToken({
      id: user.id,
      email: user.email,
      name: user.name,
      type: 'user',
      role: user.role || 'admin',
      userSlug: user.slug,
      image: undefined,
      plan: user.plan || 'free',
      isPremium: user.isPremium || false
    });

    // Send welcome email
    if (transporter) {
      try {
        await transporter.verify();
        
        await transporter.sendMail({
          from: {
            name: 'Xase',
            address: process.env.SMTP_FROM as string
          },
          to: email,
          subject: 'Welcome to Xase',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #333;">Welcome to Xase, ${name}!</h2>
              <p>Your account has been successfully created.</p>
              <p>You can now log in and start using our platform.</p>
              <p>Best regards,<br>The Xase Team</p>
            </div>
          `
        });
        
        console.log('Welcome email sent to:', email);
      } catch (error) {
        console.error('Error sending welcome email:', error);
      }
    }

    console.log('Registration completed successfully for:', email);
    return NextResponse.json(
      { 
        success: true,
        message: "User created successfully",
        user: {
          name,
          email,
          slug
        },
        token // Incluir token JWT na resposta
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
