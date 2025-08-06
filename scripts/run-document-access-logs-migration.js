const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

async function runDocumentAccessLogsMigration() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Starting Document Access Logs SQL migration...');
    
    // Read the SQL file
    const sqlFilePath = path.join(__dirname, '../migrations/document_access_logs.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Execute the SQL migration
    console.log('Executing SQL migration for document_access_logs table...');
    await prisma.$executeRawUnsafe(sqlContent);
    
    console.log('Document Access Logs migration completed successfully!');
    
    // Generate Prisma client to reflect the changes
    console.log('Generating Prisma client...');
    const { execSync } = require('child_process');
    execSync('npx prisma generate', { stdio: 'inherit' });
    
    console.log('Prisma client generated successfully!');
    
    // Add the model to schema.prisma if it doesn't exist
    console.log('Checking Prisma schema for DocumentAccessLog model...');
    const schemaPath = path.join(__dirname, '../prisma/schema.prisma');
    let schemaContent = fs.readFileSync(schemaPath, 'utf8');
    
    if (!schemaContent.includes('model DocumentAccessLog')) {
      console.log('Adding DocumentAccessLog model to Prisma schema...');
      
      // Define the model to add
      const modelDefinition = `
model DocumentAccessLog {
  id              String   @id @default(uuid())
  documentId      String
  userId          String?  // Registered user ID if available
  visitorToken    String?  // Anonymous visitor token if userId not available
  accessStartTime DateTime @default(now())
  accessEndTime   DateTime? // When document was closed/tab changed
  duration        Int?     // Duration in seconds
  userAgent       String   // Complete browser user agent
  ipAddress       String   // Visitor's IP address
  city            String?  // Approximate location - city
  country         String?  // Approximate location - country
  document        Document @relation(fields: [documentId], references: [id])
  user            User?    @relation(fields: [userId], references: [id])
  createdAt       DateTime @default(now())

  @@index([documentId])
  @@index([userId])
  @@index([visitorToken])
  @@index([accessStartTime])
}
`;
      
      // Add the model to the schema
      schemaContent += '\n' + modelDefinition;
      fs.writeFileSync(schemaPath, schemaContent);
      
      // Update User and Document models to include the relation
      console.log('Updating User and Document models with relations...');
      
      // This is a simple string replacement and might need manual verification
      schemaContent = schemaContent.replace(
        'model User {',
        'model User {'
      );
      
      schemaContent = schemaContent.replace(
        'documentAccess  DocumentAccess[]',
        'documentAccess  DocumentAccess[]\n  documentAccessLogs DocumentAccessLog[]'
      );
      
      schemaContent = schemaContent.replace(
        'model Document {',
        'model Document {'
      );
      
      schemaContent = schemaContent.replace(
        'documentAccess  DocumentAccess[]',
        'documentAccess  DocumentAccess[]\n  accessLogs   DocumentAccessLog[]'
      );
      
      fs.writeFileSync(schemaPath, schemaContent);
      
      // Generate Prisma client again after schema changes
      console.log('Regenerating Prisma client with updated schema...');
      execSync('npx prisma generate', { stdio: 'inherit' });
      
      console.log('Prisma schema updated and client regenerated successfully!');
    } else {
      console.log('DocumentAccessLog model already exists in Prisma schema.');
    }
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

runDocumentAccessLogsMigration();
