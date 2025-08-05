import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { prisma } from "./prisma";
import { SUBSCRIPTION_PLANS } from "./stripe";

/**
 * Middleware to check if a user has an active subscription
 */
export async function requireActiveSubscription(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { subscription: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Check if user has an active subscription
  if (!user.subscription || user.subscription.status !== 'active') {
    return NextResponse.json(
      { error: "Active subscription required" },
      { status: 403 }
    );
  }

  return null; // No error, continue with the request
}

/**
 * Middleware to check if a user is within their client limit
 */
export async function requireClientLimit(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { 
      subscription: true,
      clients: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Check if user has an active subscription
  if (!user.subscription || user.subscription.status !== 'active') {
    return NextResponse.json(
      { error: "Active subscription required" },
      { status: 403 }
    );
  }

  // Get plan details
  const planId = user.subscription.plan;
  const plan = Object.values(SUBSCRIPTION_PLANS).find(p => p.id === planId);
  
  if (!plan) {
    return NextResponse.json(
      { error: "Invalid subscription plan" },
      { status: 403 }
    );
  }

  // Check if user is within their client limit
  if (user.clients.length >= plan.maxClients) {
    return NextResponse.json(
      { 
        error: "Client limit reached", 
        limit: plan.maxClients,
        current: user.clients.length,
        upgrade: true
      },
      { status: 403 }
    );
  }

  return null; // No error, continue with the request
}

/**
 * Helper function to apply subscription middleware to an API route
 */
export async function withSubscription(
  req: NextRequest,
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  const error = await requireActiveSubscription(req);
  if (error) return error;
  
  return handler(req);
}

/**
 * Helper function to apply client limit middleware to an API route
 */
export async function withClientLimit(
  req: NextRequest,
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  const error = await requireClientLimit(req);
  if (error) return error;
  
  return handler(req);
}
