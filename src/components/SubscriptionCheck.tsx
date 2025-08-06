'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/components/ui/use-toast';

interface SubscriptionCheckProps {
  children: React.ReactNode;
  redirectTo?: string;
  apiEndpoint: string;
}

export function SubscriptionCheck({ 
  children, 
  redirectTo = '/pricing',
  apiEndpoint 
}: SubscriptionCheckProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const checkSubscription = async () => {
      try {
        const response = await fetch(apiEndpoint);
        
        if (response.ok) {
          setHasAccess(true);
        } else {
          const data = await response.json();
          
          if (data.requiresUpgrade) {
            toast({
              title: "Subscription Required",
              description: "Please upgrade your plan to access this feature.",
              variant: "destructive",
            });
            router.push(redirectTo);
          }
        }
      } catch (error) {
        console.error('Error checking subscription:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSubscription();
  }, [apiEndpoint, redirectTo, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!hasAccess) {
    return null;
  }

  return <>{children}</>;
}
