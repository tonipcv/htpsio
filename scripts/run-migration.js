const { PrismaClient } = require('@prisma/client');
const path = require('path');

async function runMigration() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Starting SQL migration...');
    
    // Execute SQL statements individually
    console.log('Adding columns to Subscription table...');
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Subscription" 
      ADD COLUMN IF NOT EXISTS "stripeSubscriptionId" TEXT,
      ADD COLUMN IF NOT EXISTS "stripeCustomerId" TEXT,
      ADD COLUMN IF NOT EXISTS "currentPeriodEnd" TIMESTAMP;
    `);
    
    console.log('Adding unique index for stripeSubscriptionId...');
    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "Subscription_stripeSubscriptionId_key" 
      ON "Subscription"("stripeSubscriptionId") 
      WHERE "stripeSubscriptionId" IS NOT NULL;
    `);
    
    console.log('Adding unique index for stripeCustomerId...');
    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "Subscription_stripeCustomerId_key" 
      ON "Subscription"("stripeCustomerId")
      WHERE "stripeCustomerId" IS NOT NULL;
    `);
    
    console.log('Migration completed successfully!');
    
    // Generate Prisma client to reflect the changes
    console.log('Generating Prisma client...');
    const { execSync } = require('child_process');
    execSync('npx prisma generate', { stdio: 'inherit' });
    
    console.log('Prisma client generated successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

runMigration();
