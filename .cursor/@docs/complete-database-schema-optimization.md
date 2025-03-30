# Database Schema Optimization

## Current Issues

The database schema in the project has several issues:

1. **Incomplete Type Definitions**: The `database.types.ts` file only contains definitions for the `team_members` table, while the application uses many more tables.

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
  console.log(`Tables with discrepancies: ${Object.keys(tableDiscrepancies).length}`);
  console.log(`Full report written to ${reportPath}`);
  
  // Return validation result
  return {
    isValid: missingTables.length === 0 && 
             Object.keys(tableDiscrepancies).length === 0,
    report
  };
}

// Run validation
validateSchema().catch(console.error);
```

### 4. Schema Definition File

Create a schema definition file that represents the expected database structure based on the PRD requirements:

```json
// schema.json
[
  {
    "name": "team_members",
    "columns": [
      {
        "name": "id",
        "type": "uuid",
        "isNullable": false,
        "hasDefault": true
      },
      {
        "name": "name",
        "type": "character varying",
        "isNullable": false,
        "hasDefault": false
      },
      {
        "name": "title",
        "type": "character varying",
        "isNullable": true,
        "hasDefault": false
      },
      {
        "name": "role",
        "type": "character varying",
        "isNullable": false,
        "hasDefault": false
      },
      {
        "name": "image_url",
        "type": "character varying",
        "isNullable": true,
        "hasDefault": false
      },
      {
        "name": "description",
        "type": "text",
        "isNullable": true,
        "hasDefault": false
      },
      {
        "name": "order",
        "type": "integer",
        "isNullable": false,
        "hasDefault": false
      },
      {
        "name": "is_provider",
        "type": "boolean",
        "isNullable": false,
        "hasDefault": false
      },
      {
        "name": "created_at",
        "type": "timestamp with time zone",
        "isNullable": false,
        "hasDefault": true
      },
      {
        "name": "updated_at",
        "type": "timestamp with time zone",
        "isNullable": false,
        "hasDefault": true
      }
    ],
    "indexes": [
      {
        "name": "team_members_pkey",
        "columns": ["id"],
        "isUnique": true
      }
    ],
    "foreignKeys": []
  },
  {
    "name": "galleries",
    "columns": [
      {
        "name": "id",
        "type": "uuid",
        "isNullable": false,
        "hasDefault": true
      },
      {
        "name": "title",
        "type": "character varying",
        "isNullable": false,
        "hasDefault": false
      },
      {
        "name": "description",
        "type": "text",
        "isNullable": true,
        "hasDefault": false
      },
      {
        "name": "created_at",
        "type": "timestamp with time zone",
        "isNullable": false,
        "hasDefault": true
      }
    ],
    "indexes": [
      {
        "name": "galleries_pkey",
        "columns": ["id"],
        "isUnique": true
      }
    ],
    "foreignKeys": []
  },
  {
    "name": "albums",
    "columns": [
      {
        "name": "id",
        "type": "uuid",
        "isNullable": false,
        "hasDefault": true
      },
      {
        "name": "gallery_id",
        "type": "uuid",
        "isNullable": false,
        "hasDefault": false
      },
      {
        "name": "title",
        "type": "character varying",
        "isNullable": false,
        "hasDefault": false
      },
      {
        "name": "description",
        "type": "text",
        "isNullable": true,
        "hasDefault": false
      },
      {
        "name": "created_at",
        "type": "timestamp with time zone",
        "isNullable": false,
        "hasDefault": true
      },
      {
        "name": "order",
        "type": "integer",
        "isNullable": false,
        "hasDefault": true
      }
    ],
    "indexes": [
      {
        "name": "albums_pkey",
        "columns": ["id"],
        "isUnique": true
      }
    ],
    "foreignKeys": [
      {
        "column": "gallery_id",
        "referencedTable": "galleries",
        "referencedColumn": "id"
      }
    ]
  },
  {
    "name": "cases",
    "columns": [
      {
        "name": "id",
        "type": "uuid",
        "isNullable": false,
        "hasDefault": true
      },
      {
        "name": "album_id",
        "type": "uuid",
        "isNullable": false,
        "hasDefault": false
      },
      {
        "name": "title",
        "type": "character varying",
        "isNullable": false,
        "hasDefault": false
      },
      {
        "name": "description",
        "type": "text",
        "isNullable": true,
        "hasDefault": false
      },
      {
        "name": "metadata",
        "type": "jsonb",
        "isNullable": true,
        "hasDefault": true
      },
      {
        "name": "created_at",
        "type": "timestamp with time zone",
        "isNullable": false,
        "hasDefault": true
      }
    ],
    "indexes": [
      {
        "name": "cases_pkey",
        "columns": ["id"],
        "isUnique": true
      }
    ],
    "foreignKeys": [
      {
        "column": "album_id",
        "referencedTable": "albums",
        "referencedColumn": "id"
      }
    ]
  },
  {
    "name": "images",
    "columns": [
      {
        "name": "id",
        "type": "uuid",
        "isNullable": false,
        "hasDefault": true
      },
      {
        "name": "case_id",
        "type": "uuid",
        "isNullable": false,
        "hasDefault": false
      },
      {
        "name": "cloudinary_url",
        "type": "text",
        "isNullable": false,
        "hasDefault": false
      },
      {
        "name": "caption",
        "type": "text",
        "isNullable": true,
        "hasDefault": false
      },
      {
        "name": "tags",
        "type": "text[]",
        "isNullable": true,
        "hasDefault": true
      },
      {
        "name": "created_at",
        "type": "timestamp with time zone",
        "isNullable": false,
        "hasDefault": true
      },
      {
        "name": "display_order",
        "type": "integer",
        "isNullable": false,
        "hasDefault": true
      }
    ],
    "indexes": [
      {
        "name": "images_pkey",
        "columns": ["id"],
        "isUnique": true
      },
      {
        "name": "images_case_id_idx",
        "columns": ["case_id"],
        "isUnique": false
      }
    ],
    "foreignKeys": [
      {
        "column": "case_id",
        "referencedTable": "cases",
        "referencedColumn": "id"
      }
    ]
  },
  {
    "name": "article_categories",
    "columns": [
      {
        "name": "id",
        "type": "uuid",
        "isNullable": false,
        "hasDefault": true
      },
      {
        "name": "name",
        "type": "character varying",
        "isNullable": false,
        "hasDefault": false
      },
      {
        "name": "slug",
        "type": "character varying",
        "isNullable": false,
        "hasDefault": false
      },
      {
        "name": "description",
        "type": "text",
        "isNullable": true,
        "hasDefault": false
      },
      {
        "name": "order_position",
        "type": "integer",
        "isNullable": false,
        "hasDefault": false
      },
      {
        "name": "created_at",
        "type": "timestamp with time zone",
        "isNullable": false,
        "hasDefault": true
      },
      {
        "name": "updated_at",
        "type": "timestamp with time zone",
        "isNullable": false,
        "hasDefault": true
      }
    ],
    "indexes": [
      {
        "name": "article_categories_pkey",
        "columns": ["id"],
        "isUnique": true
      },
      {
        "name": "article_categories_slug_key",
        "columns": ["slug"],
        "isUnique": true
      }
    ],
    "foreignKeys": []
  },
  {
    "name": "articles",
    "columns": [
      {
        "name": "id",
        "type": "uuid",
        "isNullable": false,
        "hasDefault": true
      },
      {
        "name": "title",
        "type": "character varying",
        "isNullable": false,
        "hasDefault": false
      },
      {
        "name": "subtitle",
        "type": "character varying",
        "isNullable": true,
        "hasDefault": false
      },
      {
        "name": "slug",
        "type": "character varying",
        "isNullable": false,
        "hasDefault": false
      },
      {
        "name": "content",
        "type": "jsonb",
        "isNullable": false,
        "hasDefault": true
      },
      {
        "name": "excerpt",
        "type": "text",
        "isNullable": false,
        "hasDefault": false
      },
      {
        "name": "author_id",
        "type": "uuid",
        "isNullable": true,
        "hasDefault": false
      },
      {
        "name": "category_id",
        "type": "uuid",
        "isNullable": true,
        "hasDefault": false
      },
      {
        "name": "subcategory",
        "type": "character varying",
        "isNullable": true,
        "hasDefault": false
      },
      {
        "name": "status",
        "type": "character varying",
        "isNullable": false,
        "hasDefault": true
      },
      {
        "name": "featured_image",
        "type": "text",
        "isNullable": true,
        "hasDefault": false
      },
      {
        "name": "featured_video",
        "type": "text",
        "isNullable": true,
        "hasDefault": false
      },
      {
        "name": "meta_description",
        "type": "text",
        "isNullable": true,
        "hasDefault": false
      },
      {
        "name": "meta_keywords",
        "type": "text[]",
        "isNullable": true,
        "hasDefault": true
      },
      {
        "name": "published_at",
        "type": "timestamp with time zone",
        "isNullable": true,
        "hasDefault": false
      },
      {
        "name": "created_at",
        "type": "timestamp with time zone",
        "isNullable": false,
        "hasDefault": true
      },
      {
        "name": "updated_at",
        "type": "timestamp with time zone",
        "isNullable": false,
        "hasDefault": true
      },
      {
        "name": "reading_time",
        "type": "integer",
        "isNullable": true,
        "hasDefault": false
      },
      {
        "name": "tags",
        "type": "text[]",
        "isNullable": true,
        "hasDefault": true
      }
    ],
    "indexes": [
      {
        "name": "articles_pkey",
        "columns": ["id"],
        "isUnique": true
      },
      {
        "name": "articles_slug_key",
        "columns": ["slug"],
        "isUnique": true
      },
      {
        "name": "idx_articles_status",
        "columns": ["status"],
        "isUnique": false
      },
      {
        "name": "idx_articles_category",
        "columns": ["category_id"],
        "isUnique": false
      },
      {
        "name": "idx_articles_published_at",
        "columns": ["published_at"],
        "isUnique": false
      }
    ],
    "foreignKeys": [
      {
        "column": "author_id",
        "referencedTable": "team_members",
        "referencedColumn": "id"
      },
      {
        "column": "category_id",
        "referencedTable": "article_categories",
        "referencedColumn": "id"
      }
    ]
  },
  {
    "name": "media_assets",
    "columns": [
      {
        "name": "id",
        "type": "uuid",
        "isNullable": false,
        "hasDefault": true
      },
      {
        "name": "cloudinary_id",
        "type": "text",
        "isNullable": false,
        "hasDefault": false
      },
      {
        "name": "type",
        "type": "text",
        "isNullable": false,
        "hasDefault": false
      },
      {
        "name": "title",
        "type": "text",
        "isNullable": true,
        "hasDefault": false
      },
      {
        "name": "alt_text",
        "type": "text",
        "isNullable": true,
        "hasDefault": false
      },
      {
        "name": "metadata",
        "type": "jsonb",
        "isNullable": true,
        "hasDefault": true
      },
      {
        "name": "width",
        "type": "integer",
        "isNullable": true,
        "hasDefault": false
      },
      {
        "name": "height",
        "type": "integer",
        "isNullable": true,
        "hasDefault": false
      },
      {
        "name": "format",
        "type": "text",
        "isNullable": true,
        "hasDefault": false
      },
      {
        "name": "created_at",
        "type": "timestamp with time zone",
        "isNullable": false,
        "hasDefault": true
      },
      {
        "name": "updated_at",
        "type": "timestamp with time zone",
        "isNullable": false,
        "hasDefault": true
      }
    ],
    "indexes": [
      {
        "name": "media_assets_pkey",
        "columns": ["id"],
        "isUnique": true
      },
      {
        "name": "idx_media_assets_cloudinary_id",
        "columns": ["cloudinary_id"],
        "isUnique": true
      },
      {
        "name": "idx_media_assets_type",
        "columns": ["type"],
        "isUnique": false
      }
    ],
    "foreignKeys": []
  },
  {
    "name": "media_mappings",
    "columns": [
      {
        "name": "id",
        "type": "uuid",
        "isNullable": false,
        "hasDefault": true
      },
      {
        "name": "placeholder_id",
        "type": "text",
        "isNullable": false,
        "hasDefault": false
      },
      {
        "name": "media_id",
        "type": "uuid",
        "isNullable": false,
        "hasDefault": false
      },
      {
        "name": "created_at",
        "type": "timestamp with time zone",
        "isNullable": false,
        "hasDefault": true
      },
      {
        "name": "updated_at",
        "type": "timestamp with time zone",
        "isNullable": false,
        "hasDefault": true
      }
    ],
    "indexes": [
      {
        "name": "media_mappings_pkey",
        "columns": ["id"],
        "isUnique": true
      },
      {
        "name": "idx_media_mappings_placeholder_id",
        "columns": ["placeholder_id"],
        "isUnique": true
      },
      {
        "name": "idx_media_mappings_media_id",
        "columns": ["media_id"],
        "isUnique": false
      }
    ],
    "foreignKeys": [
      {
        "column": "media_id",
        "referencedTable": "media_assets",
        "referencedColumn": "id"
      }
    ]
  },
  {
    "name": "application_structure",
    "columns": [
      {
        "name": "id",
        "type": "uuid",
        "isNullable": false,
        "hasDefault": true
      },
      {
        "name": "placeholder_id",
        "type": "text",
        "isNullable": false,
        "hasDefault": false
      },
      {
        "name": "type",
        "type": "text",
        "isNullable": false,
        "hasDefault": false
      },
      {
        "name": "page",
        "type": "text",
        "isNullable": false,
        "hasDefault": false
      },
      {
        "name": "section",
        "type": "text",
        "isNullable": true,
        "hasDefault": false
      },
      {
        "name": "container",
        "type": "text",
        "isNullable": true,
        "hasDefault": false
      },
      {
        "name": "created_at",
        "type": "timestamp with time zone",
        "isNullable": false,
        "hasDefault": true
      },
      {
        "name": "updated_at",
        "type": "timestamp with time zone",
        "isNullable": false,
        "hasDefault": true
      }
    ],
    "indexes": [
      {
        "name": "application_structure_pkey",
        "columns": ["id"],
        "isUnique": true
      },
      {
        "name": "idx_application_structure_placeholder_id",
        "columns": ["placeholder_id"],
        "isUnique": true
      },
      {
        "name": "idx_application_structure_page",
        "columns": ["page"],
        "isUnique": false
      }
    ],
    "foreignKeys": []
  },
  {
    "name": "profiles",
    "columns": [
      {
        "name": "id",
        "type": "uuid",
        "isNullable": false,
        "hasDefault": false
      },
      {
        "name": "first_name",
        "type": "text",
        "isNullable": false,
        "hasDefault": false
      },
      {
        "name": "last_name",
        "type": "text",
        "isNullable": false,
        "hasDefault": false
      },
      {
        "name": "email",
        "type": "text",
        "isNullable": false,
        "hasDefault": false
      },
      {
        "name": "phone",
        "type": "text",
        "isNullable": true,
        "hasDefault": false
      },
      {
        "name": "created_at",
        "type": "timestamp with time zone",
        "isNullable": false,
        "hasDefault": true
      },
      {
        "name": "updated_at",
        "type": "timestamp with time zone",
        "isNullable": false,
        "hasDefault": true
      }
    ],
    "indexes": [
      {
        "name": "profiles_pkey",
        "columns": ["id"],
        "isUnique": true
      },
      {
        "name": "profiles_email_key",
        "columns": ["email"],
        "isUnique": true
      }
    ],
    "foreignKeys": []
  },
  {
    "name": "bookmarks",
    "columns": [
      {
        "name": "id",
        "type": "uuid",
        "isNullable": false,
        "hasDefault": true
      },
      {
        "name": "user_id",
        "type": "uuid",
        "isNullable": false,
        "hasDefault": false
      },
      {
        "name": "content_type",
        "type": "text",
        "isNullable": false,
        "hasDefault": false
      },
      {
        "name": "content_id",
        "type": "uuid",
        "isNullable": false,
        "hasDefault": false
      },
      {
        "name": "created_at",
        "type": "timestamp with time zone",
        "isNullable": false,
        "hasDefault": true
      }
    ],
    "indexes": [
      {
        "name": "bookmarks_pkey",
        "columns": ["id"],
        "isUnique": true
      },
      {
        "name": "idx_bookmarks_user_id",
        "columns": ["user_id"],
        "isUnique": false
      },
      {
        "name": "idx_bookmarks_content",
        "columns": ["content_type", "content_id"],
        "isUnique": false
      },
      {
        "name": "idx_bookmarks_unique",
        "columns": ["user_id", "content_type", "content_id"],
        "isUnique": true
      }
    ],
    "foreignKeys": [
      {
        "column": "user_id",
        "referencedTable": "profiles",
        "referencedColumn": "id"
      }
    ]
  },
  {
    "name": "appointments",
    "columns": [
      {
        "name": "id",
        "type": "uuid",
        "isNullable": false,
        "hasDefault": true
      },
      {
        "name": "user_id",
        "type": "uuid",
        "isNullable": true,
        "hasDefault": false
      },
      {
        "name": "provider_id",
        "type": "text",
        "isNullable": false,
        "hasDefault": false
      },
      {
        "name": "service_id",
        "type": "text",
        "isNullable": false,
        "hasDefault": false
      },
      {
        "name": "date",
        "type": "date",
        "isNullable": false,
        "hasDefault": false
      },
      {
        "name": "time",
        "type": "text",
        "isNullable": false,
        "hasDefault": false
      },
      {
        "name": "status",
        "type": "text",
        "isNullable": false,
        "hasDefault": true
      },
      {
        "name": "first_name",
        "type": "text",
        "isNullable": false,
        "hasDefault": false
      },
      {
        "name": "last_name",
        "type": "text",
        "isNullable": false,
        "hasDefault": false
      },
      {
        "name": "email",
        "type": "text",
        "isNullable": false,
        "hasDefault": false
      },
      {
        "name": "phone",
        "type": "text",
        "isNullable": false,
        "hasDefault": false
      },
      {
        "name": "zenoti_id",
        "type": "text",
        "isNullable": true,
        "hasDefault": false
      },
      {
        "name": "created_at",
        "type": "timestamp with time zone",
        "isNullable": false,
        "hasDefault": true
      },
      {
        "name": "updated_at",
        "type": "timestamp with time zone",
        "isNullable": false,
        "hasDefault": true
      }
    ],
    "indexes": [
      {
        "name": "appointments_pkey",
        "columns": ["id"],
        "isUnique": true
      },
      {
        "name": "idx_appointments_user_id",
        "columns": ["user_id"],
        "isUnique": false
      },
      {
        "name": "idx_appointments_date",
        "columns": ["date"],
        "isUnique": false
      },
      {
        "name": "idx_appointments_status",
        "columns": ["status"],
        "isUnique": false
      },
      {
        "name": "idx_appointments_zenoti_id",
        "columns": ["zenoti_id"],
        "isUnique": true
      }
    ],
    "foreignKeys": [
      {
        "column": "user_id",
        "referencedTable": "profiles",
        "referencedColumn": "id"
      }
    ]
  },
  {
    "name": "chat_messages",
    "columns": [
      {
        "name": "id",
        "type": "uuid",
        "isNullable": false,
        "hasDefault": true
      },
      {
        "name": "session_id",
        "type": "text",
        "isNullable": false,
        "hasDefault": false
      },
      {
        "name": "user_id",
        "type": "uuid",
        "isNullable": true,
        "hasDefault": false
      },
      {
        "name": "role",
        "type": "text",
        "isNullable": false,
        "hasDefault": false
      },
      {
        "name": "content",
        "type": "text",
        "isNullable": false,
        "hasDefault": false
      },
      {
        "name": "created_at",
        "type": "timestamp with time zone",
        "isNullable": false,
        "hasDefault": true
      }
    ],
    "indexes": [
      {
        "name": "chat_messages_pkey",
        "columns": ["id"],
        "isUnique": true
      },
      {
        "name": "idx_chat_messages_session_id",
        "columns": ["session_id"],
        "isUnique": false
      },
      {
        "name": "idx_chat_messages_user_id",
        "columns": ["user_id"],
        "isUnique": false
      }
    ],
    "foreignKeys": [
      {
        "column": "user_id",
        "referencedTable": "profiles",
        "referencedColumn": "id"
      }
    ]
  },
  {
    "name": "chat_appointment_requests",
    "columns": [
      {
        "name": "id",
        "type": "uuid",
        "isNullable": false,
        "hasDefault": true
      },
      {
        "name": "user_message",
        "type": "text",
        "isNullable": false,
        "hasDefault": false
      },
      {
        "name": "chat_history",
        "type": "jsonb",
        "isNullable": false,
        "hasDefault": false
      },
      {
        "name": "status",
        "type": "text",
        "isNullable": false,
        "hasDefault": true
      },
      {
        "name": "created_at",
        "type": "timestamp with time zone",
        "isNullable": false,
        "hasDefault": true
      },
      {
        "name": "updated_at",
        "type": "timestamp with time zone",
        "isNullable": false,
        "hasDefault": true
      }
    ],
    "indexes": [
      {
        "name": "chat_appointment_requests_pkey",
        "columns": ["id"],
        "isUnique": true
      },
      {
        "name": "idx_chat_appointment_requests_status",
        "columns": ["status"],
        "isUnique": false
      }
    ],
    "foreignKeys": []
  },
  {
    "name": "schema_migrations",
    "columns": [
      {
        "name": "version",
        "type": "integer",
        "isNullable": false,
        "hasDefault": false
      },
      {
        "name": "applied_at",
        "type": "timestamp with time zone",
        "isNullable": false,
        "hasDefault": true
      }
    ],
    "indexes": [
      {
        "name": "schema_migrations_pkey",
        "columns": ["version"],
        "isUnique": true
      }
    ],
    "foreignKeys": []
  }
]
```

### 5. Example Migration Files

Create migration files to match the PRD requirements:

#### Migration 001: Create Initial Tables

```sql
-- migrations/001_create_initial_tables.sql

