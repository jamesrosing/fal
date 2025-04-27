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
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables must be set');
    process.exit(1);
  }

  console.log('Connecting to Supabase...');
  
  // Create a Supabase client with admin privileges
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  // Get expected schema from schema.json
  const schemaPath = path.join(process.cwd(), 'schema.json');
  if (!fs.existsSync(schemaPath)) {
    console.error('Schema definition file schema.json not found');
    return;
  }
  
  console.log('Loading expected schema from schema.json...');
  const expectedSchema: TableDefinition[] = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
  
  // Get actual schema from database
  console.log('Getting actual schema from database...');
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
    
    console.log(`Processing table: ${tableName}`);
    
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
          ? columnMatch[1].split(',').map((col: string) => col.trim().replace(/['"]/g, ''))
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
  console.log('Comparing schema...');
  
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
  console.log('Generating validation report...');
  
  const report = {
    validationDate: new Date().toISOString(),
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
  
  const isValid = missingTables.length === 0 && Object.keys(tableDiscrepancies).length === 0;
  
  if (isValid) {
    console.log('Schema validation PASSED! Your database matches the expected schema.');
  } else {
    console.log('Schema validation FAILED! See the validation report for details.');
    process.exit(1);
  }
  
  // Return validation result
  return {
    isValid,
    report
  };
}

// Run validation
validateSchema().catch(console.error); 