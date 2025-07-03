import { Buffer } from 'buffer';

if (!process.env.BITDEFENDER_API_KEY) {
  throw new Error('BITDEFENDER_API_KEY environment variable is not set');
}

if (!process.env.BITDEFENDER_COMPANY_ID) {
  throw new Error('BITDEFENDER_COMPANY_ID environment variable is not set');
}

export const BITDEFENDER_CONFIG = {
  BASE_URL: process.env.BITDEFENDER_API_URL || 'https://cloud.gravityzone.bitdefender.com',
  API_KEY: process.env.BITDEFENDER_API_KEY,
  COMPANY_ID: process.env.BITDEFENDER_COMPANY_ID,
  getAuthHeader: () => {
    return `Basic ${Buffer.from(`${BITDEFENDER_CONFIG.API_KEY}:`).toString('base64')}`;
  }
};

// Service endpoints mapping
const SERVICE_ENDPOINTS = {
  network: '/api/v1.0/jsonrpc/network',
  policies: '/api/v1.0/jsonrpc/policies',
  incidents: '/api/v1.0/jsonrpc/incidents',
  packages: '/api/v1.0/jsonrpc/packages'
} as const;

type ServiceType = keyof typeof SERVICE_ENDPOINTS;

// Methods that operate at the partner level and don't need companyId
const PARTNER_LEVEL_METHODS = [
  'getAccountsList',
  'getNetworkInventoryItems',
  'getPoliciesList'
];

export interface BitdefenderResponse<T = any> {
  id: string;
  jsonrpc: string;
  result: T;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

export interface BitdefenderEndpoint {
  id: string;
  name: string;
  type: number;
  parentId: string;
  companyId: string;
  operatingSystemVersion: string;
  isManaged: boolean;
  lastSeen: string;
  label: string;
  securityStatus: number;
  ip?: string[];
  mac?: string[];
}

export interface BitdefenderIncident {
  id: string;
  name: string;
  description: string;
  severity: number;
  status: string;
  type: string;
  detectionTime: string;
  endpointId: string;
  endpointName: string;
}

export interface BitdefenderStats {
  totalEndpoints: number;
  managedEndpoints: number;
  protectedEndpoints: number;
  riskEndpoints: number;
  criticalEndpoints: number;
  blockedThreats: number;
  lastScanTime: string;
}

export const makeRequest = async <T>(
  service: ServiceType,
  method: string,
  params: any = {}
): Promise<BitdefenderResponse<T>> => {
  // Validar configuração necessária
  if (!BITDEFENDER_CONFIG.API_KEY) {
    throw new Error('BITDEFENDER_API_KEY não está configurado');
  }

  if (!BITDEFENDER_CONFIG.COMPANY_ID) {
    throw new Error('BITDEFENDER_COMPANY_ID não está configurado');
  }

  const requestId = crypto.randomUUID();
  const endpoint = SERVICE_ENDPOINTS[service];
  if (!endpoint) {
    throw new Error(`Invalid service: ${service}`);
  }

  // Build the final params object
  const finalParams: any = {
    page: params.page || 1,
    perPage: params.perPage || 30,
    ...params // Spread original params
  };

  // Only add companyId for methods that need it
  if (!PARTNER_LEVEL_METHODS.includes(method)) {
    finalParams.companyId = params.companyId || BITDEFENDER_CONFIG.COMPANY_ID;
  } else {
    // Remove companyId if it was passed in the original params
    delete finalParams.companyId;
  }
  
  console.log(`Making Bitdefender request to ${service}/${method} with params:`, JSON.stringify(finalParams, null, 2));
  
  try {
    const response = await fetch(`${BITDEFENDER_CONFIG.BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': BITDEFENDER_CONFIG.getAuthHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: requestId,
        jsonrpc: '2.0',
        method: method,
        params: finalParams,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    console.log(`Bitdefender response:`, JSON.stringify(data, null, 2));

    if (data.error) {
      console.error('Bitdefender API error:', data.error);
      throw new Error(`Bitdefender API error: ${data.error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Bitdefender API error:', error);
    throw error;
  }
};
