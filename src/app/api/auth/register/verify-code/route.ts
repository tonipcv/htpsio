import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { email, code } = await req.json();
    
    // Basic validation
    if (!email || !code) {
      return NextResponse.json(
        { message: "Email and code are required" },
        { status: 400 }
      );
    }

    // Find verification code
    const verificationRecord = await prisma.verificationCode.findFirst({
      where: { email },
    });

    // Check if code exists
    if (!verificationRecord) {
      return NextResponse.json(
        { message: "Verification code not found" },
        { status: 400 }
      );
    }

    // Check if code has expired
    if (verificationRecord.expiresAt < new Date()) {
      return NextResponse.json(
        { message: "Verification code has expired" },
        { status: 400 }
      );
    }

    // Check if code is correct
    if (verificationRecord.code !== code) {
      return NextResponse.json(
        { message: "Invalid verification code" },
        { status: 400 }
      );
    }

    // Valid code, mark as verified
    await prisma.verificationCode.update({
      where: { id: verificationRecord.id },
      data: { verified: true }
    });

    return NextResponse.json(
      { 
        success: true,
        message: "Code verified successfully" 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error verifying code:', error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
