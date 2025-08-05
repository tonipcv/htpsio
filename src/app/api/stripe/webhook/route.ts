import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

// This is your Stripe webhook secret for testing your endpoint locally.
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature") as string;

  let event: Stripe.Event;

  try {
    if (!webhookSecret) {
      throw new Error('Webhook secret is not set');
    }
    
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      
      // Retrieve the subscription details
      if (session.subscription && session.customer && session.metadata?.userId && session.metadata?.planId) {
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
        
        // Update user subscription in database
        await prisma.subscription.upsert({
          where: { userId: session.metadata.userId },
          update: {
            plan: session.metadata.planId,
            status: 'active',
            stripeSubscriptionId: subscription.id,
            stripeCustomerId: session.customer as string,
            currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
            updatedAt: new Date(),
          },
          create: {
            userId: session.metadata.userId,
            plan: session.metadata.planId,
            status: 'active',
            stripeSubscriptionId: subscription.id,
            stripeCustomerId: session.customer as string,
            currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
          },
        });
        
        // Also update the user's isPremium status
        await prisma.user.update({
          where: { id: session.metadata.userId },
          data: { 
            isPremium: true,
            plan: session.metadata.planId
          },
        });
      }
      break;
    }
    
    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as Stripe.Invoice;
      
      // Use type assertion for invoice.subscription as it exists but TypeScript doesn't recognize it
      if ((invoice as any).subscription && invoice.customer) {
        const subscription = await stripe.subscriptions.retrieve((invoice as any).subscription as string);
        const customer = await stripe.customers.retrieve(invoice.customer as string);
        
        if (customer.deleted) {
          break;
        }
        
        // Find the user by stripeCustomerId
        const userSubscription = await prisma.subscription.findFirst({
          where: { stripeCustomerId: invoice.customer as string },
        });
        
        if (userSubscription) {
          // Update subscription period end date
          await prisma.subscription.update({
            where: { id: userSubscription.id },
            data: {
              status: 'active',
              currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
              updatedAt: new Date(),
            },
          });
        }
      }
      break;
    }
    
    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      
      // Find the user by stripeSubscriptionId
      const userSubscription = await prisma.subscription.findFirst({
        where: { stripeSubscriptionId: subscription.id },
      });
      
      if (userSubscription) {
        // Update subscription status and period end date
        await prisma.subscription.update({
          where: { id: userSubscription.id },
          data: {
            status: subscription.status,
            currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
            updatedAt: new Date(),
          },
        });
        
        // Update user's isPremium status based on subscription status
        await prisma.user.update({
          where: { id: userSubscription.userId },
          data: { 
            isPremium: subscription.status === 'active',
          },
        });
      }
      break;
    }
    
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      
      // Find the user by stripeSubscriptionId
      const userSubscription = await prisma.subscription.findFirst({
        where: { stripeSubscriptionId: subscription.id },
      });
      
      if (userSubscription) {
        // Update subscription status
        await prisma.subscription.update({
          where: { id: userSubscription.id },
          data: {
            status: 'canceled',
            updatedAt: new Date(),
          },
        });
        
        // Update user's isPremium status
        await prisma.user.update({
          where: { id: userSubscription.userId },
          data: { 
            isPremium: false,
            plan: 'free'
          },
        });
      }
      break;
    }
    
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
