// scripts/backup-data.ts
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

console.log("Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log("Service Key Available:", !!process.env.SUPABASE_SERVICE_ROLE_KEY);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

async function backupData() {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const backupDir = path.join(process.cwd(), 'backup', new Date().toISOString().split('T')[0]);
  
  // Create backup directory
  fs.mkdirSync(backupDir, { recursive: true });
  
  // Get all tables using direct SQL query
  const { data: tables, error: tablesError } = await supabase
    .from('_tables')  // This is a Supabase system view that shows all tables
    .select('name')
    .eq('schema', 'public')
    .not('name', 'like', 'pg_%')
    .not('name', 'like', '_prisma_%');

  if (tablesError) {
    console.error('Error fetching tables:', tablesError);
    
    // Alternative approach - try to list some common tables directly
    console.log('Falling back to manual table list...');
    const manualTables = [
      'users', 'profiles', 'products', 'orders', 'appointments', 
      'customers', 'media', 'services', 'bookings', 'settings',
      'locations', 'categories', 'pages', 'posts'
    ];
    
    console.log(`Will try to backup these tables: ${manualTables.join(', ')}`);
    
    // Backup each manually specified table
    for (const tableName of manualTables) {
      console.log(`Attempting to backup table: ${tableName}`);
      
      // Check if table exists
      const { error: checkError } = await supabase
        .from(tableName)
        .select('count')
        .limit(1);
        
      if (checkError) {
        console.log(`Table ${tableName} does not exist or is not accessible, skipping.`);
        continue;
      }
      
      // Get all data from the table
      const { data, error } = await supabase
        .from(tableName)
        .select('*');
        
      if (error) {
        console.error(`Error fetching data from ${tableName}:`, error);
        continue;
      }
      
      // Write data to file
      const filePath = path.join(backupDir, `${tableName}.json`);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      
      console.log(`✓ Backed up ${data.length} rows from ${tableName}`);
    }
    
    console.log(`Backup completed. Files saved to ${backupDir}`);
    return;
  }
  
  if (!tables || tables.length === 0) {
    console.error('No tables found.');
    return;
  }
  
  console.log(`Found ${tables.length} tables to backup.`);
  
  // Backup each table
  for (const table of tables) {
    const tableName = table.name;
    
    // Skip system tables
    if (tableName.startsWith('_') || tableName === 'schema_migrations') {
      continue;
    }
    
    console.log(`Backing up table: ${tableName}`);
    
    // Get all data from the table
    const { data, error } = await supabase
      .from(tableName)
      .select('*');
      
    if (error) {
      console.error(`Error fetching data from ${tableName}:`, error);
      continue;
    }
    
    // Write data to file
    const filePath = path.join(backupDir, `${tableName}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    
    console.log(`✓ Backed up ${data.length} rows from ${tableName}`);
  }
  
  console.log(`Backup completed. Files saved to ${backupDir}`);
}

// Run the backup
backupData().catch(console.error);