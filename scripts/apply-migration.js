const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

async function applyMigration() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Iniciando migração do modelo VerificationCode...');
    
    // Ler o arquivo SQL
    const sqlPath = path.join(__dirname, '../prisma/migrations/verification_code_email.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Dividir as consultas SQL (separadas por ponto e vírgula)
    const queries = sql
      .split(';')
      .map(query => query.trim())
      .filter(query => query.length > 0);
    
    // Executar cada consulta
    for (const query of queries) {
      try {
        await prisma.$executeRawUnsafe(`${query};`);
        console.log('Executada consulta:', query.substring(0, 50) + '...');
      } catch (error) {
        // Ignorar erros específicos como "column already exists" ou "constraint does not exist"
        console.warn('Aviso ao executar consulta:', error.message);
      }
    }
    
    console.log('Gerando cliente Prisma atualizado...');
    
    // Gerar o cliente Prisma atualizado
    const { execSync } = require('child_process');
    execSync('npx prisma generate', { stdio: 'inherit' });
    
    console.log('Migração concluída com sucesso!');
  } catch (error) {
    console.error('Erro ao aplicar migração:', error);
  } finally {
    await prisma.$disconnect();
  }
}

applyMigration();
