import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { makeRequest, BitdefenderEndpoint, BitdefenderIncident, BitdefenderStats, BITDEFENDER_CONFIG } from '../config';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Verificar se a configuração do Bitdefender está presente
    if (!BITDEFENDER_CONFIG.COMPANY_ID || !BITDEFENDER_CONFIG.API_KEY) {
      return NextResponse.json({ 
        error: "Configuração do Bitdefender não encontrada" 
      }, { status: 500 });
    }

    // Fetch endpoints statistics com companyId
    const endpointsResponse = await makeRequest<{
      items: BitdefenderEndpoint[];
      total: number;
      page: number;
      perPage: number;
      pagesCount: number;
    }>('network', 'getNetworkInventoryItems', {
      companyId: BITDEFENDER_CONFIG.COMPANY_ID
    });

    // Verificação defensiva para endpoints
    const endpoints = endpointsResponse?.result?.items || [];
    const totalEndpoints = endpointsResponse?.result?.total || 0;

    // Fetch incidents com companyId e parentId (usando o id do primeiro item do inventory)
    let incidents: BitdefenderIncident[] = [];
    
    if (endpoints.length > 0) {
      // Usar o id do primeiro item como parentId
      const parentId = endpoints[0].id;
      
      try {
        const incidentsResponse = await makeRequest<{
          items: BitdefenderIncident[];
          total: number;
          page: number;
          perPage: number;
          pagesCount: number;
        }>('incidents', 'getIncidentsList', {
          companyId: BITDEFENDER_CONFIG.COMPANY_ID,
          parentId: parentId,
          perPage: 500  // Set minimum allowed value for this endpoint
        });

        // Verificação defensiva para incidents
        incidents = incidentsResponse?.result?.items || [];
      } catch (error) {
        console.error('Erro ao buscar incidents, continuando sem eles:', error);
        // Continuar sem incidents em caso de erro
      }
    }

    // Calculate statistics com verificações defensivas
    const stats: BitdefenderStats = {
      totalEndpoints,
      managedEndpoints: endpoints.length, // All inventory items are managed
      protectedEndpoints: endpoints.filter(e => e.securityStatus === 1).length, // More accurate count
      riskEndpoints: endpoints.filter(e => e.securityStatus !== 1).length, // More accurate count
      criticalEndpoints: endpoints.filter(e => e.securityStatus === 0).length, // More accurate count
      blockedThreats: incidents.length,
      lastScanTime: new Date().toISOString() // We don't have scan time in the current API response
    };

    // Map incidents to our format with verificações defensivas
    const recentIncidents = incidents.map(incident => ({
      id: incident.id || '',
      type: incident.type ? incident.type.toLowerCase() : 'unknown',
      severity: incident.severity === 3 ? 'high' : incident.severity === 2 ? 'medium' : 'low',
      device: incident.endpointName || 'Unknown Device',
      timestamp: incident.detectionTime || new Date().toISOString(),
      status: incident.status === 'new' ? 'active' : 'contained',
      description: incident.description || 'No description available'
    }));

    return NextResponse.json({
      stats,
      recentIncidents
    });
  } catch (error) {
    console.error("Error fetching Bitdefender stats:", error);
    
    // Retornar dados padrão em caso de erro para evitar quebra da interface
    const defaultStats: BitdefenderStats = {
      totalEndpoints: 0,
      managedEndpoints: 0,
      protectedEndpoints: 0,
      riskEndpoints: 0,
      criticalEndpoints: 0,
      blockedThreats: 0,
      lastScanTime: new Date().toISOString()
    };

    return NextResponse.json({
      stats: defaultStats,
      recentIncidents: []
    });
  }
} 