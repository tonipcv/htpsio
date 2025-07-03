import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { BITDEFENDER_CONFIG } from '../config';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Verificar configurações
    const config = {
      hasApiKey: !!BITDEFENDER_CONFIG.API_KEY,
      hasCompanyId: !!BITDEFENDER_CONFIG.COMPANY_ID,
      hasBaseUrl: !!BITDEFENDER_CONFIG.BASE_URL,
      baseUrl: BITDEFENDER_CONFIG.BASE_URL,
      apiKeyLength: BITDEFENDER_CONFIG.API_KEY ? BITDEFENDER_CONFIG.API_KEY.length : 0,
      companyIdLength: BITDEFENDER_CONFIG.COMPANY_ID ? BITDEFENDER_CONFIG.COMPANY_ID.length : 0
    };

    const isConfigured = config.hasApiKey && config.hasCompanyId && config.hasBaseUrl;

    return NextResponse.json({
      isConfigured,
      config,
      issues: [
        !config.hasApiKey ? 'BITDEFENDER_API_KEY não está configurado' : null,
        !config.hasCompanyId ? 'BITDEFENDER_COMPANY_ID não está configurado' : null,
        !config.hasBaseUrl ? 'BITDEFENDER_API_URL não está configurado' : null
      ].filter(Boolean)
    });
  } catch (error) {
    console.error('Erro ao verificar configuração:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 