-- Create team_members table
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  title VARCHAR(255),
  role VARCHAR(255) NOT NULL,
  image_url VARCHAR(255),
  description TEXT,
  "order" INTEGER NOT NULL,
  is_provider BOOLEAN NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create galleries table
CREATE TABLE IF NOT EXISTS galleries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create albums table
CREATE TABLE IF NOT EXISTS albums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gallery_id UUID NOT NULL REFERENCES galleries(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create cases table
CREATE TABLE IF NOT EXISTS cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  album_id UUID NOT NULL REFERENCES albums(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create images table
CREATE TABLE IF NOT EXISTS images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  cloudinary_url TEXT NOT NULL,
  caption TEXT,
  tags TEXT[],
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_images_case_id ON images(case_id);

-- Create update_updated_at function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$ language 'plpgsql';

-- Add triggers
CREATE TRIGGER update_team_members_updated_at
  BEFORE UPDATE ON team_members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

#### Migration 002: Create Article System

```sql
-- migrations/002_create_article_system.sql

-- Create article_categories table
CREATE TABLE IF NOT EXISTS article_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  order_position INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create articles table
CREATE TABLE IF NOT EXISTS articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  subtitle VARCHAR(255),
  slug VARCHAR(255) NOT NULL UNIQUE,
  content JSONB DEFAULT '[]'::jsonb,
  excerpt TEXT NOT NULL,
  author_id UUID REFERENCES team_members(id),
  category_id UUID REFERENCES article_categories(id),
  subcategory VARCHAR(255),
  status VARCHAR(20) DEFAULT 'draft',
  featured_image TEXT,
  featured_video TEXT,
  meta_description TEXT,
  meta_keywords TEXT[],
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  reading_time INTEGER,
  tags TEXT[]
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category_id);
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(published_at);

-- Add triggers
CREATE TRIGGER update_article_categories_updated_at
  BEFORE UPDATE ON article_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_articles_updated_at
  BEFORE UPDATE ON articles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

#### Migration 003: Create Media Management Tables

```sql
-- migrations/003_create_media_management.sql

-- Create media_assets table
CREATE TABLE IF NOT EXISTS media_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cloudinary_id TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('image', 'video')),
  title TEXT,
  alt_text TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  width INTEGER,
  height INTEGER,
  format TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create media_mappings table
CREATE TABLE IF NOT EXISTS media_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  placeholder_id TEXT NOT NULL UNIQUE,
  media_id UUID NOT NULL REFERENCES media_assets(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create application_structure table
CREATE TABLE IF NOT EXISTS application_structure (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  placeholder_id TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('image', 'video')),
  page TEXT NOT NULL,
  section TEXT,
  container TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_media_assets_type ON media_assets(type);
CREATE INDEX IF NOT EXISTS idx_media_mappings_media_id ON media_mappings(media_id);
CREATE INDEX IF NOT EXISTS idx_application_structure_page ON application_structure(page);

-- Add triggers
CREATE TRIGGER update_media_assets_updated_at
  BEFORE UPDATE ON media_assets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_media_mappings_updated_at
  BEFORE UPDATE ON media_mappings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_application_structure_updated_at
  BEFORE UPDATE ON application_structure
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

## Benefits of This Approach

1. **Type Safety**: Complete TypeScript type definitions ensure type safety throughout the codebase.

2. **Schema Consistency**: Validation ensures the database schema matches the expected schema.

3. **Version Control**: Migrations allow tracking schema changes over time.

4. **Automated Updates**: The type generation script can be run automatically on schema changes.

5. **Documentation**: The schema.json file serves as documentation for the database structure.

## Implementation Steps

1. **Create Scripts**: Implement the type generation, migration, and validation scripts.

2. **Generate Types**: Run the type generation script to create the initial database.types.ts file.

3. **Create Schema Definition**: Create the schema.json file based on the current database structure.

4. **Create Migrations Directory**: Set up the migrations directory and add the first migration file.

5. **Update Package.json**: Add scripts for running the database tasks:

```json
"scripts": {
  "db:types": "node --loader ts-node/esm scripts/generate-types.ts",
  "db:migrate": "node --loader ts-node/esm scripts/migrate.ts",
  "db:validate": "node --loader ts-node/esm scripts/validate-schema.ts",
  "db:seed": "node --loader ts-node/esm scripts/seed-data.ts"
}
```

6. **Set Up CI/CD Integration**: Integrate the schema validation into the CI/CD pipeline to ensure the database schema always matches the expected schema.

7. **Create Database Functions**: Add useful database functions for common operations such as:

```sql
-- Function to generate slug from title
CREATE OR REPLACE FUNCTION generate_slug(title TEXT)
RETURNS TEXT AS $
DECLARE
  slug TEXT;
BEGIN
  -- Convert to lowercase
  slug := lower(title);
  
  -- Replace non-alphanumeric characters with hyphens
  slug := regexp_replace(slug, '[^a-z0-9]', '-', 'g');
  
  -- Replace multiple hyphens with a single hyphen
  slug := regexp_replace(slug, '-+', '-', 'g');
  
  -- Remove leading and trailing hyphens
  slug := trim(both '-' from slug);
  
  RETURN slug;
END;
$ LANGUAGE plpgsql;

-- Function to run arbitrary SQL (for migrations)
CREATE OR REPLACE FUNCTION run_sql(sql TEXT)
RETURNS VOID AS $
BEGIN
  EXECUTE sql;
END;
$ LANGUAGE plpgsql;

-- Function to get foreign keys for a table
CREATE OR REPLACE FUNCTION get_foreign_keys(table_name TEXT)
RETURNS TABLE(
  column_name TEXT,
  referenced_table TEXT,
  referenced_column TEXT
) AS $
BEGIN
  RETURN QUERY
  SELECT
    kcu.column_name::TEXT,
    ccu.table_name::TEXT AS referenced_table,
    ccu.column_name::TEXT AS referenced_column
  FROM
    information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
  WHERE
    tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = table_name;
END;
$ LANGUAGE plpgsql;
```

## Conclusion

This comprehensive database schema optimization approach provides a solid foundation for the FAL project. By implementing these scripts and processes, the development team will have:

1. **Complete Type Safety**: With automatically generated TypeScript types that match the database schema.

2. **Schema Evolution**: A clear process for evolving the database schema over time through migrations.

3. **Validation**: Tools to ensure the database schema always matches the expected schema.

4. **Documentation**: Clear documentation of the database structure and relationships.

These improvements will significantly reduce the risk of database-related issues and make the codebase more maintainable in the long term.
