import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { verify } from 'jsonwebtoken';

// Configurações
const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'your-jwt-secret';

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
  '/settings'
];

// Rotas que requerem plano premium
const PREMIUM_ROUTES = [
  '/reports',
  '/analytics',
  '/dashboard/analytics',
  '/advanced-settings'
];

// Lista de e-mails com acesso premium
const PREMIUM_EMAILS = [
  'xppsalvador@gmail.com',
  'tonitypebot@gmail.com'
];

// Verificar plano do usuário
async function getUserPlan(token: any): Promise<string> {
  try {
    console.log('\n=== DETALHES DA VERIFICAÇÃO DE PLANO ===');
    const email = token?.email;
    
    console.log('Email do usuário:', email);
    console.log('Token completo:', JSON.stringify(token, null, 2));
    
    if (!email) {
      console.error('❌ Token não contém email');
      return 'free';
    }
    
    // Verificar primeiro se o email está na lista de premium
    if (PREMIUM_EMAILS.includes(email)) {
      console.log('✅ Email encontrado na lista de premium');
      return 'premium';
    }
    
    // Depois verificar os campos do token
    const isPremiumUser = token?.isPremium === true || token?.plan === 'premium';
    console.log('Verificação de status premium:', {
      isPremium: token?.isPremium,
      plan: token?.plan,
      resultado: isPremiumUser
    });
    
    if (isPremiumUser) {
      console.log('✅ Usuário é premium (isPremium ou plan premium)');
      return 'premium';
    }
    
    console.log('❌ Usuário não é premium');
    return 'free';
  } catch (error) {
    console.error('❌ Erro ao verificar plano do usuário:', error);
    return 'free';
  }
}

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
    console.log('Dados do token:', {
      id: token?.id,
      email: token?.email,
      isPremium: token?.isPremium,
      plan: token?.plan
    });
    
    if (!token) {
      console.log('❌ Redirecionando para login - sem token');
      const url = new URL('/auth/signin', req.url);
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }

    // 4. Verificar acesso premium
    const isPremiumRoute = PREMIUM_ROUTES.some(route => {
      const isMatch = cleanPath.startsWith(route);
      console.log(`Verificando rota premium ${route}:`, isMatch);
      return isMatch;
    });

    if (isPremiumRoute) {
      console.log('\n=== VERIFICAÇÃO DE PLANO ===');
      const userPlan = await getUserPlan(token);
      console.log('Resultado da verificação:', {
        plano: userPlan,
        isPremium: token.isPremium,
        plan: token.plan
      });
      
      if (userPlan !== 'premium') {
        console.log('❌ Redirecionando para bloqueado - não é premium');
        return NextResponse.redirect(new URL('/bloqueado', req.url));
      }
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
    '/(authenticated)/:path*'
  ]
}; 