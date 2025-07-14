import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getMinioClient } from "@/lib/minio";
import { addWatermark } from "@/lib/watermark";

const BUCKET_NAME = "futurostech";
const ORIGINAL_FILES_PREFIX = "original/";
const WATERMARKED_FILES_PREFIX = "watermarked/";
const PREVIEW_EXPIRY = 60 * 60; // 1 hour

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        role: true,
        name: true,
        email: true,
      }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get document with minimal fields
    const document = await prisma.document.findFirst({
      where: { id },
      select: {
        id: true,
        name: true,
        s3Key: true,
        userId: true,
        documentAccess: {
          where: { clientId: user.id },
          select: { id: true }
        }
      }
    });

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // Check permissions
    const hasAccess = 
      user.role === "admin" && document.userId === user.id || 
      user.role === "client" && document.documentAccess.length > 0;

    if (!hasAccess) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Get MinIO client
    const minioClient = await getMinioClient();

    // Generate a consistent preview key for caching
    const previewKey = `${WATERMARKED_FILES_PREFIX}preview/${document.id}/${user.id}/${document.name}`;

    try {
      // Try to get existing watermarked version
      await minioClient.statObject(BUCKET_NAME, previewKey);
      
      // Existing watermarked version found, generate URL with caching headers
      const presignedUrl = await minioClient.presignedGetObject(
        BUCKET_NAME,
        previewKey,
        PREVIEW_EXPIRY
      );

      return new NextResponse(
        JSON.stringify({ 
          url: presignedUrl,
          name: document.name,
          cached: true
        }),
        {
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=3600',
            'ETag': `"${document.id}-${user.id}"`,
          }
        }
      );
    } catch (err) {
      // File doesn't exist, create new watermarked version
      const originalStream = await minioClient.getObject(
        BUCKET_NAME,
        document.s3Key
      );

      // Read the file content
      const chunks: Buffer[] = [];
      for await (const chunk of originalStream) {
        chunks.push(chunk);
      }
      const fileContent = Buffer.concat(chunks);

      // Add watermark with preview text
      const watermarkText = user.role === "client"
        ? `Cliente: ${user.name || user.email} | ID: ${user.id.slice(0, 8)} | Preview`
        : `ID:${user.id.slice(0, 8)} • ${new Date().toISOString().slice(0, 10)}`;
      
      const watermarkedContent = await addWatermark(fileContent, watermarkText, {
        fontSize: 8,
        opacity: 0.15,
        angle: -45,
        color: { r: 0.5, g: 0.5, b: 0.5 }
      });

      // Upload watermarked version with caching headers
      await minioClient.putObject(
        BUCKET_NAME,
        previewKey,
        watermarkedContent,
        watermarkedContent.length,
        { 
          'Content-Type': 'application/pdf',
          'Cache-Control': 'public, max-age=3600',
          'ETag': `"${document.id}-${user.id}"`
        }
      );

      // Generate presigned URL
      const presignedUrl = await minioClient.presignedGetObject(
        BUCKET_NAME,
        previewKey,
        PREVIEW_EXPIRY
      );

      return new NextResponse(
        JSON.stringify({ 
          url: presignedUrl,
          name: document.name,
          cached: false
        }),
        {
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=3600',
            'ETag': `"${document.id}-${user.id}"`,
          }
        }
      );
    }
  } catch (error) {
    console.error("Error in preview handler:", error);
    return NextResponse.json({ 
      error: "Internal server error" 
    }, { status: 500 });
  }
} 