const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Inicializar o cliente Prisma
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🔄 Iniciando migração para renomear a tabela document_access_logs...');
    
    // Comandos SQL para executar individualmente
    const sqlCommands = [
      // Renomear a tabela
      `ALTER TABLE IF EXISTS public.document_access_logs RENAME TO "DocumentAccessLog";`,
      
      // Renomear as colunas
      `ALTER TABLE IF EXISTS public."DocumentAccessLog" RENAME COLUMN document_id TO "documentId";`,
      `ALTER TABLE IF EXISTS public."DocumentAccessLog" RENAME COLUMN user_id TO "userId";`,
      `ALTER TABLE IF EXISTS public."DocumentAccessLog" RENAME COLUMN visitor_token TO "visitorToken";`,
      `ALTER TABLE IF EXISTS public."DocumentAccessLog" RENAME COLUMN access_start_time TO "accessStartTime";`,
      `ALTER TABLE IF EXISTS public."DocumentAccessLog" RENAME COLUMN access_end_time TO "accessEndTime";`,
      `ALTER TABLE IF EXISTS public."DocumentAccessLog" RENAME COLUMN user_agent TO "userAgent";`,
      `ALTER TABLE IF EXISTS public."DocumentAccessLog" RENAME COLUMN ip_address TO "ipAddress";`,
      `ALTER TABLE IF EXISTS public."DocumentAccessLog" RENAME COLUMN created_at TO "createdAt";`,
      
      // Atualizar as restrições de chave estrangeira
      `ALTER TABLE IF EXISTS public."DocumentAccessLog" DROP CONSTRAINT IF EXISTS document_access_logs_document_id_fkey;`,
      `ALTER TABLE IF EXISTS public."DocumentAccessLog" ADD CONSTRAINT "DocumentAccessLog_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES public."Document"(id);`,
      
      `ALTER TABLE IF EXISTS public."DocumentAccessLog" DROP CONSTRAINT IF EXISTS document_access_logs_user_id_fkey;`,
      `ALTER TABLE IF EXISTS public."DocumentAccessLog" ADD CONSTRAINT "DocumentAccessLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id);`,
      
      // Atualizar os índices
      `DROP INDEX IF EXISTS document_access_logs_document_id_idx;`,
      `CREATE INDEX IF NOT EXISTS "DocumentAccessLog_documentId_idx" ON public."DocumentAccessLog"("documentId");`,
      
      `DROP INDEX IF EXISTS document_access_logs_user_id_idx;`,
      `CREATE INDEX IF NOT EXISTS "DocumentAccessLog_userId_idx" ON public."DocumentAccessLog"("userId");`
    ];
    
    // Executar cada comando SQL separadamente
    console.log('📝 Executando comandos SQL para renomear tabela e colunas...');
    for (const command of sqlCommands) {
      try {
        await prisma.$executeRawUnsafe(command);
        console.log('✓ Comando executado com sucesso');
      } catch (error) {
        console.warn(`⚠️ Aviso ao executar comando: ${error.message}`);
        console.warn('Continuando com o próximo comando...');
      }
    }
    
    console.log('✅ SQL executado com sucesso!');
    
    // Regenerar o Prisma Client
    console.log('🔄 Regenerando o Prisma Client...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    
    console.log('✅ Prisma Client regenerado com sucesso!');
    
    // Verificar se a tabela foi renomeada corretamente
    console.log('🔍 Verificando se a tabela foi renomeada corretamente...');
    
    // Verificar se a tabela DocumentAccessLog existe
    const tableCheck = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'DocumentAccessLog'
      ) as exists;
    `;
    
    if (tableCheck[0].exists) {
      console.log('✅ Tabela "DocumentAccessLog" existe!');
      
      // Verificar se as colunas foram renomeadas
      const columnCheck = await prisma.$queryRaw`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'DocumentAccessLog';
      `;
      
      console.log('📋 Colunas na tabela "DocumentAccessLog":');
      columnCheck.forEach(col => {
        console.log(`- ${col.column_name}`);
      });
      
      // Testar se o Prisma Client pode acessar o modelo
      try {
        console.log('🧪 Testando acesso ao modelo via Prisma Client...');
        const count = await prisma.documentAccessLog.count();
        console.log(`✅ Prisma Client funcionando! Existem ${count} registros na tabela.`);
      } catch (error) {
        console.error('❌ Erro ao acessar o modelo via Prisma Client:', error.message);
      }
    } else {
      console.error('❌ A tabela "DocumentAccessLog" não foi encontrada!');
    }
    
    console.log('✅ Migração concluída!');
  } catch (error) {
    console.error('❌ Erro durante a migração:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
