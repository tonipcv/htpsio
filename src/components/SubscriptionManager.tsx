'use client';

import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { SUBSCRIPTION_PLANS } from '@/lib/stripe';
import { useRouter } from 'next/navigation';
import { toast } from './ui/use-toast';

// Definindo o tipo para os planos de assinatura
interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  priceId?: string;
  maxClients: number;
  features: string[];
}
import { Loader2 } from 'lucide-react';

interface SubscriptionManagerProps {
  currentPlan: string | null;
  subscriptionStatus: string | null;
  currentPeriodEnd: Date | null;
  clientCount: number;
}

export function SubscriptionManager({
  currentPlan,
  subscriptionStatus,
  currentPeriodEnd,
  clientCount
}: SubscriptionManagerProps) {
  const router = useRouter();
  const showError = (message: string) => {
    toast({
      title: "Error",
      description: message,
      variant: "destructive"
    });
  };
  const [isLoading, setIsLoading] = useState<string | null>(null);

  // Convert plans object to array for easier rendering
  const plans: SubscriptionPlan[] = Object.values(SUBSCRIPTION_PLANS).map(plan => ({
    ...plan,
    description: `Up to ${plan.maxClients} clients`,
    features: [
      `Up to ${plan.maxClients} clients`,
      'Unlimited documents',
      ...(plan.id !== 'basic' ? ['Priority support'] : []),
      ...(plan.id === 'enterprise' ? ['Custom branding'] : [])
    ]
  }));

  // Format date to readable string
  const formatDate = (date: Date | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Handle subscription checkout
  const handleCheckout = async (planId: string) => {
    setIsLoading(planId);
    
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planId }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }
      
      // Redirect to Stripe checkout
      if (data.url) {
        router.push(data.url);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      showError('Failed to create checkout session. Please try again.');
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-xl font-medium text-[#f5f5f7]">Subscription Management</h2>
        <p className="text-xs text-[#f5f5f7]/50">
          Manage your subscription plan and billing details
        </p>
      </div>

      {/* Current subscription info */}
      {currentPlan && (
        <Card className="bg-[#1c1d20]/50 border-[#f5f5f7]/10">
          <CardHeader>
            <CardTitle className="text-sm text-[#f5f5f7]">Current Subscription</CardTitle>
            <CardDescription className="text-xs text-[#f5f5f7]/50">Your active subscription details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-[#f5f5f7]/70">Plan</p>
                <p className="text-xs text-[#f5f5f7]">
                  {plans.find(p => p.id === currentPlan)?.name || currentPlan}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-[#f5f5f7]/70">Status</p>
                <p className="text-xs text-[#f5f5f7] capitalize">
                  {subscriptionStatus || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-[#f5f5f7]/70">Current Period End</p>
                <p className="text-xs text-[#f5f5f7]">
                  {formatDate(currentPeriodEnd)}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-[#f5f5f7]/70">Client Usage</p>
                <p className="text-xs text-[#f5f5f7]">
                  {clientCount} / {plans.find(p => p.id === currentPlan)?.maxClients || 'Unlimited'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available plans */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.id} className={`bg-[#1c1d20]/50 border-[#f5f5f7]/10 ${currentPlan === plan.id ? 'border-[#f5f5f7]/30' : ''}`}>
            <CardHeader>
              <CardTitle className="text-sm text-[#f5f5f7]">{plan.name}</CardTitle>
              <CardDescription className="text-xs text-[#f5f5f7]/50">{plan.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-medium text-[#f5f5f7]">${plan.price}</div>
              <p className="text-xs text-[#f5f5f7]/50">per month</p>
              <ul className="mt-3 space-y-1">
                <li className="flex items-center text-xs text-[#f5f5f7]/70">
                  <span className="mr-2 text-[#f5f5f7]/50">•</span>
                  Up to {plan.maxClients} clients
                </li>
                <li className="flex items-center text-xs text-[#f5f5f7]/70">
                  <span className="mr-2 text-[#f5f5f7]/50">•</span>
                  Unlimited documents
                </li>
                {plan.id !== 'basic' && (
                  <li className="flex items-center text-xs text-[#f5f5f7]/70">
                    <span className="mr-2 text-[#f5f5f7]/50">•</span>
                    Priority support
                  </li>
                )}
                {plan.id === 'enterprise' && (
                  <li className="flex items-center text-xs text-[#f5f5f7]/70">
                    <span className="mr-2 text-[#f5f5f7]/50">•</span>
                    Custom branding
                  </li>
                )}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full h-8 text-xs bg-[#f5f5f7]/10 hover:bg-[#f5f5f7]/20 text-[#f5f5f7] border-0"
                onClick={() => handleCheckout(plan.id)}
                disabled={isLoading !== null || currentPlan === plan.id}
                variant="outline"
              >
                {isLoading === plan.id ? (
                  <>
                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                    Processing...
                  </>
                ) : currentPlan === plan.id ? (
                  'Current Plan'
                ) : (
                  `${currentPlan ? 'Switch to' : 'Select'} ${plan.name}`
                )}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
