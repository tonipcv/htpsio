import { verify } from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const REFERRAL_REGEX = /^\/([^\/]+)\/([^\/]+)$/;

interface PatientJwtPayload {
  patientId: string;
  type: string;
}

if (!process.env.NEXTAUTH_SECRET) {
  throw new Error('NEXTAUTH_SECRET environment variable is not set');
}

const JWT_SECRET = process.env.NEXTAUTH_SECRET;

// Rotas públicas do paciente
const PUBLIC_ROUTES = [
  '/patient/login',
  '/patient/reset-password',
  '/patient/signup'
];

export async function getPatientIdFromToken(req: NextRequest): Promise<string | null> {
  try {
    const cookie = req.cookies.get('patient_token');
    if (!cookie) return null;

    const token = cookie.value;
    const decoded = verify(token, JWT_SECRET) as PatientJwtPayload;
    
    if (!decoded || decoded.type !== 'patient') {
      return null;
    }

    return decoded.patientId;
  } catch (error) {
    console.error('Erro ao verificar token do paciente:', error);
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Permitir acesso a rotas públicas
  if (PUBLIC_ROUTES.some(route => 
    pathname === route || 
    pathname.startsWith('/patient/reset-password/')) ||
    pathname.startsWith('/_next') || 
    pathname.startsWith('/api/patient/public')
  ) {
    return NextResponse.next();
  }

  // Verificar token do paciente
  const patientSession = req.cookies.get('patient_token');
  console.log('Token encontrado?', !!patientSession?.value);

  if (!patientSession?.value) {
    console.log('❌ Sem token de paciente, redirecionando para login');
    return NextResponse.redirect(new URL('/patient/login', req.url));
  }

  try {
    // Verificar e decodificar o token
    const decoded = verify(patientSession.value, JWT_SECRET) as PatientJwtPayload;

    if (!decoded || !decoded.patientId || decoded.type !== 'patient') {
      throw new Error('Token inválido');
    }

    console.log('Dados do token:', {
      patientId: decoded.patientId,
      type: decoded.type
    });

    if (decoded.type !== 'patient') {
      throw new Error('Tipo de token inválido');
    }

    console.log('✅ Token válido, permitindo acesso');
    return NextResponse.next();
  } catch (error) {
    console.error('❌ Erro na verificação do token:', error);
    return NextResponse.redirect(new URL('/patient/login', req.url));
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