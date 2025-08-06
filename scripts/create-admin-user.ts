import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';
import { slugify } from '../src/lib/utils';

// Configuração do usuário administrador
const adminUser = {
  name: 'Admin',
  email: 'admin@xase.com', // Altere para o email desejado
  password: 'Admin@123!', // Altere para uma senha forte
  role: 'superadmin', // Role especial para gerenciamento de assinaturas
  plan: 'premium',
  isPremium: true
};

async function createAdminUser() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Verificando se o usuário administrador já existe...');
    
    // Verificar se o usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: adminUser.email }
    });
    
    if (existingUser) {
      console.log('Usuário administrador já existe. Atualizando permissões...');
      
      // Atualizar o usuário existente para ter permissões de administrador
      await prisma.user.update({
        where: { email: adminUser.email },
        data: {
          role: adminUser.role,
          plan: adminUser.plan,
          isPremium: adminUser.isPremium
        }
      });
      
      console.log('Permissões de administrador atualizadas com sucesso!');
      return;
    }
    
    // Criar slug a partir do nome
    const slug = slugify(adminUser.name);
    
    // Hash da senha
    const hashedPassword = await hash(adminUser.password, 10);
    
    // Criar o usuário administrador
    const user = await prisma.user.create({
      data: {
        name: adminUser.name,
        email: adminUser.email,
        password: hashedPassword,
        slug,
        role: adminUser.role,
        plan: adminUser.plan,
        isPremium: adminUser.isPremium,
        emailVerified: new Date() // Marcar email como verificado
      }
    });
    
    console.log('Usuário administrador criado com sucesso!');
    console.log('Email:', adminUser.email);
    console.log('Senha:', adminUser.password);
    console.log('Role:', adminUser.role);
    console.log('Plano:', adminUser.plan);
    
  } catch (error) {
    console.error('Erro ao criar usuário administrador:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar a função
createAdminUser();
