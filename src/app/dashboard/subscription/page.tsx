import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { SubscriptionManager } from "@/components/SubscriptionManager";

export default async function SubscriptionPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    redirect("/login");
  }
  
  // Get user with subscription and clients
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      subscription: true,
      clients: true,
    },
  });
  
  if (!user) {
    redirect("/login");
  }
  
  return (
    <div className="min-h-screen bg-[#1c1d20] text-[#f5f5f7]">
      <div className="container max-w-6xl p-4 md:p-6">
        <SubscriptionManager
          currentPlan={user.subscription?.plan || null}
          subscriptionStatus={user.subscription?.status || null}
          currentPeriodEnd={user.subscription?.currentPeriodEnd || null}
          clientCount={user.clients.length}
        />
      </div>
    </div>
  );
}
