import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { makeAcronisRequest } from '../acronis/auth';
import { ACRONIS_API_CONFIG } from '../acronis/config';
import { prisma } from "@/lib/prisma";

// GET - Get isolation status for a device
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const deviceId = searchParams.get('deviceId');

    if (!deviceId) {
      return NextResponse.json(
        { error: 'ID do dispositivo é obrigatório' },
        { status: 400 }
      );
    }

    // Get isolation status from Acronis
    const response = await makeAcronisRequest(
      ACRONIS_API_CONFIG.ENDPOINTS.ISOLATION_STATUS.replace('{agent_id}', deviceId),
      'GET'
    );

    // Get device details
    const device = await makeAcronisRequest(
      `${ACRONIS_API_CONFIG.ENDPOINTS.AGENTS}/${deviceId}`,
      'GET'
    );

    return NextResponse.json({
      deviceId,
      deviceName: device.name,
      isIsolated: response.isolated,
      isolationTime: response.isolation_time,
      isolatedBy: response.isolated_by,
      isolationReason: response.isolation_reason,
      lastStatusUpdate: response.last_status_update
    });

  } catch (error) {
    console.error('Error getting isolation status:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      },
      { status: 500 }
    );
  }
}

// POST - Isolate or restore a device
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const { deviceId, action, reason } = await req.json();

    if (!deviceId || !action) {
      return NextResponse.json(
        { error: 'ID do dispositivo e ação são obrigatórios' },
        { status: 400 }
      );
    }

    if (!['isolate', 'restore'].includes(action)) {
      return NextResponse.json(
        { error: 'Ação inválida. Use "isolate" ou "restore"' },
        { status: 400 }
      );
    }

    // Get current device status
    const currentStatus = await makeAcronisRequest(
      ACRONIS_API_CONFIG.ENDPOINTS.ISOLATION_STATUS.replace('{agent_id}', deviceId),
      'GET'
    );

    // Check if action matches current state
    if (action === 'isolate' && currentStatus.isolated) {
      return NextResponse.json(
        { error: 'Dispositivo já está isolado' },
        { status: 400 }
      );
    }

    if (action === 'restore' && !currentStatus.isolated) {
      return NextResponse.json(
        { error: 'Dispositivo não está isolado' },
        { status: 400 }
      );
    }

    // Execute action
    const endpoint = action === 'isolate' 
      ? ACRONIS_API_CONFIG.ENDPOINTS.ISOLATE_ENDPOINT
      : ACRONIS_API_CONFIG.ENDPOINTS.RESTORE_ENDPOINT;

    const response = await makeAcronisRequest(
      endpoint.replace('{agent_id}', deviceId),
      'POST',
      reason ? { reason } : undefined
    );

    // Log the action
    await prisma.securityAction.create({
      data: {
        userId: session.user.id,
        deviceId,
        action,
        reason: reason || null,
        status: 'completed',
        timestamp: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: action === 'isolate' 
        ? 'Dispositivo isolado com sucesso'
        : 'Dispositivo restaurado com sucesso',
      taskId: response.id
    });

  } catch (error) {
    console.error('Error executing isolation action:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      },
      { status: 500 }
    );
  }
} 