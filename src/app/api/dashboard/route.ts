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

    // Buscar contagem de leads com verificação defensiva
    const totalLeads = await prisma.leads.count({
      where: { 
        user_id: userId,
        status: {
          not: 'Removido'
        }
      }
    }) || 0;

    // Buscar contagem de indicações com verificação defensiva
    const totalIndications = await prisma.indication.count({
      where: { userId }
    }) || 0;

    // Buscar contagem de cliques com verificação defensiva
    const totalClicks = await prisma.event.count({
      where: { 
        userId,
        type: 'click' 
      }
    }) || 0;

    // Calcular taxa de conversão (leads / cliques)
    const conversionRate = totalClicks > 0 
      ? Math.min(Math.round((totalLeads / totalClicks) * 100), 100) 
      : 0;

    // Buscar leads recentes (últimos 5) com verificação defensiva
    const recentLeads = await prisma.leads.findMany({
      where: { user_id: userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        indication: {
          select: {
            name: true,
            slug: true
          }
        }
      }
    }).catch(() => []) || [];

    // Buscar top indicadores (indicações com mais leads) com verificação defensiva
    const topIndications = await prisma.indication.findMany({
      where: { userId },
      include: {
        _count: {
          select: {
            leads: true,
            events: true
          }
        }
      },
      orderBy: [
        {
          leads: {
            _count: 'desc'
          }
        }
      ],
      take: 5
    }).catch(() => []) || [];

    // Buscar as origens de tráfego mais comuns com verificação defensiva
    const topSourcesRaw = await prisma.$queryRaw`
      SELECT "utmSource" as "source", COUNT(*) as "count"
      FROM "public"."leads"
      WHERE "user_id" = ${userId} AND "utmSource" IS NOT NULL
      GROUP BY "utmSource"
      ORDER BY "count" DESC
      LIMIT 5
    `.catch(() => []) || [];

    // Calcular faturamento total (soma do potentialValue dos leads fechados) com verificação defensiva
    const closedLeadsData = await prisma.leads.aggregate({
      where: { 
        user_id: userId,
        status: 'Fechado',
        potentialValue: { not: null }
      },
      _sum: {
        potentialValue: true
      }
    }).catch(() => ({ _sum: { potentialValue: null } }));
    
    // Calcular potencial em aberto (soma do potentialValue dos leads não fechados) com verificação defensiva
    const openLeadsData = await prisma.leads.aggregate({
      where: { 
        user_id: userId,
        NOT: { status: 'Fechado' },
        potentialValue: { not: null }
      },
      _sum: {
        potentialValue: true
      }
    }).catch(() => ({ _sum: { potentialValue: null } }));

    // Buscar contagem de pacientes com verificação defensiva
    const totalPatients = await prisma.patient.count({ 
      where: { userId } 
    }).catch(() => 0) || 0;

    // Extrair os valores e garantir que eles não sejam nulos
    const totalRevenue = closedLeadsData?._sum?.potentialValue || 0;
    const potentialRevenue = openLeadsData?._sum?.potentialValue || 0;

    // Converter todos os dados que podem conter BigInt
    const responseData = {
      totalLeads: Number(totalLeads),
      totalIndications: Number(totalIndications),
      totalClicks: Number(totalClicks),
      conversionRate,
      recentLeads: convertBigIntToNumber(recentLeads),
      topIndications: convertBigIntToNumber(topIndications),
      topSources: convertBigIntToNumber(topSourcesRaw),
      totalRevenue: Number(totalRevenue),
      potentialRevenue: Number(potentialRevenue),
      revenue: Number(totalRevenue),
      totalPatients: Number(totalPatients),
      clickToLeadRate: totalLeads > 0 ? Math.min(Math.round((totalClicks / totalLeads)), 100) : 0
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Erro ao buscar dados do dashboard:', error instanceof Error ? error.message : String(error));
    
    // Retornar dados padrão em caso de erro para evitar quebra da interface
    const defaultData = {
      totalLeads: 0,
      totalIndications: 0,
      totalClicks: 0,
      conversionRate: 0,
      recentLeads: [],
      topIndications: [],
      topSources: [],
      totalRevenue: 0,
      potentialRevenue: 0,
      revenue: 0,
      totalPatients: 0,
      clickToLeadRate: 0
    };

    return NextResponse.json(defaultData, { status: 200 });
  }
} 