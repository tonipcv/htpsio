import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function runMigration() {
  try {
    console.log('Iniciando migração...');

    // Ler o arquivo SQL
    const sqlPath = path.join(process.cwd(), 'prisma/migrations/20250702222408_add_device_unique_constraint.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Dividir em comandos individuais
    const commands = sql
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0);

    // Executar cada comando em uma transação
    for (const command of commands) {
      console.log('Executando comando:', command);
      await prisma.$executeRawUnsafe(command + ';');
    }

    console.log('Migração concluída com sucesso!');

  } catch (error) {
    console.error('Erro durante a migração:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Executar migração
runMigration()
  .catch(error => {
    console.error('Falha na migração:', error);
    process.exit(1);
  }); 