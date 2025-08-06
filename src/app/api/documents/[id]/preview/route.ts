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

    // Get user with their roles
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        userRoles: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    // Determine user's primary role
    let primaryRole = "CLIENT";
    if (user.userRoles.some(ur => ur.role === "SUPER_ADMIN")) {
      primaryRole = "SUPER_ADMIN";
    } else if (user.userRoles.some(ur => ur.role === "BUSINESS")) {
      primaryRole = "BUSINESS";
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

    // Check permissions with detailed logging
    console.log("=== DOCUMENT PREVIEW ACCESS CHECK ===");
    console.log("User ID:", user.id);
    console.log("Document ID:", document.id);
    console.log("Document Owner ID:", document.userId);
    console.log("Primary Role:", primaryRole);
    console.log("User Roles:", user.userRoles.map(ur => ur.role));
    console.log("Document Access Count:", document.documentAccess.length);
    console.log("Document Access Records:", document.documentAccess);
    
    // Check if user is owner
    const isOwner = document.userId === user.id;
    console.log("Is Owner?", isOwner);
    
    // Check if user has admin/business access
    const hasAdminAccess = (primaryRole === "SUPER_ADMIN" || primaryRole === "BUSINESS") && isOwner;
    console.log("Has Admin Access?", hasAdminAccess);
    
    // Check if user has client access via document sharing
    const hasClientSharedAccess = primaryRole === "CLIENT" && document.documentAccess.length > 0;
    console.log("Has Client Shared Access?", hasClientSharedAccess);
    
    // Check if client is the document owner (should also have access)
    const isClientOwner = primaryRole === "CLIENT" && isOwner;
    console.log("Is Client Owner?", isClientOwner);
    
    // Determine overall access - owner always has access regardless of role
    const hasAccess = isOwner || hasClientSharedAccess;
    console.log("FINAL ACCESS DECISION:", hasAccess ? "GRANTED" : "DENIED");
    
    if (!hasAccess) {
      console.error("=== ACCESS DENIED DETAILS ===");
      console.error("User:", user.email);
      console.error("Document:", document.name);
      console.error("Reason:", !isOwner ? "Not document owner" : "No document access record");
      
      return NextResponse.json({ 
        error: "Access denied", 
        details: {
          role: primaryRole,
          isOwner,
          hasDocumentAccess: document.documentAccess.length > 0,
          message: primaryRole === "CLIENT" 
            ? "This document has not been shared with you" 
            : "You do not have permission to view this document"
        }
      }, { status: 403 });
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
      const watermarkText = primaryRole === "CLIENT"
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