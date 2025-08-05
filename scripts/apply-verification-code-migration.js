// Script para aplicar a migração SQL para adicionar a tabela VerificationCode
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando migração da tabela VerificationCode...');
  
  try {
    // Caminho para o arquivo SQL
    const sqlFilePath = path.join(__dirname, '../prisma/migrations/add_verification_code.sql');
    
    // Ler o conteúdo do arquivo SQL
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Executar a migração usando o cliente Prisma
    console.log('Executando SQL...');
    
    // Dividir o conteúdo SQL em comandos individuais
    const sqlCommands = sqlContent
      .split(';')
      .filter(cmd => cmd.trim() !== '')
      .map(cmd => cmd.trim() + ';');
    
    // Executar cada comando SQL individualmente
    for (const command of sqlCommands) {
      try {
        await prisma.$executeRawUnsafe(command);
        console.log('Comando SQL executado com sucesso:', command.substring(0, 50) + '...');
      } catch (err) {
        // Ignorar erros de tabela já existente
        if (err.message.includes('already exists')) {
          console.log('Tabela ou índice já existe, continuando...');
        } else {
          throw err;
        }
      }
    }
    
    console.log('Migração SQL concluída com sucesso!');
    
    // Gerar o cliente Prisma atualizado
    console.log('Gerando cliente Prisma atualizado...');
    exec('npx prisma generate', (error, stdout, stderr) => {
      if (error) {
        console.error(`Erro ao gerar cliente Prisma: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`Stderr: ${stderr}`);
        return;
      }
      console.log(`Stdout: ${stdout}`);
      console.log('Cliente Prisma atualizado com sucesso!');
    });
    
  } catch (error) {
    console.error('Erro durante a migração:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  });
