'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckIcon, ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import Link from 'next/link';
import Image from 'next/image';
import { SUBSCRIPTION_PLANS } from '@/lib/stripe';

// Convert plans object to array for easier rendering
const plans = Object.values(SUBSCRIPTION_PLANS).map(plan => ({
  id: plan.id,
  name: plan.name,
  price: plan.price,
  period: '/month',
  description: `Up to ${plan.maxClients} clients`,
  features: [
    `Up to ${plan.maxClients} clients`,
    'Unlimited documents',
    ...(plan.id !== 'basic' ? ['Priority support'] : []),
    ...(plan.id === 'enterprise' ? ['Custom branding'] : [])
  ],
  highlighted: plan.id === 'pro'
}));

export default function PricingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState<string | null>(null);

  // Handle subscription checkout
  const handleSelectPlan = async (planId: string) => {
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
      toast({
        title: "Error",
        description: "Failed to create checkout session. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-900 pb-12 flex flex-col items-center">
      <div className="container max-w-5xl px-4 py-16 flex flex-col items-center">
        {/* Logo */}
        <div className="mb-12">
          <div className="relative w-40 h-12">
            <Image
              src="/logo.png"
              alt="MED1 Logo"
              fill
              priority
              className="object-contain invert brightness-200"
            />
          </div>
        </div>
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-medium text-white tracking-tight">Choose Your Plan</h1>
          <p className="mt-3 text-lg text-zinc-400 max-w-2xl">Get started with the right plan for your business</p>
        </div>

        {/* Navigation buttons */}
      
        
        {/* Logout button */}
        <div className="absolute top-4 right-4">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-zinc-500 hover:text-zinc-400"
            onClick={() => signOut({ callbackUrl: '/' })}
          >
            Logout
          </Button>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`bg-zinc-800 border border-zinc-700 shadow-sm hover:shadow-md transition-all duration-300 ${plan.highlighted ? 'ring-2 ring-primary/50' : ''}`}
            >
              <CardHeader className="px-6 pt-6 pb-4">
                <CardTitle className="text-xl font-medium text-white">{plan.name}</CardTitle>
                <CardDescription className="text-sm text-zinc-400 mt-1">{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <div className="flex items-baseline mb-6">
                  <span className="text-4xl font-medium text-white">$</span>
                  <span className="text-4xl font-medium text-white">{plan.price}</span>
                  <span className="ml-2 text-sm text-zinc-400">/month</span>
                </div>
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <CheckIcon className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-zinc-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="px-6 pb-6 pt-2">
                <Button 
                  className={`w-full py-2 text-sm font-normal rounded-lg transition-all ${plan.highlighted ? 'bg-primary hover:bg-primary/90 text-white' : 'bg-zinc-700 hover:bg-zinc-600 text-zinc-300'}`}
                  onClick={() => handleSelectPlan(plan.id)}
                  disabled={isLoading !== null}
                >
                  {isLoading === plan.id ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    `Select ${plan.name}`
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
} 