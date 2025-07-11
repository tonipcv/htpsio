import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getMinioClient } from "@/lib/minio";
import { isPDFCorrupted } from "@/lib/pdf-test";
import { addWatermark } from "@/lib/watermark";

const BUCKET_NAME = "futurostech";
const ORIGINAL_FILES_PREFIX = "original/";
const WATERMARKED_FILES_PREFIX = "watermarked/";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log("🔍 Preview requested for document:", id);
    
    const session = await getServerSession(authOptions);
    console.log("👤 Session:", session);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    console.log("👤 User:", user);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get document
    const document = await prisma.document.findFirst({
      where: { id },
    });
    console.log("📄 Document:", document);

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // Get MinIO client
    const minioClient = await getMinioClient();

    try {
      // Get original file from MinIO
      console.log("📥 Fetching original file from MinIO...");
      const originalStream = await minioClient.getObject(
        BUCKET_NAME,
        document.s3Key
      );

      // Read the file content
      console.log("📖 Reading file content...");
      const chunks: Buffer[] = [];
      
      for await (const chunk of originalStream) {
        chunks.push(chunk);
      }
      
      const fileContent = Buffer.concat(chunks);
      console.log("📊 File content size:", fileContent.length, "bytes");

      // Verificar se o arquivo está corrompido
      console.log("🔍 Checking file integrity...");
      if (isPDFCorrupted(fileContent)) {
        console.error("❌ File is corrupted!");
        return NextResponse.json({ 
          error: "File is corrupted in storage" 
        }, { status: 500 });
      }

      // Generate a unique preview key
      const previewKey = `${document.id}-${user.id}-preview-${Date.now()}`;
      const watermarkedKey = `${WATERMARKED_FILES_PREFIX}${user.id}/${previewKey}-${document.name}`;

      // Add watermark with preview text
      console.log("💧 Adding preview watermark to PDF...");
      const watermarkText = `ID:${user.id.slice(0, 8)} • ${new Date().toISOString().slice(0, 10)}`;
      const watermarkedContent = await addWatermark(fileContent, watermarkText, {
        fontSize: 8,
        opacity: 0.15,
        angle: -45,
        color: { r: 0.5, g: 0.5, b: 0.5 }
      });

      // Upload watermarked version
      console.log("📤 Uploading watermarked preview version...");
      await minioClient.putObject(
        BUCKET_NAME,
        watermarkedKey,
        watermarkedContent,
        watermarkedContent.length,
        { "Content-Type": document.mimeType }
      );

      // Generate presigned URL for watermarked version
      console.log("🔗 Generating temporary preview URL...");
      const presignedUrl = await minioClient.presignedGetObject(
        BUCKET_NAME,
        watermarkedKey,
        60 * 5 // URL válida por 5 minutos
      );

      console.log("✅ Preview process completed successfully!");
      return NextResponse.json({ 
        url: presignedUrl,
        name: document.name,
        size: document.size,
        mimeType: document.mimeType
      });

    } catch (error) {
      console.error("❌ Error processing document:", error);
      return NextResponse.json({ 
        error: "Error processing document" 
      }, { status: 500 });
    }
  } catch (error) {
    console.error("❌ Error in preview handler:", error);
    return NextResponse.json({ 
      error: "Internal server error" 
    }, { status: 500 });
  }
} 