import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Get installer status and link
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Verificar se o usuário tem um tenant
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { acronisTenantId: true }
    });

    if (!user?.acronisTenantId) {
      return NextResponse.json(
        { error: 'Tenant não encontrado. Configure a proteção primeiro.' },
        { status: 400 }
      );
    }

    // Buscar ou criar status de ativação
    let activationStatus = await prisma.activationStatus.findFirst({
      where: {
        tenant: {
          users: { some: { id: session.user.id } }
        }
      }
    });

    // Buscar installer existente
    const installer = await prisma.installer.findFirst({
      where: {
        tenant: {
          users: { some: { id: session.user.id } }
        }
      }
    });

    return NextResponse.json({
      activationStatus: activationStatus ? {
        currentStep: activationStatus.currentStep,
        installerDownloaded: activationStatus.installerDownloaded,
        deviceInstalled: activationStatus.deviceInstalled,
        emailVerified: activationStatus.emailVerified,
        wizardCompleted: activationStatus.wizardCompleted
      } : null,
      installer: installer ? {
        url: installer.url,
        os: installer.os,
        expiresAt: installer.expiresAt
      } : null
    });

  } catch (error) {
    console.error('Error getting installer status:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      },
      { status: 500 }
    );
  }
}

// POST - Generate installer link
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const { os = 'windows' } = await req.json();

    // Verificar se o usuário tem um tenant
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { 
        acronisTenantId: true,
        tenant: {
          select: { id: true }
        }
      }
    });

    if (!user?.acronisTenantId) {
      return NextResponse.json(
        { error: 'Tenant não encontrado. Configure a proteção primeiro.' },
        { status: 400 }
      );
    }

    // Criar ou buscar tenant local se não existir
    let localTenant = user.tenant;
    if (!localTenant) {
      localTenant = await prisma.tenant.create({
        data: {
          name: session.user.name || 'Empresa',
          slug: `${session.user.id}-local`,
          users: { connect: { id: session.user.id } },
        }
      });
    }

    // Gerar URL do instalador (simulado - na vida real seria da API do Acronis)
    const installerUrl = `https://dl.acronis.com/u/software/${user.acronisTenantId}/agent_${os}.exe`;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Expira em 7 dias

    // Criar ou atualizar installer
    const installer = await prisma.installer.upsert({
      where: { tenantId: localTenant.id },
      update: {
        url: installerUrl,
        os: os,
        expiresAt: expiresAt
      },
      create: {
        tenantId: localTenant.id,
        url: installerUrl,
        os: os,
        expiresAt: expiresAt
      }
    });

    // Criar ou atualizar status de ativação
    await prisma.activationStatus.upsert({
      where: { tenantId: localTenant.id },
      update: {
        currentStep: 'DOWNLOAD_INSTALLER'
      },
      create: {
        tenantId: localTenant.id,
        currentStep: 'DOWNLOAD_INSTALLER'
      }
    });

    return NextResponse.json({
      success: true,
      installer: {
        url: installer.url,
        os: installer.os,
        expiresAt: installer.expiresAt
      }
    });

  } catch (error) {
    console.error('Error generating installer:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      },
      { status: 500 }
    );
  }
} 