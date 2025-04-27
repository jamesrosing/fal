import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { format } from 'prettier';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

async function generateTypes() {
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables must be set');
    process.exit(1);
  }

  console.log('Connecting to Supabase...');
  
  // Create a Supabase client with admin privileges
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Fetch tables information...
  // const { data: tables, error: tablesError } = await supabase // Use default client
  //   .from('information_schema.tables') // Query directly
  //   .select('*')
  //   .eq('table_schema', 'public');
  const { data: tables, error: tablesError } = await supabase.rpc('get_public_tables');
  
  if (tablesError) {
    console.error('Error fetching tables:', tablesError);
    return;
  }
  
  if (!tables || tables.length === 0) {
    console.error('No tables found in the database');
    return;
  }
  
  console.log(`Found ${tables.length} tables in the database`);
  
  // Build the Database interface
  let typesContent = `export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
`;

  // Process each table
  for (const table of tables) {
    const tableName = table.table_name;
    
    // Skip system tables
    if (tableName.startsWith('_') || tableName === 'schema_migrations') {
      continue;
    }
    
    console.log(`Processing table: ${tableName}`);
    
    // Get columns for this table
    // const { data: columns, error: columnsError } = await supabase // Use default client
    //   .from('information_schema.columns') // Query directly
    //   .select('*')
    //   .eq('table_schema', 'public')
    //   .eq('table_name', tableName);
    const { data: columns, error: columnsError } = await supabase.rpc('get_table_columns', { p_table_name: tableName });
      
    if (columnsError) {
      console.error(`Error fetching columns for ${tableName}:`, columnsError);
      continue;
    }
    
    typesContent += `      ${tableName}: {\n`;
    typesContent += `        Row: {\n`;
    
    // Add columns
    for (const column of columns) {
      const columnName = column.column_name;
      const isNullable = column.is_nullable === 'YES';
      
      // Map PostgreSQL types to TypeScript types
      let tsType;
      switch (column.data_type.toLowerCase()) {
        case 'integer':
        case 'bigint':
        case 'smallint':
        case 'decimal':
        case 'numeric':
        case 'real':
        case 'double precision':
          tsType = 'number';
          break;
        case 'boolean':
          tsType = 'boolean';
          break;
        case 'json':
        case 'jsonb':
          tsType = 'Json';
          break;
        case 'timestamp with time zone':
        case 'timestamp without time zone':
        case 'date':
        case 'time':
          tsType = 'string';
          break;
        case 'uuid':
        case 'text':
        case 'character varying':
        case 'character':
        default:
          tsType = 'string';
          break;
      }
      
      typesContent += `          ${columnName}: ${tsType}${isNullable ? ' | null' : ''}\n`;
    }
    
    typesContent += `        }\n`;
    
    // Add Insert type (allows optional insertion of generated columns)
    typesContent += `        Insert: {\n`;
    for (const column of columns) {
      const columnName = column.column_name;
      const isNullable = column.is_nullable === 'YES';
      const hasDefault = column.column_default !== null;
      const isGenerated = column.is_identity === 'YES' || 
        column.column_default?.includes('gen_random_uuid()') ||
        column.column_default?.includes('now()');
      
      // Map PostgreSQL types to TypeScript types
      let tsType;
      switch (column.data_type.toLowerCase()) {
        case 'integer':
        case 'bigint':
        case 'smallint':
        case 'decimal':
        case 'numeric':
        case 'real':
        case 'double precision':
          tsType = 'number';
          break;
        case 'boolean':
          tsType = 'boolean';
          break;
        case 'json':
        case 'jsonb':
          tsType = 'Json';
          break;
        case 'timestamp with time zone':
        case 'timestamp without time zone':
        case 'date':
        case 'time':
          tsType = 'string';
          break;
        case 'uuid':
        case 'text':
        case 'character varying':
        case 'character':
        default:
          tsType = 'string';
          break;
      }
      
      // Optional if it has a default or is nullable
      const optional = isGenerated || hasDefault || isNullable ? '?' : '';
      
      typesContent += `          ${columnName}${optional}: ${tsType}${isNullable ? ' | null' : ''}\n`;
    }
    
    typesContent += `        }\n`;
    
    // Add Update type (allows optional update of any column)
    typesContent += `        Update: {\n`;
    for (const column of columns) {
      const columnName = column.column_name;
      const isNullable = column.is_nullable === 'YES';
      
      // Map PostgreSQL types to TypeScript types
      let tsType;
      switch (column.data_type.toLowerCase()) {
        case 'integer':
        case 'bigint':
        case 'smallint':
        case 'decimal':
        case 'numeric':
        case 'real':
        case 'double precision':
          tsType = 'number';
          break;
        case 'boolean':
          tsType = 'boolean';
          break;
        case 'json':
        case 'jsonb':
          tsType = 'Json';
          break;
        case 'timestamp with time zone':
        case 'timestamp without time zone':
        case 'date':
        case 'time':
          tsType = 'string';
          break;
        case 'uuid':
        case 'text':
        case 'character varying':
        case 'character':
        default:
          tsType = 'string';
          break;
      }
      
      typesContent += `          ${columnName}?: ${tsType}${isNullable ? ' | null' : ''}\n`;
    }
    
    typesContent += `        }\n`;
    typesContent += `      }\n`;
  }
  
  // Close Database interface
  typesContent += `    }\n    Views: {\n      [_ in never]: never\n    }\n    Functions: {\n      [_ in never]: never\n    }\n    Enums: {\n      [_ in never]: never\n    }\n  }\n}\n`;
  
  try {
    // Format the output
    console.log('Formatting generated types...');
    const formattedTypes = await format(typesContent, { 
      parser: 'typescript',
      printWidth: 100,
      tabWidth: 2,
      singleQuote: true,
      trailingComma: 'es5',
    });
    
    // Write to file
    const outputPath = path.join(process.cwd(), 'lib', 'database.types.ts');
    fs.writeFileSync(outputPath, formattedTypes);
    
    console.log(`Database types written to ${outputPath}`);
  } catch (error) {
    console.error('Error formatting or writing types:', error);
  }
}

// Run the generation
generateTypes().catch(console.error); 