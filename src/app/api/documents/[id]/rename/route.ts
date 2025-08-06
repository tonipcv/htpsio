import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  // Validate ID parameter
  if (typeof id !== 'string' || !id) {
    return NextResponse.json({ error: "Invalid document ID" }, { status: 400 });
  }

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user is an admin
    const userRoles = await prisma.userRole.findMany({
      where: { userId: user.id },
      select: { role: true }
    });
    
    const isAdmin = userRoles.some(r => r.role === 'SUPER_ADMIN' || r.role === 'BUSINESS');
    
    if (!isAdmin) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    }

    // Find document
    const document = await prisma.document.findUnique({
      where: { id },
    });

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // Verify ownership
    if (document.userId !== user.id) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    }

    // Get new name from request body
    const { name } = await req.json();
    
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json({ error: "Valid name is required" }, { status: 400 });
    }

    // Update document name in database
    const updatedDocument = await prisma.document.update({
      where: { id },
      data: { name: name.trim() },
    });

    return NextResponse.json(updatedDocument);
  } catch (error) {
    console.error("Rename document error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
