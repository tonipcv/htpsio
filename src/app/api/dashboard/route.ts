import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Função auxiliar para converter BigInt para Number
function convertBigIntToNumber(data: any): any {
  if (data === null || data === undefined) {
    return data;
  }
  
  if (typeof data === 'bigint') {
    return Number(data);
  }
  
  if (Array.isArray(data)) {
    return data.map(convertBigIntToNumber);
  }
  
  if (typeof data === 'object') {
    const result: any = {};
    for (const key in data) {
      result[key] = convertBigIntToNumber(data[key]);
    }
    return result;
  }
  
  return data;
}

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    // Obter a sessão atual
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      );
    }

    // Dados mock para o dashboard de segurança
    const responseData = {
      protectionStatus: {
        protectedDevices: 847,
        totalDevices: 850,
        protectionRate: 99.6,
        lastUpdate: new Date().toISOString(),
      },
      threatMetrics: {
        totalThreatsBlocked: 12483,
        activeThreats: 3,
        criticalAlerts: 2,
        highAlerts: 8,
        mediumAlerts: 24,
        lowAlerts: 45,
      },
      deviceDistribution: {
        workstations: {
          total: 423,
          protected: 421,
          vulnerable: 2,
          types: {
            windows: 312,
            macos: 98,
            linux: 13,
          },
        },
        servers: {
          total: 156,
          protected: 156,
          vulnerable: 0,
          types: {
            windows: 89,
            linux: 67,
          },
        },
        mobileDevices: {
          total: 268,
          protected: 267,
          vulnerable: 1,
          types: {
            ios: 156,
            android: 112,
          },
        },
      },
      vulnerabilities: {
        critical: {
          count: 2,
          details: [
            {
              id: "CVE-2024-1234",
              description: "Remote Code Execution in Apache 2.4.x",
              affectedDevices: 2,
              status: "patch_pending",
              discoveredAt: "2024-03-20T10:30:00Z",
            },
            {
              id: "CVE-2024-5678",
              description: "Buffer Overflow in Legacy Application",
              affectedDevices: 1,
              status: "investigating",
              discoveredAt: "2024-03-20T14:15:00Z",
            },
          ],
        },
        high: {
          count: 8,
          details: [
            {
              id: "CVE-2024-9012",
              description: "Privilege Escalation Vulnerability",
              affectedDevices: 5,
              status: "patch_scheduled",
              discoveredAt: "2024-03-19T16:45:00Z",
            },
          ],
        },
        medium: {
          count: 24,
          details: [
            {
              id: "CVE-2024-3456",
              description: "Information Disclosure in Web Service",
              affectedDevices: 12,
              status: "under_review",
              discoveredAt: "2024-03-18T09:20:00Z",
            },
          ],
        },
      },
      recentThreats: [
        {
          id: "THREAT-2024-001",
          type: "Ransomware Attempt",
          malware: "BlackCat/ALPHV",
          device: "WKSTN-DEV-8X42L",
          user: "carlos.developer",
          timestamp: "2024-03-20T15:45:00Z",
          status: "blocked",
          details: "Tentativa de criptografia bloqueada em /var/data",
          severity: "critical",
          actionTaken: "Processo terminado e arquivo quarentenado",
        },
        {
          id: "THREAT-2024-002",
          type: "Zero-Day Exploit",
          malware: "CVE-2024-1234",
          device: "SRV-PROD-MK932",
          user: "system",
          timestamp: "2024-03-20T14:22:00Z",
          status: "blocked",
          details: "Exploit direcionado ao Apache 2.4.x neutralizado",
          severity: "critical",
          actionTaken: "Conexão bloqueada e patch emergencial aplicado",
        },
        {
          id: "THREAT-2024-003",
          type: "Advanced Persistence",
          malware: "ShadowHammer",
          device: "WKSTN-HR-9H2",
          user: "maria.rh",
          timestamp: "2024-03-20T13:10:00Z",
          status: "investigating",
          details: "Atividade suspeita em processos do sistema",
          severity: "high",
          actionTaken: "Análise forense em andamento",
        },
        {
          id: "THREAT-2024-004",
          type: "Data Exfiltration",
          malware: "Unknown",
          device: "WKSTN-FIN-L245",
          user: "roberto.financeiro",
          timestamp: "2024-03-20T12:55:00Z",
          status: "blocked",
          details: "Tentativa de envio de dados para IP suspeito",
          severity: "high",
          actionTaken: "Conexão bloqueada e workstation isolada",
        },
      ],
      systemHealth: {
        updateStatus: {
          upToDate: 828,
          needingUpdates: 19,
          critical: 3,
        },
        patchingStatus: 97.8,
        lastScan: "2024-03-20T15:30:00Z",
        nextScheduledScan: "2024-03-21T00:00:00Z",
      },
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Erro ao buscar dados do dashboard:', error instanceof Error ? error.message : String(error));
    
    // Retornar dados padrão em caso de erro para evitar quebra da interface
    const defaultData = {
      protectionStatus: {
        protectedDevices: 0,
        totalDevices: 0,
        protectionRate: 0,
        lastUpdate: new Date().toISOString(),
      },
      threatMetrics: {
        totalThreatsBlocked: 0,
        activeThreats: 0,
        criticalAlerts: 0,
        highAlerts: 0,
        mediumAlerts: 0,
        lowAlerts: 0,
      },
      systemHealth: {
        updateStatus: {
          upToDate: 0,
          needingUpdates: 0,
          critical: 0,
        },
        patchingStatus: 0,
        lastScan: new Date().toISOString(),
        nextScheduledScan: new Date().toISOString(),
      },
    };

    return NextResponse.json(defaultData, { status: 200 });
  }
} 