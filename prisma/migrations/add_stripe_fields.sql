-- Add Stripe fields to Subscription table
ALTER TABLE "users"."Subscription" 
ADD COLUMN IF NOT EXISTS "stripeSubscriptionId" TEXT,
ADD COLUMN IF NOT EXISTS "stripeCustomerId" TEXT,
ADD COLUMN IF NOT EXISTS "currentPeriodEnd" TIMESTAMP;

-- Add unique constraints
CREATE UNIQUE INDEX IF NOT EXISTS "Subscription_stripeSubscriptionId_key" ON "users"."Subscription"("stripeSubscriptionId") 
WHERE "stripeSubscriptionId" IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "Subscription_stripeCustomerId_key" ON "users"."Subscription"("stripeCustomerId")
WHERE "stripeCustomerId" IS NOT NULL;
