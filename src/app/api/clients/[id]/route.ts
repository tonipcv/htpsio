import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(request: NextRequest) {
  // Extract the ID from the URL
  const id = request.nextUrl.pathname.split('/').pop();
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    });

    if (!user) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }
    
    // Note: Role check removed as role field no longer exists in schema

    // Get the client to verify ownership
    const client = await prisma.user.findUnique({
      where: { id },
      select: { adminId: true }
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Verify the client belongs to this admin
    if (client.adminId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // First delete any related subscription records to avoid foreign key constraint errors
    await prisma.subscription.deleteMany({
      where: { userId: id }
    });
    
    // Delete any document access records
    await prisma.documentAccess.deleteMany({
      where: { clientId: id }
    });
    
    // Delete any UserRole records to avoid foreign key constraint errors
    await prisma.userRole.deleteMany({
      where: { userId: id }
    });
    
    // Then delete any document downloads
    await prisma.documentDownload.deleteMany({
      where: { userId: id }
    });
    
    // Then delete any document access logs
    await prisma.documentAccessLog.deleteMany({
      where: { userId: id }
    });
    
    // Finally delete the client
    await prisma.user.delete({
      where: { id }
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting client:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 