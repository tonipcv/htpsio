const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addDocumentTables() {
  try {
    console.log('🚀 Iniciando criação das tabelas de documentos...');

    // Verificar se as tabelas já existem
    try {
      await prisma.$queryRaw`SELECT * FROM "Document" LIMIT 1`;
      console.log('⚠️  Tabelas de documentos já existem!');
      return;
    } catch (error) {
      console.log('✨ Criando novas tabelas...');
    }

    // Criar tabela Document
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Document" (
        "id" UUID NOT NULL DEFAULT gen_random_uuid(),
        "name" TEXT NOT NULL,
        "mimeType" TEXT NOT NULL,
        "size" INTEGER NOT NULL,
        "s3Key" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Document_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "Document_s3Key_key" UNIQUE ("s3Key"),
        CONSTRAINT "Document_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE
      );
    `;

    // Criar tabela DocumentDownload
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "DocumentDownload" (
        "id" UUID NOT NULL DEFAULT gen_random_uuid(),
        "documentId" UUID NOT NULL,
        "userId" TEXT NOT NULL,
        "watermarkKey" TEXT NOT NULL,
        "downloadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "ipAddress" TEXT,
        "userAgent" TEXT,
        CONSTRAINT "DocumentDownload_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "DocumentDownload_watermarkKey_key" UNIQUE ("watermarkKey"),
        CONSTRAINT "DocumentDownload_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
        CONSTRAINT "DocumentDownload_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE
      );
    `;

    // Criar índices
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "Document_userId_idx" ON "Document"("userId");`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "DocumentDownload_documentId_idx" ON "DocumentDownload"("documentId");`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "DocumentDownload_userId_idx" ON "DocumentDownload"("userId");`;

    console.log('✅ Tabelas de documentos criadas com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao criar tabelas:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addDocumentTables(); 