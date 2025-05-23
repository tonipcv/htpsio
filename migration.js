const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgres://postgres:8534e9ea0d116e341130@dpbdp1.easypanel.host:900/boop?sslmode=disable"
    }
  }
});

async function main() {
  try {
    // 1. First, ensure the userId column exists and has the correct type
    await prisma.$executeRawUnsafe(`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (
          SELECT 1 
          FROM information_schema.columns 
          WHERE table_name = 'Patient' 
          AND column_name = 'userId'
        ) THEN 
          ALTER TABLE "Patient" ADD COLUMN "userId" TEXT;
        END IF;
      END $$;
    `);

    // 2. Create index on userId if it doesn't exist
    await prisma.$executeRawUnsafe(`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (
          SELECT 1 
          FROM pg_indexes 
          WHERE tablename = 'Patient' 
          AND indexname = 'Patient_userId_idx'
        ) THEN 
          CREATE INDEX "Patient_userId_idx" ON "Patient"("userId");
        END IF;
      END $$;
    `);

    // 3. Add foreign key constraint if it doesn't exist
    await prisma.$executeRawUnsafe(`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (
          SELECT 1 
          FROM information_schema.table_constraints 
          WHERE constraint_name = 'Patient_userId_fkey'
        ) THEN 
          ALTER TABLE "Patient" 
          ADD CONSTRAINT "Patient_userId_fkey" 
          FOREIGN KEY ("userId") 
          REFERENCES "User"(id) 
          ON DELETE SET NULL;
        END IF;
      END $$;
    `);

    // Add foreign key constraint if it doesn't exist
    await prisma.$executeRawUnsafe(`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (
          SELECT 1 
          FROM information_schema.table_constraints 
          WHERE constraint_name = 'ReferralReward_pageId_fkey'
        ) THEN 
          ALTER TABLE "ReferralReward" 
          ADD CONSTRAINT "ReferralReward_pageId_fkey" 
          FOREIGN KEY ("pageId") 
          REFERENCES "Page"(id) 
          ON DELETE SET NULL;
        END IF;
      END $$;
    `);

    // Add foreign key constraint for Patient.leadId -> leads.id if it doesn't exist
    await prisma.$executeRawUnsafe(`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (
          SELECT 1 
          FROM information_schema.table_constraints 
          WHERE constraint_name = 'Patient_leadId_fkey'
        ) THEN 
          ALTER TABLE "Patient" 
          ADD CONSTRAINT "Patient_leadId_fkey" 
          FOREIGN KEY ("leadId") 
          REFERENCES "leads"(id) 
          ON DELETE SET NULL;
        END IF;
      END $$;
    `);

    // Create index on leadId if it doesn't exist
    await prisma.$executeRawUnsafe(`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (
          SELECT 1 
          FROM pg_indexes 
          WHERE tablename = 'Patient' 
          AND indexname = 'Patient_leadId_idx'
        ) THEN 
          CREATE INDEX "Patient_leadId_idx" ON "Patient"("leadId");
        END IF;
      END $$;
    `);

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 