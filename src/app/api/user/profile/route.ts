import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isFreePlan } from "@/lib/stripe";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user data
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        plan: true,
        isPremium: true,
        clients: {
          select: {
            id: true
          }
        },
        subscription: {
          select: {
            id: true,
            status: true,
            plan: true,
            currentPeriodEnd: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user is on free plan
    const userIsFreePlan = await isFreePlan(user.id);

    // Format response
    const response = {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      plan: user.plan,
      isPremium: user.isPremium,
      clients: user.clients,
      subscription: user.subscription || {
        plan: userIsFreePlan ? 'free' : 'unknown',
        status: userIsFreePlan ? 'active' : 'unknown',
        currentPeriodEnd: null
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
