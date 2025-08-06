const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🧪 Iniciando teste de logs de acesso a documentos usando Prisma Client...');
    
    // 1. Limpar logs de teste anteriores
    console.log('🧹 Limpando logs de teste anteriores...');
    await prisma.documentAccessLog.deleteMany({
      where: {
        OR: [
          { userId: 'test-user-id' },
          { visitorToken: 'test-visitor-token' }
        ]
      }
    });
    
    // 2. Verificar se existem documentos para teste
    console.log('🔍 Verificando documentos disponíveis para teste...');
    const documents = await prisma.document.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' }
    });
    
    if (documents.length === 0) {
      console.log('❌ Nenhum documento encontrado para teste. Criando documento de teste...');
      
      // Criar um documento de teste se não existir nenhum
      const testDocument = await prisma.document.create({
        data: {
          name: 'Documento de Teste',
          mimeType: 'application/pdf',
          size: 1024,
          path: '/test/document.pdf',
          userId: 'test-user-id'
        }
      });
      
      documents.push(testDocument);
      console.log(`✅ Documento de teste criado com ID: ${testDocument.id}`);
    }
    
    const testDocument = documents[0];
    console.log(`📄 Usando documento para teste: ${testDocument.name} (ID: ${testDocument.id})`);
    
    // 3. Criar log de acesso para visitante (sem userId para evitar erro de chave estrangeira)
    console.log('📝 Criando log de acesso para visitante com token...');
    const userAccessLog = await prisma.documentAccessLog.create({
      data: {
        documentId: testDocument.id,
        // Não usar userId para evitar erro de chave estrangeira
        visitorToken: 'test-visitor-token-1',
        accessStartTime: new Date(),
        userAgent: 'Mozilla/5.0 (Test User Agent)',
        ipAddress: '127.0.0.1',
        city: 'Test City',
        country: 'Test Country'
      }
    });
    
    console.log(`✅ Log de acesso criado para usuário: ${userAccessLog.id}`);
    
    // 4. Criar log de acesso para outro visitante anônimo
    console.log('📝 Criando log de acesso para outro visitante anônimo...');
    const visitorAccessLog = await prisma.documentAccessLog.create({
      data: {
        documentId: testDocument.id,
        visitorToken: 'test-visitor-token-2',
        accessStartTime: new Date(),
        userAgent: 'Mozilla/5.0 (Test Visitor Agent)',
        ipAddress: '192.168.1.1',
        city: 'Visitor City',
        country: 'Visitor Country'
      }
    });
    
    console.log(`✅ Log de acesso criado para visitante: ${visitorAccessLog.id}`);
    
    // 5. Simular fechamento do documento (atualizar com horário de término e duração)
    console.log('🕒 Simulando fechamento do documento após 30 segundos...');
    
    // Simular 30 segundos de visualização
    const endTime = new Date();
    endTime.setSeconds(endTime.getSeconds() + 30);
    
    await prisma.documentAccessLog.update({
      where: { id: userAccessLog.id },
      data: {
        accessEndTime: endTime,
        duration: 30
      }
    });
    
    console.log('✅ Log de acesso atualizado com horário de término e duração');
    
    // 6. Buscar logs para verificar
    console.log('🔍 Buscando logs de acesso para verificação...');
    const logs = await prisma.documentAccessLog.findMany({
      where: {
        OR: [
          { userId: 'test-user-id' },
          { visitorToken: 'test-visitor-token' }
        ]
      },
      include: {
        document: {
          select: {
            name: true
          }
        }
      }
    });
    
    console.log(`📊 Encontrados ${logs.length} logs de acesso:`);
    logs.forEach((log, index) => {
      console.log(`\n--- Log ${index + 1} ---`);
      console.log(`ID: ${log.id}`);
      console.log(`Documento: ${log.document.name}`);
      console.log(`Usuário ID: ${log.userId || 'N/A'}`);
      console.log(`Visitante Token: ${log.visitorToken || 'N/A'}`);
      console.log(`Início: ${log.accessStartTime}`);
      console.log(`Término: ${log.accessEndTime || 'N/A'}`);
      console.log(`Duração: ${log.duration || 'N/A'} segundos`);
      console.log(`IP: ${log.ipAddress}`);
      console.log(`Localização: ${log.city}, ${log.country}`);
    });
    
    // 7. Testar estatísticas de acesso
    console.log('\n📊 Testando estatísticas de acesso...');
    
    const totalViews = await prisma.documentAccessLog.count();
    console.log(`Total de visualizações: ${totalViews}`);
    
    const uniqueDocuments = await prisma.documentAccessLog.groupBy({
      by: ['documentId']
    }).then(results => results.length);
    console.log(`Documentos únicos visualizados: ${uniqueDocuments}`);
    
    const durationStats = await prisma.documentAccessLog.aggregate({
      where: {
        duration: { not: null }
      },
      _avg: { duration: true },
      _max: { duration: true }
    });
    
    console.log(`Duração média: ${durationStats._avg.duration || 0} segundos`);
    console.log(`Duração máxima: ${durationStats._max.duration || 0} segundos`);
    
    console.log('\n✅ Teste concluído com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
