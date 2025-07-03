import { makeAcronisRequest } from './auth';
import { ACRONIS_API_CONFIG } from './config';

interface AcronisTenant {
  id: string;
  name: string;
  parent_id: string;
  version: number;
  enabled: boolean;
  kind: string;
  customer_type: string;
  language: string;
  contact?: {
    firstname: string;
    lastname: string;
    email: string;
    phone: string;
    country: string;
  };
}

// Adiciona os endpoints necessários para gerenciamento de tenants
const TENANT_ENDPOINTS = {
  ...ACRONIS_API_CONFIG.ENDPOINTS,
  TENANTS: '/api/2/tenants',
  TENANT_CHILDREN: '/api/2/tenants/{tenant_id}/children',
  TENANT_ACTIVATE: '/api/2/tenants/{tenant_id}/activate',
  TENANT_STATUS: '/api/2/tenants/{tenant_id}/status',
};

/**
 * Verifica se já existe um tenant com o mesmo nome
 */
async function checkTenantExists(name: string): Promise<AcronisTenant | null> {
  try {
    console.log('Checking if tenant exists:', name);
    const parentId = process.env.ACRONIS_PARENT_TENANT_ID;
    
    // Lista todos os tenants filhos do tenant pai
    const response = await makeAcronisRequest(
      TENANT_ENDPOINTS.TENANT_CHILDREN.replace('{tenant_id}', parentId!),
      'GET'
    );

    console.log('Child tenants response:', response);

    // Procura por um tenant com o mesmo nome
    const existingTenant = response.items?.find(
      (tenant: AcronisTenant) => {
        // Verifica se o tenant e o nome existem antes de comparar
        return tenant && tenant.name && tenant.name.toLowerCase() === name.toLowerCase();
      }
    );

    return existingTenant || null;
  } catch (error) {
    console.error('Error checking tenant existence:', error);
    return null;
  }
}

/**
 * Gera um nome único para o tenant
 */
function generateUniqueTenantName(baseName: string, attempt: number = 0): string {
  if (attempt === 0) return baseName;
  return `${baseName}-${attempt}`;
}

/**
 * Cria um novo tenant na Acronis
 */
export async function createTenant(
  name: string,
  email: string,
  phone: string = ''
): Promise<AcronisTenant> {
  try {
    console.log('Attempting to create Acronis tenant:', {
      name,
      email,
      parentId: process.env.ACRONIS_PARENT_TENANT_ID
    });

    // Verifica se já existe um tenant com este nome
    let finalName = name;
    let attempt = 0;
    let existingTenant = await checkTenantExists(finalName);

    // Se existir, tenta com um sufixo numérico até encontrar um nome disponível
    while (existingTenant && attempt < 10) {
      attempt++;
      finalName = generateUniqueTenantName(name, attempt);
      existingTenant = await checkTenantExists(finalName);
    }

    if (attempt >= 10) {
      throw new Error('Não foi possível criar um tenant com um nome único após várias tentativas');
    }

    // Split email into first and last name
    const [firstName = '', lastName = ''] = email.split('@')[0].split('.');

    const tenantData = {
      name: finalName,
      parent_id: process.env.ACRONIS_PARENT_TENANT_ID,
      kind: 'customer',
      customer_type: 'default',
      language: 'pt-BR',
      enabled: true,
      contact: {
        firstname: firstName,
        lastname: lastName,
        email: email,
        phone: phone,
        country: 'BR'
      }
    };

    console.log('Creating tenant with data:', tenantData);

    const response = await makeAcronisRequest(
      ACRONIS_API_CONFIG.ENDPOINTS.TENANTS,
      'POST',
      tenantData
    );

    console.log('Tenant created successfully:', response);
    return response;
  } catch (error) {
    console.error('Error creating tenant:', error);
    throw error;
  }
}

/**
 * Ativa um tenant existente
 * Nota: Muitos tenants já são criados ativados por padrão
 */
export async function activateTenant(tenantId: string): Promise<void> {
  try {
    console.log('Checking if tenant needs activation:', tenantId);
    
    // Primeiro verifica se o tenant já está ativo
    const tenant = await getTenant(tenantId);
    if (tenant?.enabled) {
      console.log('Tenant is already enabled, skipping activation');
      return;
    }

    // Tenta ativar o tenant usando diferentes endpoints possíveis
    const activationEndpoints = [
      `/api/2/tenants/${tenantId}/activate`,
      `/api/2/tenants/${tenantId}/enable`,
      `/api/2/tenants/${tenantId}`
    ];

    for (const endpoint of activationEndpoints) {
      try {
        console.log('Trying activation endpoint:', endpoint);
        
        if (endpoint.endsWith('/activate') || endpoint.endsWith('/enable')) {
          await makeAcronisRequest(endpoint, 'POST');
        } else {
          // Para o endpoint principal, faz um PATCH para habilitar
          await makeAcronisRequest(endpoint, 'PATCH', { enabled: true });
        }
        
        console.log('Tenant activated successfully with endpoint:', endpoint);
        return;
      } catch (error) {
        console.log('Failed with endpoint:', endpoint, error);
        continue;
      }
    }

    // Se chegou aqui, nenhum endpoint funcionou
    console.warn('Could not activate tenant through any endpoint, but tenant was created');
    
  } catch (error) {
    console.error('Error activating tenant:', error);
    // Não falha a operação se a ativação falhar, pois o tenant foi criado
    console.warn('Tenant activation failed, but tenant was created successfully');
  }
}

/**
 * Verifica o status de um tenant
 */
export async function checkTenantStatus(tenantId: string): Promise<{
  enabled: boolean;
  status: string;
}> {
  try {
    console.log('Checking tenant status:', tenantId);
    const tenant = await getTenant(tenantId);

    if (!tenant) {
      throw new Error('Tenant not found');
    }

    return {
      enabled: tenant.enabled,
      status: tenant.enabled ? 'active' : 'inactive'
    };
  } catch (error) {
    console.error('Error checking tenant status:', error);
    throw error;
  }
}

/**
 * Busca um tenant pelo ID
 */
export async function getTenant(tenantId: string): Promise<AcronisTenant | null> {
  try {
    const response = await makeAcronisRequest(
      `${TENANT_ENDPOINTS.TENANTS}/${tenantId}`,
      'GET'
    );

    return response;
  } catch (error) {
    if ((error as Error).message.includes('404')) {
      return null;
    }
    console.error('Error fetching tenant:', error);
    throw error;
  }
}

/**
 * Lista todos os tenants filhos de um tenant pai
 */
export async function listChildTenants(parentTenantId: string): Promise<AcronisTenant[]> {
  try {
    const response = await makeAcronisRequest(
      TENANT_ENDPOINTS.TENANT_CHILDREN.replace('{tenant_id}', parentTenantId),
      'GET'
    );

    return response.items || [];
  } catch (error) {
    console.error('Error listing child tenants:', error);
    throw error;
  }
} 