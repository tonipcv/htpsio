import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hash } from "bcrypt";

// Função para criar slug a partir do nome (simplificada)
function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

// Configuração do usuário administrador
const adminUser = {
  name: 'Admin',
  email: 'admin@xase.com', // Altere para o email desejado
  password: 'Admin@123!', // Altere para uma senha forte
  role: 'superadmin', // Role especial para gerenciamento de assinaturas
  plan: 'premium',
  isPremium: true
};

export async function GET() {
  try {
    // Verificar se o usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: adminUser.email }
    });
    
    if (existingUser) {
      console.log('Usuário administrador já existe. Atualizando permissões...');
      
      // Atualizar o usuário existente para ter permissões de administrador
      const updatedUser = await prisma.user.update({
        where: { email: adminUser.email },
        data: {
          plan: adminUser.plan,
          isPremium: adminUser.isPremium
        }
      });
      
      // Verificar se o usuário já tem o papel de SUPER_ADMIN
      const existingRole = await prisma.userRole.findFirst({
        where: {
          userId: updatedUser.id,
          role: 'SUPER_ADMIN'
        }
      });
      
      // Obter ou criar tenant para o admin se não existir
      let tenantId = updatedUser.tenantId;
      if (!tenantId) {
        // Criar tenant para o admin se não existir
        const tenant = await prisma.tenant.create({
          data: {
            name: `${updatedUser.name}'s Organization`,
            slug: slugify(`${updatedUser.name}-org`)
          }
        });
        tenantId = tenant.id;
        
        // Atualizar usuário com o tenantId
        await prisma.user.update({
          where: { id: updatedUser.id },
          data: { tenantId: tenant.id }
        });
      }
      
      // Se não tiver, criar o papel
      if (!existingRole) {
        await prisma.userRole.create({
          data: {
            userId: updatedUser.id,
            role: 'SUPER_ADMIN',
            tenantId: tenantId
          }
        });
      }
      
      // Buscar o papel do usuário para incluir na resposta
      const userRole = await prisma.userRole.findFirst({
        where: { userId: updatedUser.id },
        orderBy: { createdAt: 'desc' }
      });
      
      return NextResponse.json({ 
        success: true, 
        message: 'Permissões de administrador atualizadas com sucesso!',
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          primaryRole: userRole?.role || 'SUPER_ADMIN',
          plan: updatedUser.plan
        }
      });
    }
    
    // Criar slug a partir do nome
    const slug = slugify(adminUser.name);
    
    // Hash da senha
    const hashedPassword = await hash(adminUser.password, 10);
    
    // Criar tenant para o admin
    const tenant = await prisma.tenant.create({
      data: {
        name: `${adminUser.name}'s Organization`,
        slug: slugify(`${adminUser.name}-org`)
      }
    });
    
    // Criar o usuário administrador
    const user = await prisma.user.create({
      data: {
        name: adminUser.name,
        email: adminUser.email,
        password: hashedPassword,
        slug,
        plan: adminUser.plan,
        isPremium: adminUser.isPremium,
        emailVerified: new Date(), // Marcar email como verificado
        tenantId: tenant.id // Associar ao tenant criado
      }
    });
    
    // Criar papel de SUPER_ADMIN para o usuário
    await prisma.userRole.create({
      data: {
        userId: user.id,
        role: 'SUPER_ADMIN',
        tenantId: tenant.id
      }
    });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Usuário administrador criado com sucesso!',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        primaryRole: 'SUPER_ADMIN', // Papel criado acima
        plan: user.plan,
        credentials: {
          email: adminUser.email,
          password: adminUser.password // Exibindo a senha apenas na criação
        }
      }
    });
    
  } catch (error) {
    console.error('Erro ao criar usuário administrador:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Erro ao criar usuário administrador', 
      error: (error as Error).message 
    }, { status: 500 });
  }
}
