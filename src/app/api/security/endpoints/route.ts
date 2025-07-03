import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { makeAcronisRequest } from '../acronis/auth';
import { ACRONIS_API_CONFIG } from '../acronis/config';
import { prisma } from "@/lib/prisma";

// GET - List all endpoints for the user's tenant
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user?.acronisTenantId) {
      return NextResponse.json(
        { error: 'Tenant não encontrado. Configure a proteção primeiro.' },
        { status: 400 }
      );
    }

    // Buscar endpoints do usuário
    const response = await makeAcronisRequest(
      ACRONIS_API_CONFIG.ENDPOINTS.USER_ENDPOINTS.replace('{tenant_id}', user.acronisTenantId),
      'GET'
    );

    const endpoints = (response.items || []).map((endpoint: any) => ({
      id: endpoint.id,
      name: endpoint.name || endpoint.hostname || 'Dispositivo sem nome',
      os: endpoint.os_type || endpoint.os || 'Desconhecido',
      status: endpoint.status || 'unknown',
      lastSeen: endpoint.last_seen || endpoint.lastSeen || null,
      version: endpoint.version || 'N/A',
      isIsolated: endpoint.isolation_status?.isolated || false,
      protectionStatus: endpoint.protection_status || 'unknown'
    }));

    // Obter limites do plano
    const planLimits = {
      free: { max: 1, features: { antivirus: true, firewall: false, isolation: false, backup: false } },
      basic: { max: 3, features: { antivirus: true, firewall: true, isolation: false, backup: false } },
      pro: { max: 10, features: { antivirus: true, firewall: true, isolation: true, backup: false } },
      enterprise: { max: 50, features: { antivirus: true, firewall: true, isolation: true, backup: true } },
      custom: { max: null, features: { antivirus: true, firewall: true, isolation: true, backup: true } }
    };

    const currentEndpoints = await prisma.device.count({
      where: { tenantId: user.acronisTenantId }
    });

    const plan = planLimits[user.plan as keyof typeof planLimits] || planLimits.free;

    return NextResponse.json({ 
      endpoints,
      limits: {
        max: plan.max,
        current: currentEndpoints,
        canAddMore: plan.max === null || currentEndpoints < plan.max,
        features: plan.features
      }
    });

  } catch (error) {
    console.error('Error listing endpoints:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST - Register a new endpoint
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const { name, os = 'windows' } = await req.json();

    if (!name) {
      return NextResponse.json(
        { error: 'Nome do endpoint é obrigatório' },
        { status: 400 }
      );
    }

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user?.acronisTenantId) {
      return NextResponse.json(
        { error: 'Tenant não encontrado. Configure a proteção primeiro.' },
        { status: 400 }
      );
    }

    // Verificar limite do plano
    const planLimits = {
      free: { max: 1, features: { antivirus: true, firewall: false, isolation: false, backup: false } },
      basic: { max: 3, features: { antivirus: true, firewall: true, isolation: false, backup: false } },
      pro: { max: 10, features: { antivirus: true, firewall: true, isolation: true, backup: false } },
      enterprise: { max: 50, features: { antivirus: true, firewall: true, isolation: true, backup: true } },
      custom: { max: null, features: { antivirus: true, firewall: true, isolation: true, backup: true } }
    };

    const currentEndpoints = await prisma.device.count({
      where: { tenantId: user.acronisTenantId }
    });

    const plan = planLimits[user.plan as keyof typeof planLimits] || planLimits.free;

    if (plan.max !== null && currentEndpoints >= plan.max) {
      return NextResponse.json(
        { 
          error: `Limite de ${plan.max} endpoints atingido. Faça upgrade do plano para adicionar mais endpoints.`,
          code: 'PLAN_LIMIT_REACHED'
        },
        { status: 400 }
      );
    }

    // Registrar novo endpoint
    const response = await makeAcronisRequest(
      ACRONIS_API_CONFIG.ENDPOINTS.ENDPOINT_REGISTER,
      'POST',
      {
        tenant_id: user.acronisTenantId,
        name: name,
        os_type: os,
        registration_token: {
          type: 'permanent'
        }
      }
    );

    return NextResponse.json({
      message: 'Endpoint registrado com sucesso',
      endpoint: {
        id: response.id,
        name: name,
        os: os,
        status: 'pending',
        version: response.version || 'N/A',
        protectionStatus: 'pending'
      }
    });

  } catch (error) {
    console.error('Error creating endpoint:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro ao registrar endpoint' },
      { status: 500 }
    );
  }
}

// DELETE - Remove an endpoint
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID do endpoint é obrigatório' },
        { status: 400 }
      );
    }

    // Remover endpoint da Acronis
    await makeAcronisRequest(
      ACRONIS_API_CONFIG.ENDPOINTS.ENDPOINT_UNREGISTER.replace('{agent_id}', id),
      'POST'
    );

    return NextResponse.json({
      message: 'Endpoint removido com sucesso'
    });

  } catch (error) {
    console.error('Error deleting endpoint:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro ao remover endpoint' },
      { status: 500 }
    );
  }
} 