import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function assignBusinessRoleToActiveSubscribers() {
  console.log('Starting to assign BUSINESS role to all users with active subscriptions...');

  try {
    // 1. Find all users with active subscriptions
    const activeSubscriptions = await prisma.subscription.findMany({
      where: {
        status: 'active'
      },
      include: {
        user: true
      }
    });

    console.log(`Found ${activeSubscriptions.length} active subscriptions`);

    // 2. Process each user with active subscription
    for (const subscription of activeSubscriptions) {
      const user = subscription.user;
      console.log(`Processing user: ${user.email} (${user.id})`);

      // 3. Check if user already has BUSINESS role
      const existingRole = await prisma.userRole.findFirst({
        where: {
          userId: user.id,
          role: 'BUSINESS'
        }
      });

      if (existingRole) {
        console.log(`User ${user.email} already has BUSINESS role`);
        continue;
      }

      // 4. Check if user has a tenant
      let tenantId = user.tenantId;
      
      // 5. If user doesn't have a tenant, create one
      if (!tenantId) {
        console.log(`User ${user.email} doesn't have a tenant, creating one...`);
        const newTenant = await prisma.tenant.create({
          data: {
            name: `${user.name}'s Tenant`,
            slug: `${user.slug || user.email.split('@')[0]}-tenant`
          }
        });
        
        // Update user with new tenant ID
        await prisma.user.update({
          where: { id: user.id },
          data: { tenantId: newTenant.id }
        });
        
        tenantId = newTenant.id;
        console.log(`Created new tenant ${tenantId} for user ${user.id}`);
      }
      
      // 6. Create BUSINESS role for user
      await prisma.userRole.create({
        data: {
          userId: user.id,
          role: 'BUSINESS',
          tenantId: tenantId
        }
      });
      
      console.log(`✅ Assigned BUSINESS role to user ${user.email} with tenant ${tenantId}`);
    }

    console.log('Finished assigning BUSINESS roles to all users with active subscriptions');
  } catch (error) {
    console.error('Error assigning BUSINESS roles:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
assignBusinessRoleToActiveSubscribers();
