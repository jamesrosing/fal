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
  
  // Format the output
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
}

// Run the generation
generateTypes().catch(console.error);
```

### 2. Create Database Migration Script

Implement a script for managing database schema migrations:

```typescript
// scripts/migrate.ts
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as glob from 'glob';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

async function runMigrations() {
  // Create a Supabase client with admin privileges
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  // Get current migration version
  const { data: versionData, error: versionError } = await supabase
    .from('schema_migrations')
    .select('version')
    .order('version', { ascending: false })
    .limit(1);
    
  if (versionError && versionError.code !== 'PGRST116') { // PGRST116 is "not found"
    console.error('Error fetching migration version:', versionError);
    return;
  }
  
  // If migration table doesn't exist, create it
  if (versionError?.code === 'PGRST116') {
    const { error: createTableError } = await supabase.rpc('create_migration_table');
    if (createTableError) {
      console.error('Error creating migration table:', createTableError);
      return;
    }
  }
  
  const currentVersion = versionData && versionData.length > 0 ? versionData[0].version : 0;
  console.log(`Current database version: ${currentVersion}`);
  
  // Get migration files
  const migrationsDir = path.join(process.cwd(), 'migrations');
  if (!fs.existsSync(migrationsDir)) {
    fs.mkdirSync(migrationsDir, { recursive: true });
    console.log(`Created migrations directory at ${migrationsDir}`);
    return;
  }
  
  const migrationFiles = glob.sync('*.sql', { cwd: migrationsDir })
    .map(file => {
      const versionMatch = file.match(/^(\d+)_/);
      if (!versionMatch) return null;
      
      return {
        version: parseInt(versionMatch[1], 10),
        path: path.join(migrationsDir, file),
        filename: file,
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.version - b.version);
  
  // Apply pending migrations
  const pendingMigrations = migrationFiles.filter(migration => migration.version > currentVersion);
  
  if (pendingMigrations.length === 0) {
    console.log('No pending migrations to apply');
    return;
  }
  
  console.log(`Found ${pendingMigrations.length} pending migrations`);
  
  for (const migration of pendingMigrations) {
    console.log(`Applying migration ${migration.filename}`);
    
    const sql = fs.readFileSync(migration.path, 'utf8');
    const { error } = await supabase.rpc('run_sql', { sql });
    
    if (error) {
      console.error(`Error applying migration ${migration.filename}:`, error);
      return;
    }
    
    // Update schema version
    const { error: updateError } = await supabase
      .from('schema_migrations')
      .insert({ version: migration.version });
      
    if (updateError) {
      console.error(`Error updating schema version for ${migration.filename}:`, updateError);
      return;
    }
    
    console.log(`Successfully applied migration ${migration.filename}`);
  }
  
  console.log('All migrations applied successfully');
}

// Run migrations
runMigrations().catch(console.error);
```

### 3. Create Database Schema Validation Script

Implement a script that validates the actual database schema against expected schema:

```typescript
// scripts/validate-schema.ts
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

type TableDefinition = {
  name: string;
  columns: {
    name: string;
    type: string;
    isNullable: boolean;
    hasDefault: boolean;
  }[];
  indexes: {
    name: string;
    columns: string[];
    isUnique: boolean;
  }[];
  foreignKeys: {
    column: string;
    referencedTable: string;
    referencedColumn: string;
  }[];
};

async function validateSchema() {
  // Create a Supabase client with admin privileges
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  // Get expected schema from schema.json
  const schemaPath = path.join(process.cwd(), 'schema.json');
  if (!fs.existsSync(schemaPath)) {
    console.error('Schema definition file schema.json not found');
    return;
  }
  
  const expectedSchema: TableDefinition[] = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
  
  // Get actual schema from database
  const actualSchema: TableDefinition[] = [];
  
  // Get all tables
  const { data: tables, error: tablesError } = await supabase
    .from('information_schema.tables')
    .select('*')
    .eq('table_schema', 'public');
    
  if (tablesError) {
    console.error('Error fetching tables:', tablesError);
    return;
  }
  
  for (const table of tables) {
    const tableName = table.table_name;
    
    // Skip system tables
    if (tableName.startsWith('_') || tableName === 'schema_migrations') {
      continue;
    }
    
    const tableDefinition: TableDefinition = {
      name: tableName,
      columns: [],
      indexes: [],
      foreignKeys: [],
    };
    
    // Get columns
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('*')
      .eq('table_schema', 'public')
      .eq('table_name', tableName);
      
    if (columnsError) {
      console.error(`Error fetching columns for ${tableName}:`, columnsError);
      continue;
    }
    
    for (const column of columns) {
      tableDefinition.columns.push({
        name: column.column_name,
        type: column.data_type,
        isNullable: column.is_nullable === 'YES',
        hasDefault: column.column_default !== null,
      });
    }
    
    // Get indexes
    const { data: indexes, error: indexesError } = await supabase
      .from('pg_indexes')
      .select('*')
      .eq('schemaname', 'public')
      .eq('tablename', tableName);
      
    if (indexesError) {
      console.error(`Error fetching indexes for ${tableName}:`, indexesError);
    } else if (indexes) {
      for (const index of indexes) {
        // Extract column names from index definition
        const columnMatch = index.indexdef.match(/\(([^)]+)\)/);
        const columns = columnMatch 
          ? columnMatch[1].split(',').map(col => col.trim().replace(/['"]/g, ''))
          : [];
          
        tableDefinition.indexes.push({
          name: index.indexname,
          columns,
          isUnique: index.indexdef.includes('UNIQUE'),
        });
      }
    }
    
    // Get foreign keys
    const { data: foreignKeys, error: foreignKeysError } = await supabase
      .rpc('get_foreign_keys', { table_name: tableName });
      
    if (foreignKeysError) {
      console.error(`Error fetching foreign keys for ${tableName}:`, foreignKeysError);
    } else if (foreignKeys) {
      for (const fk of foreignKeys) {
        tableDefinition.foreignKeys.push({
          column: fk.column_name,
          referencedTable: fk.referenced_table,
          referencedColumn: fk.referenced_column,
        });
      }
    }
    
    actualSchema.push(tableDefinition);
  }
  
  // Compare expected vs actual schema
  const missingTables = expectedSchema
    .filter(expected => !actualSchema.some(actual => actual.name === expected.name))
    .map(table => table.name);
    
  const extraTables = actualSchema
    .filter(actual => !expectedSchema.some(expected => expected.name === actual.name))
    .map(table => table.name);
    
  const tableDiscrepancies: Record<string, {
    missingColumns: string[];
    extraColumns: string[];
    typeDiscrepancies: { column: string, expected: string, actual: string }[];
    missingIndexes: string[];
    missingForeignKeys: { column: string, ref: string }[];
  }> = {};
  
  // Check each expected table that exists in the actual schema
  for (const expectedTable of expectedSchema) {
    if (missingTables.includes(expectedTable.name)) continue;
    
    const actualTable = actualSchema.find(t => t.name === expectedTable.name);
    if (!actualTable) continue;
    
    const tableDiff = {
      missingColumns: expectedTable.columns
        .filter(expected => !actualTable.columns.some(actual => actual.name === expected.name))
        .map(col => col.name),
        
      extraColumns: actualTable.columns
        .filter(actual => !expectedTable.columns.some(expected => expected.name === actual.name))
        .map(col => col.name),
        
      typeDiscrepancies: expectedTable.columns
        .filter(expected => {
          const actualCol = actualTable.columns.find(actual => actual.name === expected.name);
          return actualCol && actualCol.type !== expected.type;
        })
        .map(expected => {
          const actualCol = actualTable.columns.find(actual => actual.name === expected.name)!;
          return {
            column: expected.name,
            expected: expected.type,
            actual: actualCol.type,
          };
        }),
        
      missingIndexes: expectedTable.indexes
        .filter(expected => !actualTable.indexes.some(actual => 
          actual.name === expected.name || 
          (actual.isUnique === expected.isUnique &&
           expected.columns.every(col => actual.columns.includes(col)))
        ))
        .map(idx => idx.name),
        
      missingForeignKeys: expectedTable.foreignKeys
        .filter(expected => !actualTable.foreignKeys.some(actual => 
          actual.column === expected.column && 
          actual.referencedTable === expected.referencedTable &&
          actual.referencedColumn === expected.referencedColumn
        ))
        .map(fk => ({ 
          column: fk.column, 
          ref: `${fk.referencedTable}.${fk.referencedColumn}` 
        })),
    };
    
    if (tableDiff.missingColumns.length > 0 ||
        tableDiff.extraColumns.length > 0 ||
        tableDiff.typeDiscrepancies.length > 0 ||
        tableDiff.missingIndexes.length > 0 ||
        tableDiff.missingForeignKeys.length > 0) {
      tableDiscrepancies[expectedTable.name] = tableDiff;
    }
  }
  
  // Generate report
  const report = {
    missingTables,
    extraTables,
    tableDiscrepancies,
  };
  
  // Save report to file
  const reportPath = path.join(process.cwd(), 'schema-validation-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  // Log summary
  console.log('Schema validation complete');
  console.log(`Missing tables: ${missingTables.length}`);
  console.log(`Extra tables: ${extraTables.length}`);
  console.log(`Tables with discrepancies: ${Object.keys(tableDiscrep# Database Schema Optimization

## Current Issues

The database schema in the project has several issues:

1. **Incomplete Type Definitions**: The `database.types.ts` file only contains definitions for `team_members` table, while the application uses many more tables.

2. **Inconsistent Type Usage**: Some parts of the codebase define types directly in the files where they're used, leading to potential inconsistencies.

3. **Missing Database Relationships**: The database schema doesn't clearly define all relationships between tables.

4. **No Formal Schema Migration Strategy**: There's no clear approach for managing schema changes over time.

## Proposed Solution

### 1. Generate Complete Database Types

Create a script that automatically generates TypeScript type definitions from the Supabase database schema:

```typescript
// scripts/generate-types.ts
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { format } from 'prettier';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

async function generateTypes() {
  // Create a Supabase client with admin privileges
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  // Get database definition
  const { data: tables, error: tablesError } = await supabase
    .from('information_schema.tables')
    .select('*')
    .eq('table_schema', 'public');
    
  if (tablesError) {
    console.error('Error fetching tables:', tablesError);
    return;
  }
  
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
    
    // Get columns for this table
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('*')
      .eq('table_schema', 'public')
      .eq('table_name', tableName);
      
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