-- Add registration fields to User model
ALTER TABLE "users" 
ADD COLUMN IF NOT EXISTS "companyName" TEXT,
ADD COLUMN IF NOT EXISTS "teamSize" TEXT,
ADD COLUMN IF NOT EXISTS "industry" TEXT,
ADD COLUMN IF NOT EXISTS "customIndustry" TEXT;
