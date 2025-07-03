import { NextRequest, NextResponse } from 'next/server';
import { makeRequest, BitdefenderEndpoint, BITDEFENDER_CONFIG } from '../config';

interface PackageResponse {
  id: string;
  name: string;
  status: string;
}

interface InstallationLinksResponse {
  links: string[];
  expiresAt: string;
}

interface CreateEndpointResponse {
  id: string;
  status: string;
}

export async function GET() {
  try {
    // Fetch endpoints list
    const endpointsResponse = await makeRequest<{
      items: BitdefenderEndpoint[];
      total: number;
    }>('network', 'getNetworkInventoryItems', {});

    const endpoints = endpointsResponse.result.items;

    // Get policies list for features
    const policiesResponse = await makeRequest<{
      policies: Array<{
        id: string;
        name: string;
        type: string;
        settings: any;
      }>;
    }>('policies', 'getPoliciesList', {});

    const policies = policiesResponse.result.policies;

    // Map endpoints to our format
    const mappedEndpoints = endpoints.map(endpoint => ({
      id: endpoint.id,
      name: endpoint.name,
      os: endpoint.operatingSystemVersion,
      status: endpoint.isManaged ? 'managed' : 'unmanaged',
      lastSeen: endpoint.lastSeen,
      version: endpoint.label,
      isIsolated: endpoint.securityStatus === 0,
      protectionStatus: endpoint.securityStatus === 1 ? 'protected' : 'at_risk',
      ipAddress: endpoint.ip?.[0] || 'N/A',
      macAddress: endpoint.mac?.[0] || 'N/A'
    }));

    // Calculate plan limits based on policies
    const planLimits = {
      max: null, // Bitdefender doesn't have a hard limit
      current: endpoints.length,
      canAddMore: true,
      features: {
        antivirus: (policies ?? []).some(p => p.type === 'antimalware'),
        firewall: (policies ?? []).some(p => p.type === 'firewall'),
        isolation: (policies ?? []).some(p => p.type === 'endpoint_control'),
        networkProtection: (policies ?? []).some(p => p.type === 'network_protection')
      }
    };

    return NextResponse.json({
      endpoints: mappedEndpoints,
      limits: planLimits
    });
  } catch (error) {
    console.error('Error fetching Bitdefender endpoints:', error);
    return NextResponse.json(
      { error: 'Failed to fetch endpoints data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, os } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    // Create installation package
    const packageResponse = await makeRequest<PackageResponse>('packages', 'createPackage', {
      name: `Package for ${name}`,
      operatingSystem: os.toUpperCase(),
      modules: ['antimalware', 'firewall', 'content_control', 'power_user'],
      customization: {
        rebootTimeoutInterval: 60,
        enableFirewall: true,
        enableAntimalware: true
      }
    });

    // Get installation links
    const linksResponse = await makeRequest<InstallationLinksResponse>('packages', 'getInstallationLinks', {
      packageId: packageResponse.result.id
    });

    // Create endpoint in Bitdefender
    const endpointResponse = await makeRequest<CreateEndpointResponse>('network', 'createEndpoint', {
      label: name,
      packageId: packageResponse.result.id,
      installationLinks: linksResponse.result.links
    });

    return NextResponse.json({
      success: true,
      endpoint: {
        id: endpointResponse.result.id,
        name: name,
        os: os,
        installationLink: linksResponse.result.links[0]
      }
    });
  } catch (error) {
    console.error('Error creating Bitdefender endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to create endpoint' },
      { status: 500 }
    );
  }
} 