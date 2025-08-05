import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getMinioClient } from "@/lib/minio";
import { isPDFCorrupted } from "@/lib/pdf-test";
import { withSubscription } from "@/lib/subscription-middleware";
import { hasActiveSubscription } from "@/lib/stripe";

const BUCKET_NAME = "futurostech";
const ORIGINAL_FILES_PREFIX = "original/";
const WATERMARKED_FILES_PREFIX = "watermarked/";

// Original POST handler wrapped with subscription middleware
async function handleDocumentUpload(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Check if user has an active subscription
    const hasSubscription = await hasActiveSubscription(session.user.id);
    if (!hasSubscription) {
      return NextResponse.json({ 
        error: "Active subscription required to upload documents",
        upgrade: true
      }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    console.log("📁 Uploading file:", file.name, "Size:", file.size, "Type:", file.type);

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Convert file to buffer and check integrity
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    console.log("🔍 Checking PDF integrity before upload...");
    if (isPDFCorrupted(buffer)) {
      return NextResponse.json({ 
        error: "PDF file appears to be corrupted or invalid" 
      }, { status: 400 });
    }

    // Generate unique S3 key with original files prefix
    const s3Key = `${ORIGINAL_FILES_PREFIX}${user.id}/${Date.now()}-${file.name}`;
    
    // Upload to MinIO - usar o buffer diretamente sem conversão para stream
    const minioClient = await getMinioClient();
    
    console.log("📤 Uploading to MinIO:", s3Key, "Buffer size:", buffer.length);

    await minioClient.putObject(
      BUCKET_NAME,
      s3Key,
      buffer,
      buffer.length,
      { "Content-Type": file.type }
    );

    console.log("✅ Upload to MinIO completed successfully");

    // Create document record
    const document = await prisma.document.create({
      data: {
        name: file.name,
        mimeType: file.type,
        size: file.size,
        s3Key,
        userId: user.id,
      },
    });

    console.log("📄 Document record created:", document.id);

    return NextResponse.json(document);
  } catch (error) {
    console.error("❌ Upload error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Export the POST handler with subscription middleware
export const POST = (req: NextRequest) => withSubscription(req, handleDocumentUpload);

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    console.log("Session:", session); // Debug session

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user first
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        role: true,
        adminId: true,
      }
    });
    console.log("User:", user); // Debug user

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let documents;

    if (user.role === "admin") {
      // Admin vê todos os documentos que ele criou
      documents = await prisma.document.findMany({
        where: {
          userId: user.id,
        },
        orderBy: {
          createdAt: "desc",
        },
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
          documentAccess: {
            include: {
              client: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                }
              }
            }
          }
        },
      });
    } else if (user.role === "client") {
      // Cliente vê apenas documentos compartilhados com ele
      documents = await prisma.document.findMany({
        where: {
          documentAccess: {
            some: {
              clientId: user.id,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      });
    } else {
      return NextResponse.json({ error: "Invalid user role" }, { status: 403 });
    }

    console.log("Documents found:", documents); // Debug documents

    return NextResponse.json(documents);
  } catch (error) {
    console.error("List documents error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 