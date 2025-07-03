import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { makeAcronisRequest } from '../acronis/auth';
import { ACRONIS_API_CONFIG } from '../acronis/config';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { action, deviceId } = body;

    if (!action) {
      return NextResponse.json(
        { error: 'Ação não especificada' },
        { status: 400 }
      );
    }

    // Plan verification removed for testing

    let response;
    switch (action) {
      case 'scan':
        // Create antimalware scan task
        response = await makeAcronisRequest(
          ACRONIS_API_CONFIG.ENDPOINTS.TASKS,
          'POST',
          {
            type: 'antimalware_full_scan',
            agent_id: deviceId,
            schedule: {
              type: 'once',
              start_now: true
            }
          }
        );
        break;

      case 'isolate':
        // Isolate device
        response = await makeAcronisRequest(
          `${ACRONIS_API_CONFIG.ENDPOINTS.AGENTS}/${deviceId}/actions/isolate`,
          'POST'
        );
        break;

      case 'restore':
        // Get latest backup
        const backups = await makeAcronisRequest(
          `${ACRONIS_API_CONFIG.ENDPOINTS.BACKUPS}?agent_id=${deviceId}&limit=1`
        );
        
        if (!backups.items?.length) {
          throw new Error('Nenhum backup encontrado para este dispositivo');
        }

        // Start restore task
        response = await makeAcronisRequest(
          ACRONIS_API_CONFIG.ENDPOINTS.TASKS,
          'POST',
          {
            type: 'restore',
            backup_id: backups.items[0].id,
            agent_id: deviceId,
            schedule: {
              type: 'once',
              start_now: true
            }
          }
        );
        break;

      default:
        return NextResponse.json(
          { error: 'Ação não suportada' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message: `Ação "${action}" iniciada com sucesso`,
      taskId: response.id
    });

  } catch (error) {
    console.error('Erro ao executar ação:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      },
      { status: 500 }
    );
  }
} 