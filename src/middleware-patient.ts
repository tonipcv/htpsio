import { NextRequest, NextResponse } from 'next/server'
import { verify } from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { randomUUID } from 'crypto';

// Regex para detectar URLs no formato /{userSlug}/{referralSlug}
const REFERRAL_REGEX = /^\/([^\/]+)\/([^\/]+)$/;

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'your-jwt-secret';

// Rotas públicas do paciente
const PATIENT_PUBLIC_ROUTES = [
  '/patient/login',
  '/patient/register',
  '/patient/access',
  '/patient/reset-password',
  '/patient/validate',
  '/api/patient/magic-link',
  '/api/patient/verify'
];

// Verificar se o paciente está autenticado
async function isPatientAuthenticated(req: NextRequest): Promise<{ isAuthenticated: boolean; patientId?: string }> {
  const cookie = req.cookies.get('patient_token');
  if (!cookie?.value) return { isAuthenticated: false };

  try {
    const token = cookie.value;
    const decoded = verify(token, process.env.JWT_SECRET || 'fallback-secret-for-development') as any;
    
    if (!decoded || decoded.type !== 'patient') {
      return { isAuthenticated: false };
    }

    // Retornar o ID do paciente do token JWT
    return { 
      isAuthenticated: true,
      patientId: decoded.id
    };
  } catch (error) {
    console.error('Erro ao verificar token do paciente:', error);
    return { isAuthenticated: false };
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = new URL(req.url);
  console.log('\n=== VERIFICAÇÃO DE ROTA DO PACIENTE ===');
  console.log('URL:', req.url);
  console.log('Pathname:', pathname);

  // Verificar se é uma rota pública do paciente
  if (PATIENT_PUBLIC_ROUTES.some(route => pathname.startsWith(route)) || 
      pathname.startsWith('/patient/reset-password/')) {
    console.log('✅ Rota pública do paciente, permitindo acesso');
    return NextResponse.next();
  }

  // Verificar token do paciente
  const patientSession = req.cookies.get('patient_session');
  console.log('Token encontrado?', !!patientSession?.value);

  if (!patientSession?.value) {
    console.log('❌ Sem token de paciente, redirecionando para login');
    return NextResponse.redirect(new URL('/patient/login', req.url));
  }

  try {
    // Verificar e decodificar o token
    const decoded = verify(patientSession.value, JWT_SECRET) as {
      patientId: string;
      type: string;
    };

    console.log('Dados do token:', {
      patientId: decoded.patientId,
      type: decoded.type
    });

    if (decoded.type !== 'session') {
      throw new Error('Tipo de token inválido');
    }

    console.log('✅ Token válido, permitindo acesso');
    return NextResponse.next();
  } catch (error) {
    console.error('❌ Erro na verificação do token:', error);
    // Limpar cookie inválido
    const response = NextResponse.redirect(new URL('/patient/login', req.url));
    response.cookies.delete('patient_session');
    return response;
  }
}

// Configurar quais caminhos o middleware deve processar
export const config = {
  matcher: [
    // Rotas do paciente
    '/patient/:path*',
    '/api/patient/:path*',
    // Qualquer rota para capturar padrões de referência
    '/:userSlug/:referral',
  ],
}; 