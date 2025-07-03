import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { makeAcronisRequest } from '../acronis/auth';
import { ACRONIS_API_CONFIG } from '../acronis/config';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Get agents (endpoints)
    const agents = await makeAcronisRequest(
      ACRONIS_API_CONFIG.ENDPOINTS.AGENTS
    );

    // Get recent alerts
    const alerts = await makeAcronisRequest(
      `${ACRONIS_API_CONFIG.ENDPOINTS.ALERTS}?limit=100`
    );

    // Get recent tasks
    const tasks = await makeAcronisRequest(
      `${ACRONIS_API_CONFIG.ENDPOINTS.TASKS}?limit=1&type=antimalware_scan`
    );

    // Calculate stats
    const stats = {
      totalEndpoints: agents.items?.length || 0,
      protectedEndpoints: agents.items?.filter((agent: any) => 
        agent.status === 'online' && agent.protection_status === 'protected'
      ).length || 0,
      threatsBlocked: alerts.items?.filter((alert: any) => 
        alert.type === 'malware_detected' && alert.status === 'resolved'
      ).length || 0,
      lastScan: tasks.items?.[0]?.completed_at || null
    };

    // Format recent incidents from alerts
    const recentIncidents = (alerts.items || [])
      .filter((alert: any) => ['malware_detected', 'ransomware_detected', 'suspicious_activity'].includes(alert.type))
      .map((alert: any) => ({
        id: alert.id,
        type: alert.type.replace('_detected', '').replace('_', ''),
        severity: alert.severity,
        device: alert.source?.name || 'Unknown Device',
        timestamp: alert.created_at,
        status: alert.status,
        description: alert.description
      }))
      .slice(0, 10);

    // Format endpoints list
    const endpoints = (agents.items || []).map((agent: any) => ({
      id: agent.id,
      name: agent.name,
      status: agent.protection_status || 'unknown',
      lastSeen: agent.last_seen,
      osType: agent.os_type,
      version: agent.version
    }));

    return NextResponse.json({
      stats,
      recentIncidents,
      endpoints
    });

  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      },
      { status: 500 }
    );
  }
} 