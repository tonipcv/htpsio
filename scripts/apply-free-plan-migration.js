// Script para aplicar a migração do plano free
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Iniciando migração para plano free...');
    
    // Lê o arquivo SQL
    const sqlPath = path.join(__dirname, '../prisma/migrations/free_plan_migration.sql');
    const sqlQuery = fs.readFileSync(sqlPath, 'utf8');
    
    // Divide as consultas SQL por ponto e vírgula
    const queries = sqlQuery
      .split(';')
      .filter(query => query.trim() !== '')
      .map(query => query.trim());
    
    // Executa cada consulta SQL
    for (const query of queries) {
      console.log(`Executando: ${query.substring(0, 100)}...`);
      await prisma.$executeRawUnsafe(query);
    }
    
    // Verifica os resultados
    const subscriptionCount = await prisma.subscription.count();
    const freeSubscriptions = await prisma.subscription.count({
      where: {
        plan: 'free'
      }
    });
    
    console.log(`Migração concluída com sucesso!`);
    console.log(`Total de assinaturas: ${subscriptionCount}`);
    console.log(`Assinaturas com plano free: ${freeSubscriptions}`);
    
  } catch (error) {
    console.error('Erro durante a migração:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
