import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { isFreePlan } from '@/lib/stripe';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Buscar usuário e sua assinatura
    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
      include: {
        subscription: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Verificar se o usuário está no plano gratuito
    if (await isFreePlan(user.id)) {
      return NextResponse.json(
        { 
          error: 'Upgrade required',
          requiresUpgrade: true 
        },
        { status: 403 }
      );
    }

    // Usuário tem acesso
    return NextResponse.json(
      { 
        success: true,
        message: 'Access granted' 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error checking dashboard access:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
