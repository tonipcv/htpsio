import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Rotas públicas que não precisam de autenticação
const PUBLIC_ROUTES = [
  '/auth/signin',
  '/auth/register',
  '/auth/forgot-password',
  '/api/auth',
  '/api/track'
];

// Rotas que requerem autenticação normal
const AUTH_ROUTES = [
  '/dashboard',
  '/profile',
  '/agenda',
  '/settings',
  '/reports',
  '/analytics',
  '/dashboard/analytics',
  '/advanced-settings',
  '/documents'
];

export async function middleware(req: NextRequest) {
  const { pathname } = new URL(req.url);
  console.log('\n=== INÍCIO DA VERIFICAÇÃO DE ROTA ===');
  console.log('URL completa:', req.url);
  console.log('Pathname:', pathname);

  // 1. Ignorar rotas de sistema e assets
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname === '/favicon.ico' ||
    pathname.startsWith('/public')
  ) {
    return NextResponse.next();
  }

  // 2. Permitir rotas públicas
  if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // 3. Verificar autenticação para rotas protegidas
  const cleanPath = pathname.replace(/^\/(authenticated)/, '');
  const isAuthRoute = AUTH_ROUTES.some(route => cleanPath.startsWith(route));
  
  if (isAuthRoute) {
    console.log('\n=== VERIFICAÇÃO DE AUTENTICAÇÃO ===');
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    console.log('Token encontrado?', !!token);
    
    if (!token) {
      console.log('❌ Redirecionando para login - sem token');
      const url = new URL('/auth/signin', req.url);
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }
  }

  console.log('\n✅ Acesso permitido\n');
  return NextResponse.next();
}

// Configurar quais caminhos o middleware deve processar
export const config = {
  matcher: [
    // Capturar rotas autenticadas e protegidas
    '/dashboard/:path*',
    '/profile/:path*',
    '/settings/:path*',
    '/reports/:path*',
    '/analytics/:path*',
    '/advanced-settings/:path*',
    '/documents/:path*',
    '/(authenticated)/:path*'
  ]
}; 