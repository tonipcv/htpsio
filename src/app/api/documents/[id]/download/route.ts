import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getMinioClient } from "@/lib/minio";
import { addWatermark } from "@/lib/watermark";
import { validatePDF } from "@/lib/pdf-validator";
import { isPDFCorrupted } from "@/lib/pdf-test";

const BUCKET_NAME = "futurostech";
const ORIGINAL_FILES_PREFIX = "original/";
const WATERMARKED_FILES_PREFIX = "watermarked/";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log("🔍 Download requested for document:", id);
    
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
      // Generate a unique watermark key
      const downloadKey = `${document.id}-${user.id}-${Date.now()}`;
      const watermarkedKey = `${WATERMARKED_FILES_PREFIX}${user.id}/${downloadKey}-${document.name}`;

      // Create download record
      console.log("💾 Creating download record...");
      await prisma.documentDownload.create({
        data: {
          documentId: document.id,
          userId: user.id,
          watermarkKey: watermarkedKey,
          ipAddress: req.headers.get("x-forwarded-for") || "unknown",
          userAgent: req.headers.get("user-agent"),
        },
      });

      // Get original file from MinIO
      console.log("📥 Fetching original file from MinIO...");
      const originalStream = await minioClient.getObject(
        BUCKET_NAME,
        document.s3Key
      );

      // Read the file content de forma mais segura
      console.log("📖 Reading file content...");
      const chunks: Buffer[] = [];
      
      for await (const chunk of originalStream) {
        chunks.push(chunk);
      }
      
      const fileContent = Buffer.concat(chunks);
      console.log("📊 File content size:", fileContent.length, "bytes");

      // Verificar se o arquivo baixado está corrompido
      console.log("🔍 Checking downloaded file integrity...");
      if (isPDFCorrupted(fileContent)) {
        console.error("❌ Downloaded file is corrupted!");
        return NextResponse.json({ 
          error: "File is corrupted in storage" 
        }, { status: 500 });
      }

      // Add watermark and save to watermarked folder
      console.log("💧 Adding watermark to PDF...");
      const watermarkedContent = await addWatermark(fileContent, user.name || user.email);

      // Upload watermarked version
      console.log("📤 Uploading watermarked version...");
      await minioClient.putObject(
        BUCKET_NAME,
        watermarkedKey,
        watermarkedContent,
        watermarkedContent.length,
        { "Content-Type": document.mimeType }
      );

      // Generate presigned URL for watermarked version
      console.log("🔗 Generating temporary direct download URL...");
      const presignedUrl = await minioClient.presignedGetObject(
        BUCKET_NAME,
        watermarkedKey,
        60 * 5 // URL válida por 5 minutos
      );

      console.log("✅ Download process completed successfully!");
      return NextResponse.json({ url: presignedUrl });

    } catch (error) {
      console.error("❌ Error processing document:", error);
      return NextResponse.json({ 
        error: "Error processing document" 
      }, { status: 500 });
    }
  } catch (error) {
    console.error("❌ Error in download handler:", error);
    return NextResponse.json({ 
      error: "Internal server error" 
    }, { status: 500 });
  }
} 