// Script to apply the registration fields migration
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Reading migration SQL file...');
    const migrationPath = path.join(__dirname, '../prisma/migrations/registration_fields_migration.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('Applying migration...');
    // Execute the raw SQL query
    await prisma.$executeRawUnsafe(sql);
    
    console.log('Migration applied successfully!');
    
    // Update the Prisma schema to reflect the changes
    console.log('Updating Prisma schema...');
    const schemaPath = path.join(__dirname, '../prisma/schema.prisma');
    let schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Find the User model in the schema
    const userModelRegex = /model User \{[\s\S]*?\}/;
    const userModel = schema.match(userModelRegex)[0];
    
    // Check if fields already exist
    if (!userModel.includes('companyName')) {
      // Add the new fields before the closing brace of the User model
      const updatedUserModel = userModel.replace(
        /(\s*\}\s*)$/,
        '  companyName      String?\n  teamSize        String?\n  industry        String?\n  customIndustry  String?\n$1'
      );
      
      // Replace the old User model with the updated one
      schema = schema.replace(userModelRegex, updatedUserModel);
      
      // Write the updated schema back to the file
      fs.writeFileSync(schemaPath, schema);
      console.log('Prisma schema updated successfully!');
    } else {
      console.log('Fields already exist in the schema, no update needed.');
    }
    
    console.log('Migration process completed successfully!');
  } catch (error) {
    console.error('Error applying migration:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
