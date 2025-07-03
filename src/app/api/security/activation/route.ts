import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST - Update activation status
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const { step, action } = await req.json();

    if (!step || !action) {
      return NextResponse.json(
        { error: 'Step e action são obrigatórios' },
        { status: 400 }
      );
    }

    // Buscar tenant do usuário
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { 
        tenant: {
          select: { id: true }
        }
      }
    });

    if (!user?.tenant) {
      return NextResponse.json(
        { error: 'Tenant não encontrado' },
        { status: 400 }
      );
    }

    // Atualizar status baseado no step e action
    const updateData: any = {};
    const now = new Date();

    switch (step) {
      case 'DOWNLOAD_INSTALLER':
        if (action === 'complete') {
          updateData.installerDownloaded = true;
          updateData.installerDownloadedAt = now;
          updateData.currentStep = 'INSTALL_DEVICE';
        }
        break;

      case 'INSTALL_DEVICE':
        if (action === 'complete') {
          updateData.deviceInstalled = true;
          updateData.deviceInstalledAt = now;
          updateData.currentStep = 'VERIFY_EMAIL';
        }
        break;

      case 'VERIFY_EMAIL':
        if (action === 'complete') {
          updateData.emailVerified = true;
          updateData.emailVerifiedAt = now;
          updateData.currentStep = 'COMPLETED';
          updateData.wizardCompleted = true;
          updateData.wizardCompletedAt = now;
        }
        break;

      default:
        return NextResponse.json(
          { error: 'Step inválido' },
          { status: 400 }
        );
    }

    // Atualizar status de ativação
    const activationStatus = await prisma.activationStatus.upsert({
      where: { tenantId: user.tenant.id },
      update: updateData,
      create: {
        tenantId: user.tenant.id,
        ...updateData
      }
    });

    return NextResponse.json({
      success: true,
      activationStatus: {
        currentStep: activationStatus.currentStep,
        installerDownloaded: activationStatus.installerDownloaded,
        deviceInstalled: activationStatus.deviceInstalled,
        emailVerified: activationStatus.emailVerified,
        wizardCompleted: activationStatus.wizardCompleted
      }
    });

  } catch (error) {
    console.error('Error updating activation status:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      },
      { status: 500 }
    );
  }
}

// GET - Get activation status
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Buscar status de ativação
    const activationStatus = await prisma.activationStatus.findFirst({
      where: {
        tenant: {
          owner: { id: session.user.id }
        }
      }
    });

    if (!activationStatus) {
      return NextResponse.json({
        activationStatus: {
          currentStep: 'DOWNLOAD_INSTALLER',
          installerDownloaded: false,
          deviceInstalled: false,
          emailVerified: false,
          wizardCompleted: false
        }
      });
    }

    return NextResponse.json({
      activationStatus: {
        currentStep: activationStatus.currentStep,
        installerDownloaded: activationStatus.installerDownloaded,
        deviceInstalled: activationStatus.deviceInstalled,
        emailVerified: activationStatus.emailVerified,
        wizardCompleted: activationStatus.wizardCompleted
      }
    });

  } catch (error) {
    console.error('Error getting activation status:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      },
      { status: 500 }
    );
  }
} 