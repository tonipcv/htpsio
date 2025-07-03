import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateSchema() {
  try {
    console.log('Iniciando atualização do schema...');

    // 1. Criar índice único para Device
    console.log('Criando índice único para Device (externalId, tenantId)...');
    await prisma.$executeRaw`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (
          SELECT 1 
          FROM pg_indexes 
          WHERE tablename = 'Device' 
          AND indexname = 'Device_externalId_tenantId_key'
        ) THEN
          CREATE UNIQUE INDEX "Device_externalId_tenantId_key" 
          ON "Device" ("externalId", "tenantId");
        END IF;
      END $$;
    `;

    // 2. Adicionar coluna userId em Device se não existir
    console.log('Adicionando coluna userId em Device...');
    await prisma.$executeRaw`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (
          SELECT 1 
          FROM information_schema.columns 
          WHERE table_name = 'Device' 
          AND column_name = 'userId'
        ) THEN
          ALTER TABLE "Device" 
          ADD COLUMN "userId" TEXT REFERENCES "users"(id);
        END IF;
      END $$;
    `;

    // 3. Adicionar coluna name em Device se não existir
    console.log('Adicionando coluna name em Device...');
    await prisma.$executeRaw`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (
          SELECT 1 
          FROM information_schema.columns 
          WHERE table_name = 'Device' 
          AND column_name = 'name'
        ) THEN
          ALTER TABLE "Device" 
          ADD COLUMN "name" TEXT;
        END IF;
      END $$;
    `;

    // 4. Adicionar coluna version em Device se não existir
    console.log('Adicionando coluna version em Device...');
    await prisma.$executeRaw`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (
          SELECT 1 
          FROM information_schema.columns 
          WHERE table_name = 'Device' 
          AND column_name = 'version'
        ) THEN
          ALTER TABLE "Device" 
          ADD COLUMN "version" TEXT;
        END IF;
      END $$;
    `;

    // 5. Adicionar coluna isIsolated em Device se não existir
    console.log('Adicionando coluna isIsolated em Device...');
    await prisma.$executeRaw`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (
          SELECT 1 
          FROM information_schema.columns 
          WHERE table_name = 'Device' 
          AND column_name = 'isIsolated'
        ) THEN
          ALTER TABLE "Device" 
          ADD COLUMN "isIsolated" BOOLEAN NOT NULL DEFAULT false;
        END IF;
      END $$;
    `;

    // 6. Adicionar colunas ipAddress e macAddress em Device se não existirem
    console.log('Adicionando colunas ipAddress e macAddress em Device...');
    await prisma.$executeRaw`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (
          SELECT 1 
          FROM information_schema.columns 
          WHERE table_name = 'Device' 
          AND column_name = 'ipAddress'
        ) THEN
          ALTER TABLE "Device" 
          ADD COLUMN "ipAddress" TEXT;
        END IF;

        IF NOT EXISTS (
          SELECT 1 
          FROM information_schema.columns 
          WHERE table_name = 'Device' 
          AND column_name = 'macAddress'
        ) THEN
          ALTER TABLE "Device" 
          ADD COLUMN "macAddress" TEXT;
        END IF;
      END $$;
    `;

    // 7. Criar tabela SecurityAction se não existir
    console.log('Criando tabela SecurityAction...');
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "SecurityAction" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "deviceId" TEXT NOT NULL,
        "action" TEXT NOT NULL,
        "reason" TEXT,
        "status" TEXT NOT NULL,
        "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT "SecurityAction_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "SecurityAction_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE RESTRICT ON UPDATE CASCADE
      );
    `;

    // 8. Criar índices para SecurityAction
    console.log('Criando índices para SecurityAction...');
    await prisma.$executeRaw`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (
          SELECT 1 
          FROM pg_indexes 
          WHERE tablename = 'SecurityAction' 
          AND indexname = 'SecurityAction_userId_idx'
        ) THEN
          CREATE INDEX "SecurityAction_userId_idx" ON "SecurityAction"("userId");
        END IF;

        IF NOT EXISTS (
          SELECT 1 
          FROM pg_indexes 
          WHERE tablename = 'SecurityAction' 
          AND indexname = 'SecurityAction_deviceId_idx'
        ) THEN
          CREATE INDEX "SecurityAction_deviceId_idx" ON "SecurityAction"("deviceId");
        END IF;
      END $$;
    `;

    console.log('Schema atualizado com sucesso!');
  } catch (error) {
    console.error('Erro ao atualizar schema:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

updateSchema()
  .catch((error) => {
    console.error('Erro fatal:', error);
    process.exit(1);
  }); 