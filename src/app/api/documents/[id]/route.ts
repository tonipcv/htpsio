import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getMinioClient } from "@/lib/minio";

const BUCKET_NAME = "futurostech";

export async function DELETE(req: NextRequest) {
  // Extract the ID from the URL
  const id = req.nextUrl.pathname.split('/').pop();
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

    // Delete document from MinIO
    const minioClient = await getMinioClient();
    
    try {
      // Delete original file
      await minioClient.removeObject(BUCKET_NAME, document.s3Key);
      
      // Check if watermarked version exists and delete it
      const watermarkedKey = document.s3Key.replace("original/", "watermarked/");
      try {
        await minioClient.statObject(BUCKET_NAME, watermarkedKey);
        await minioClient.removeObject(BUCKET_NAME, watermarkedKey);
      } catch (error) {
        // Watermarked version might not exist, ignore error
        console.log("No watermarked version found or error removing it:", error);
      }
    } catch (error) {
      console.error("Error deleting file from storage:", error);
      // Continue with database deletion even if storage deletion fails
    }

    // Delete document access records first (foreign key constraint)
    await prisma.documentAccess.deleteMany({
      where: { documentId: id },
    });
    
    // Delete document record
    await prisma.document.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete document error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
