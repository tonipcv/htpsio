/**
 * Test script for document access logging system
 * 
 * This script helps verify the end-to-end functionality of the document access logging system
 * by checking database tables, API endpoints, and data integrity.
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Testing Document Access Logging System');
  console.log('----------------------------------------');

  try {
    // 1. Check if the document_access_logs table exists
    console.log('\n1. Checking if document_access_logs table exists...');
    const tableExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'document_access_logs'
      );
    `;
    
    if (tableExists[0].exists) {
      console.log('✅ document_access_logs table exists');
    } else {
      console.log('❌ document_access_logs table does not exist');
      console.log('   Run the migration script: node scripts/run-document-access-logs-migration.js');
      return;
    }

    // 2. Check table structure
    console.log('\n2. Checking document_access_logs table structure...');
    const columns = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'document_access_logs';
    `;
    
    const requiredColumns = [
      'id', 'document_id', 'user_id', 'visitor_token', 
      'access_start_time', 'access_end_time', 'duration',
      'user_agent', 'ip_address', 'city', 'country'
    ];
    
    const missingColumns = requiredColumns.filter(
      col => !columns.some(c => c.column_name === col)
    );
    
    if (missingColumns.length === 0) {
      console.log('✅ All required columns exist');
      console.table(columns.map(c => ({ 
        column: c.column_name, 
        type: c.data_type 
      })));
    } else {
      console.log('❌ Missing columns:', missingColumns);
    }

    // 3. Check for existing logs
    console.log('\n3. Checking for existing document access logs...');
    // Use raw query to count logs since the table name might not match Prisma model name
    const logCountResult = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM public.document_access_logs
    `;
    const logCount = Number(logCountResult[0].count);
    console.log(`Found ${logCount} document access logs`);
    
    if (logCount > 0) {
      // Use raw query to get recent logs with document and user information
      const recentLogs = await prisma.$queryRaw`
        SELECT 
          dal.*, 
          d.name as document_name,
          u.name as user_name,
          u.email as user_email
        FROM public.document_access_logs dal
        LEFT JOIN "Document" d ON dal.document_id = d.id
        LEFT JOIN users u ON dal.user_id = u.id
        ORDER BY dal.access_start_time DESC
        LIMIT 5
      `;
      
      console.log('\nMost recent logs:');
      recentLogs.forEach(log => {
        console.log(`- Document: ${log.document_name || 'Unknown'}`);
        console.log(`  User: ${log.user_name || 'Anonymous'} (${log.user_id || log.visitor_token})`);
        console.log(`  Time: ${log.access_start_time}`);
        console.log(`  Duration: ${log.duration || 'N/A'} seconds`);
        console.log(`  Location: ${log.city || ''} ${log.country || ''}`);
        console.log('---');
      });
    } else {
      console.log('ℹ️ No logs found. Try viewing some documents in the application first.');
    }

    // 4. Test API endpoint (requires authentication, so just checking existence)
    console.log('\n4. Checking API endpoints...');
    const fs = require('fs');
    const apiEndpoints = [
      '/api/analytics/document-access/route.ts',
      '/api/analytics/document-access/list/route.ts'
    ];
    
    for (const endpoint of apiEndpoints) {
      const path = `./src/app${endpoint}`;
      if (fs.existsSync(path)) {
        console.log(`✅ API endpoint exists: ${endpoint}`);
      } else {
        console.log(`❌ API endpoint missing: ${endpoint}`);
      }
    }

    // 5. Check React hook
    console.log('\n5. Checking React hook implementation...');
    const hookPath = './src/hooks/useDocumentTracking.ts';
    if (fs.existsSync(hookPath)) {
      console.log('✅ useDocumentTracking hook exists');
    } else {
      console.log('❌ useDocumentTracking hook is missing');
    }

    console.log('\n✅ Test completed');
    console.log('\nNext steps:');
    console.log('1. Run the SQL migration if not already done: node scripts/run-document-access-logs-migration.js');
    console.log('2. View documents in the application to generate logs');
    console.log('3. Check the admin analytics page at /admin/analytics');

  } catch (error) {
    console.error('Error during testing:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
