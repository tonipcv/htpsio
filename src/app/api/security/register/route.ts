import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createTenant, getTenant, activateTenant } from '../acronis/tenant';

// GET - Check registration status
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Verificar se o usuário já tem um tenant_id
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { acronisTenantId: true }
    });

    return NextResponse.json({
      isRegistered: !!user?.acronisTenantId
    });

  } catch (error) {
    console.error('Error checking registration:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      },
      { status: 500 }
    );
  }
}

// POST - Register new tenant
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const { companyName } = await req.json();

    if (!companyName) {
      return NextResponse.json(
        { error: 'Nome da empresa é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se o usuário já tem um tenant
    const existingUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { acronisTenantId: true }
    });

    if (existingUser?.acronisTenantId) {
      return NextResponse.json(
        { error: 'Usuário já possui um tenant registrado' },
        { status: 400 }
      );
    }

    try {
      // Criar tenant na Acronis
      const tenant = await createTenant(
        companyName,
        session.user.email,
        '' // phone opcional
      );

      // Tentar ativar o tenant (não falha se não conseguir)
      try {
        await activateTenant(tenant.id);
      } catch (activationError) {
        console.warn('Tenant activation failed, but continuing with registration:', activationError);
      }

      // Atualizar o usuário com o tenant_id
      await prisma.user.update({
        where: { id: session.user.id },
        data: { acronisTenantId: tenant.id }
      });

      return NextResponse.json({
        success: true,
        tenant: tenant,
        message: tenant.name === companyName 
          ? 'Tenant criado com sucesso'
          : `Tenant criado com sucesso com o nome "${tenant.name}" pois "${companyName}" já estava em uso`
      });

    } catch (error) {
      // Verificar se é um erro de conflito de nome
      if (error instanceof Error && error.message.includes('tenant with same name already exists')) {
        return NextResponse.json(
          { 
            error: 'Nome da empresa já está em uso. Por favor, tente outro nome.',
            code: 'NAME_CONFLICT'
          },
          { status: 409 }
        );
      }

      throw error; // Re-throw outros tipos de erro
    }

  } catch (error) {
    console.error('Error registering tenant:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
} 