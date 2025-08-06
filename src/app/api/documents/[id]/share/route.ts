import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendDocumentSharedEmail } from "@/lib/email";

// For detailed console logging
const logPrefix = "[Document Share]";

// Base URL for login
const BASE_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

// POST - Compartilhar documento com cliente
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log("[Document Share] Starting document share process...");
    const { id } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, name: true }
    });

    if (!user) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }
    
    // Note: Role check removed as role field no longer exists in schema

    const { clientId, sendNotification = false } = await req.json();

    if (!clientId) {
      return NextResponse.json({ error: "Client ID is required" }, { status: 400 });
    }

    // Verificar se o documento pertence ao admin
    const document = await prisma.document.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // Verificar se o cliente pertence ao admin e tem o papel de CLIENT
    console.log(`[Document Share] Checking if client ${clientId} belongs to admin ${user.id}`);
    const client = await prisma.user.findFirst({
      where: {
        id: clientId,
        adminId: user.id,
      },
      include: {
        userRoles: true
      }
    });

    if (!client) {
      console.log(`[Document Share] Error: Client not found or does not belong to this admin`);
      return NextResponse.json({ error: "Client not found or does not belong to your account" }, { status: 404 });
    }
    console.log(`[Document Share] Client found: ${client.id} - ${client.name}`);
    console.log(`[Document Share] Client roles:`, client.userRoles.map(ur => ur.role));
    
    // Verificar se o usuário tem o papel de CLIENT
    const isClient = client.userRoles.some(ur => ur.role === 'CLIENT');
    
    // Se o usuário não tiver o papel CLIENT, mas estiver registrado como cliente (adminId está definido),
    // adicionamos automaticamente o papel CLIENT
    if (!isClient) {
      console.log(`[Document Share] User ${client.id} does not have CLIENT role. Adding it now...`);
      
      try {
        // Get tenant ID from the admin user
        const adminUser = await prisma.user.findUnique({
          where: { id: user.id },
          include: { tenant: true }
        });
        
        let tenantId = adminUser?.tenant?.id;
        
        // If admin doesn't have a tenant, create one
        if (!tenantId) {
          console.log(`[Document Share] Admin user has no tenant. Creating one...`);
          
          // Get full user details including email and slug
          const fullUserDetails = await prisma.user.findUnique({
            where: { id: user.id },
            select: { name: true, email: true, slug: true }
          });
          
          if (!fullUserDetails) {
            console.log(`[Document Share] Error: Could not fetch full user details`);
            return NextResponse.json({ error: "Could not fetch user details" }, { status: 500 });
          }
          
          // Create a tenant for the admin user
          const newTenant = await prisma.tenant.create({
            data: {
              name: `${fullUserDetails.name || fullUserDetails.email}'s Organization`,
              slug: `${fullUserDetails.slug || fullUserDetails.email.split('@')[0]}-org`,
            }
          });
          
          // Update the admin user with the new tenant ID
          await prisma.user.update({
            where: { id: user.id },
            data: { tenantId: newTenant.id }
          });
          
          tenantId = newTenant.id;
          console.log(`[Document Share] Created new tenant with ID: ${tenantId}`);
        }
        
        // Add CLIENT role to the user
        await prisma.userRole.create({
          data: {
            userId: client.id,
            tenantId: tenantId,
            role: 'CLIENT'
          }
        });
        
        console.log(`[Document Share] Successfully added CLIENT role to user ${client.id}`);
      } catch (error) {
        console.error(`[Document Share] Error adding CLIENT role:`, error);
        return NextResponse.json({ 
          error: "Failed to assign client role", 
          details: error instanceof Error ? error.message : String(error) 
        }, { status: 500 });
      }
    }
    console.log(`[Document Share] Client role verified successfully`);

    // Criar ou atualizar o compartilhamento
    console.log(`[Document Share] Creating/updating document access for document ${id} and client ${clientId}`);
    const documentAccess = await prisma.documentAccess.upsert({
      where: {
        documentId_clientId: {
          documentId: id,
          clientId,
        },
      },
      update: {
        // Update the grantedAt field instead of createdAt
        grantedAt: new Date(),
      },
      create: {
        documentId: id,
        clientId,
        grantedBy: user.id,
      },
    });
    console.log(`[Document Share] Document access created/updated successfully: ${documentAccess.id}`);

    // Enviar email de notificação se solicitado
    if (sendNotification) {
      console.log(`[Document Share] Sending email notification to client ${client.email}`);
      try {
        await sendDocumentSharedEmail({
          to: client.email,
          recipientName: client.name || 'Client',
          senderName: user.name || 'Admin',
          documentName: document.name,
          loginUrl: `${BASE_URL}/login`
        });
        console.log(`[Document Share] Email sent successfully to ${client.email}`);
      } catch (error) {
        console.error("[Document Share] Error sending email:", error);
        // Continue even if email fails
      }
    }

    console.log(`[Document Share] Document sharing process completed successfully`);
    return NextResponse.json({ 
      ...documentAccess, 
      notificationSent: sendNotification 
    });
  } catch (error) {
    console.error("[Document Share] Error sharing document:", error);
    return NextResponse.json({ 
      error: "Failed to share document", 
      details: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
}

// DELETE - Remover compartilhamento
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log(`[Document Share] Document ID: ${id}`);
    
    const body = await req.json();
    const { clientId } = body;
    console.log(`[Document Share] Request body:`, body);

    if (!clientId) {
      console.log(`[Document Share] Error: Client ID is missing in request`);
      return NextResponse.json({ error: "Client ID is required" }, { status: 400 });
    }
    console.log(`[Document Share] Client ID: ${clientId}`);

    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      console.log(`[Document Share] Error: Unauthorized access`);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { userRoles: true }
    });

    if (!user) {
      console.log(`[Document Share] Error: User not found for email ${session.user.email}`);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    console.log(`[Document Share] Found user: ${user.id}`);
    
    // Check if user has BUSINESS or SUPER_ADMIN role
    const isAdmin = user.userRoles.some(ur => 
      ur.role === 'BUSINESS' || ur.role === 'SUPER_ADMIN'
    );
    
    if (!isAdmin) {
      console.log(`[Document Share] Error: Admin access required`);
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    // Verificar se o documento pertence ao admin
    const document = await prisma.document.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!document) {
      console.log(`[Document Share] Error: Document not found for ID ${id}`);
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }
    console.log(`[Document Share] Found document: ${document.id}`);

    // Remover o compartilhamento
    await prisma.documentAccess.delete({
      where: {
        documentId_clientId: {
          documentId: id,
          clientId,
        },
      },
    });

    console.log(`[Document Share] Document sharing process completed successfully`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Document Share] Error removing document sharing:", error);
    return NextResponse.json({ 
      error: "Failed to remove document sharing", 
      details: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
}
