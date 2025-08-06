# Document Access Verification System

This document explains how the document access verification system works in the application, specifically how user plans and access levels are checked before granting access to documents.

## Overview

The system ensures that only users with valid paid subscriptions or administrative privileges can access document-related features. The verification happens in multiple layers:

1. **Frontend Check** (React Component)
2. **API Endpoint Verification**
3. **Database-Level Plan Check**

## 1. Frontend Check (`/app/(authenticated)/documents/page.tsx`)

```typescript
// Superadmins get immediate access
if (session?.user?.role === "superadmin") {
  setIsAllowed(true);
  setIsLoading(false);
  return;
}

// For regular users, verify subscription
const response = await fetch('/api/check-subscription');
const data = await response.json();

if (!response.ok && data.upgrade) {
  // Redirect to pricing page for free plan users
  router.push('/pricing');
  return;
}
```

## 2. API Endpoint Verification (`/app/api/check-subscription/route.ts`)

```typescript
export async function GET(req: NextRequest) {
  // Verify authentication
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  // Check if user is on free plan
  const userIsFreePlan = await isFreePlan(session.user.id);
  
  if (userIsFreePlan) {
    return NextResponse.json({ 
      error: "O plano gratuito não permite acesso a documentos",
      upgrade: true
    }, { status: 403 });
  }
  
  // User has paid plan
  return NextResponse.json({ 
    success: true,
    message: "Usuário tem acesso a documentos"
  });
}
```

## 3. Database-Level Plan Check (`/lib/stripe.ts`)

The `isFreePlan` function determines if a user is on the free plan:

```typescript
export async function isFreePlan(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { subscription: true },
  });
  
  // User is on free plan if:
  // 1. No subscription exists
  // 2. Plan is explicitly 'free'
  // 3. Subscription status is not 'active'
  return !user?.subscription || 
         user.subscription.plan === 'free' || 
         user.subscription.status !== 'active';
}
```

## User Roles and Access Levels

1. **Superadmins**
   - Have unrestricted access to all documents
   - Bypass all plan checks
   - Identified by `role === "superadmin"`

2. **Paid Users**
   - Must have an active subscription
   - Subscription must have `status === 'active'`
   - Plan must not be 'free'

3. **Free Plan Users**
   - No subscription OR
   - Subscription with `plan === 'free'` OR
   - Inactive subscription (`status !== 'active'`)
   - Redirected to pricing page

## Flow Diagram

```
┌─────────────┐     ┌─────────────────────┐     ┌─────────────────┐
│  Document   │────▶│  Check User Role   │────▶│  Superadmin?    │
│   Access    │     └─────────┬───────────┘     └────────┬────────┘
└─────────────┘               │                          │
                             ▼                          │
                 ┌─────────────────────┐                │
                 │  Check Subscription │                │
                 │      via API        │                │
                 └─────────┬───────────┘                │
                           │                            │
                           ▼                            │
                 ┌─────────────────────┐                │
                 │  Database Check:    │                │
                 │  - Has subscription?│                │
                 │  - Plan is not free?│                │
                 │  - Status active?   │                │
                 └─────────┬───────────┘                │
                           │                            │
                 ┌─────────▼───────────┐                │
                 │  Grant Access       │◀───────────────┘
                 └─────────────────────┘
```

## Error Handling

- **401 Unauthorized**: User not logged in
- **403 Forbidden**: User is on free plan (`upgrade: true` in response)
- **500 Internal Server Error**: Error during verification

## Important Notes

1. The system caches user plan information for 5 minutes to reduce database load
2. Superadmin access bypasses all plan checks
3. All plan checks are performed server-side for security
4. The frontend provides visual feedback during verification
5. Users on free plans are automatically redirected to the pricing page
