const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function testPrisma() {
  try {
    const result = await prisma.$queryRaw`SELECT NOW()`;
    console.log('Connected via Prisma! Database time:', result[0]);
  } catch (err) {
    console.error('Prisma connection error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

testPrisma(); 