import { ACRONIS_API_CONFIG } from './config';

interface AcronisToken {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  issued_at: number;
}

let currentToken: AcronisToken | null = null;

export async function getAcronisToken(): Promise<string> {
  // Check if we have a valid token
  const now = Date.now();
  if (currentToken?.access_token && 
      currentToken?.expires_in && 
      (now - currentToken.issued_at) / 1000 < currentToken.expires_in - 300) {
    return currentToken.access_token;
  }

  // Get new token
  try {
    const response = await fetch(`${ACRONIS_API_CONFIG.BASE_URL}${ACRONIS_API_CONFIG.ENDPOINTS.AUTH}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: ACRONIS_API_CONFIG.CLIENT_ID!,
        client_secret: ACRONIS_API_CONFIG.CLIENT_SECRET!,
      }).toString(),
    });

    if (!response.ok) {
      throw new Error(`Failed to get Acronis token: ${response.statusText}`);
    }

    const data = await response.json();
    currentToken = {
      ...data,
      issued_at: Date.now(),
    };

    return currentToken.access_token;
  } catch (error) {
    console.error('Error getting Acronis token:', error);
    throw error;
  }
}

export async function makeAcronisRequest(
  endpoint: string,
  method: string = 'GET',
  body?: any
): Promise<any> {
  try {
    const token = await getAcronisToken();
    const response = await fetch(`${ACRONIS_API_CONFIG.BASE_URL}${endpoint}`, {
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      ...(body && { body: JSON.stringify(body) }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Acronis API error response:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      throw new Error(`Acronis API request failed: ${response.status} - ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error making Acronis request:', error);
    throw error;
  }
} 