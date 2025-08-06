import Stripe from 'stripe';
import { prisma } from './prisma';

// Chave de teste para desenvolvimento
const DUMMY_STRIPE_KEY = 'sk_test_51OvRvQKVgkyQsLBPZxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';

// Inicializa o Stripe com uma chave válida para evitar erros
let stripeInstance: Stripe | null = null;

try {
  // Tenta usar a chave do ambiente ou a chave de teste para desenvolvimento
  const apiKey = process.env.STRIPE_SECRET_KEY || 
    (process.env.NODE_ENV === 'development' ? DUMMY_STRIPE_KEY : '');
    
  if (!apiKey) {
    console.warn('STRIPE_SECRET_KEY não está definido. Algumas funcionalidades podem não funcionar.');
  }
  
  stripeInstance = new Stripe(apiKey, {
    apiVersion: '2025-07-30.basil',
  });
} catch (error) {
  console.error('Erro ao inicializar o Stripe:', error);
}

// Exporta o Stripe com tratamento de erro
export const stripe = stripeInstance || new Stripe(DUMMY_STRIPE_KEY, { apiVersion: '2025-07-30.basil' });

// Define subscription plans
export const SUBSCRIPTION_PLANS = {
  BASIC: {
    name: 'Basic',
    id: 'basic',
    maxClients: 100,
    price: 20,
    priceId: process.env.STRIPE_BASIC_PRICE_ID,
    features: ['Up to 100 clients', 'Document sharing', 'Basic analytics']
  },
  PRO: {
    name: 'Pro',
    id: 'pro',
    maxClients: 1000,
    price: 87,
    priceId: process.env.STRIPE_PRO_PRICE_ID,
    features: ['Up to 1,000 clients', 'Advanced document sharing', 'Detailed analytics']
  },
  ENTERPRISE: {
    name: 'Enterprise',
    id: 'enterprise',
    maxClients: 10000,
    price: 197,
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID,
    features: ['Up to 10,000 clients', 'Premium document sharing', 'Advanced analytics', 'Priority support']
  }
};

// Helper function to get plan details by ID
export function getPlanById(planId: string) {
  return Object.values(SUBSCRIPTION_PLANS).find(plan => plan.id === planId);
}

// Helper function to check if a user has an active subscription
export async function hasActiveSubscription(userId: string): Promise<boolean> {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });
  
  return subscription?.status === 'active';
}

// Helper function to check if a user is on the free plan
export async function isFreePlan(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { subscription: true },
  });
  
  // Usuário está no plano gratuito se não tiver assinatura, se o plano for 'free' ou se a assinatura não estiver ativa
  return !user?.subscription || user.subscription.plan === 'free' || user.subscription.status !== 'active';
}

// Helper function to check if a user is within their client limit
export async function isWithinClientLimit(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      subscription: true,
      clients: true,
    },
  });
  
  if (!user || !user.subscription || user.subscription.status !== 'active') {
    return false;
  }
  
  const plan = getPlanById(user.subscription.plan);
  if (!plan) return false;
  
  return user.clients.length <= plan.maxClients;
}

// Helper function to create a checkout session
export async function createCheckoutSession(userId: string, planId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  
  if (!user) {
    throw new Error('User not found');
  }
  
  const plan = getPlanById(planId);
  if (!plan || !plan.priceId) {
    throw new Error('Invalid plan or price ID not configured');
  }
  
  return stripe.checkout.sessions.create({
    customer_email: user.email,
    line_items: [
      {
        price: plan.priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
    metadata: {
      userId,
      planId,
    },
  });
}

// Helper function to update a user's subscription in the database
export async function updateUserSubscription(
  userId: string, 
  planId: string, 
  status: string,
  stripeSubscriptionId?: string
) {
  return prisma.subscription.upsert({
    where: { userId },
    update: {
      plan: planId,
      status,
      updatedAt: new Date(),
    },
    create: {
      userId,
      plan: planId,
      status,
      stripeSubscriptionId,
    },
  });
}
