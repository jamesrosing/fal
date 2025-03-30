import * as glob from 'glob';
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js'; // Standard Supabase client

interface DiscoveredPlaceholder {
  id: string;
  type: 'image' | 'video';
  filePath: string; // Full path to the file where it was found
  usageCount: number; // How many times it was found
}

// Database Placeholder structure (adjust table/column names if different)
interface DbPlaceholder {
  placeholder_id: string;
  type: 'image' | 'video';
  // Add any other relevant columns from your target table, e.g., description
}

/**
 * Scans the app directory for MediaImage and MediaVideo components
 * and extracts their placeholderId props.
 * @returns A Map of discovered placeholders with their details.
 */
async function discoverPlaceholders(): Promise<Map<string, DiscoveredPlaceholder>> {
  const placeholders = new Map<string, DiscoveredPlaceholder>();
  const basePath = path.join(process.cwd(), 'app'); // Assuming script runs from project root

  console.log(`Scanning for placeholders in: ${basePath}`);

  // Search for media components in the codebase (.ts and .tsx files)
  const files = glob.sync('**/*.{ts,tsx}', { cwd: basePath, absolute: true });

  console.log(`Found ${files.length} files to scan...`);

  for (const file of files) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      const relativePath = path.relative(basePath, file);

      // Look for MediaImage components using regex to capture placeholderId
      // Adjusted regex to avoid 's' flag, using [^] or (?:.|\n) if needed for cross-line matching
      // This version assumes the placeholderId attribute and value are on the same line or handled by general matching
      const mediaImageRegex = /<MediaImage(?:[^>]|\n)*?placeholderId=(?:"|')(.*?)(?:"|')[^>]*>/g;
      let match;
      while ((match = mediaImageRegex.exec(content)) !== null) {
        const placeholderId = match[1]; // Group 1 captures the value
        if (placeholderId) {
          const existing = placeholders.get(placeholderId);
          placeholders.set(placeholderId, {
            id: placeholderId,
            type: 'image',
            filePath: relativePath, // Store relative path for cleaner output
            usageCount: (existing?.usageCount || 0) + 1,
          });
        }
      }

      // Look for MediaVideo components
      // Adjusted regex
      const mediaVideoRegex = /<MediaVideo(?:[^>]|\n)*?placeholderId=(?:"|')(.*?)(?:"|')[^>]*>/g;
      while ((match = mediaVideoRegex.exec(content)) !== null) {
        const placeholderId = match[1]; // Group 1 captures the value
        if (placeholderId) {
          const existing = placeholders.get(placeholderId);
          placeholders.set(placeholderId, {
            id: placeholderId,
            type: 'video',
            filePath: relativePath, // Store relative path
            usageCount: (existing?.usageCount || 0) + 1,
          });
        }
      }
    } catch (error) {
      console.error(`Error reading file ${file}:`, error);
    }
  }

  console.log(`Discovery complete. Found ${placeholders.size} unique placeholders.`);
  return placeholders;
}

/**
 * Updates a target database table with the discovered placeholders.
 * It only inserts placeholders that are not already present.
 * @param placeholders - A Map of discovered placeholders.
 * @param tableName - The name of the target Supabase table (e.g., 'placeholders').
 */
async function updatePlaceholdersInDatabase(
  placeholders: Map<string, DiscoveredPlaceholder>,
  tableName: string = 'placeholders' // Target table name
) {
  // Initialize Supabase client using environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!; // Use Anon key or Service Role Key if needed
  const supabase = createClient(supabaseUrl, supabaseKey);

  let createdCount = 0;
  let existingCount = 0;
  let errorCount = 0;

  if (placeholders.size === 0) {
    console.log('No placeholders discovered, skipping database update.');
    return;
  }

  console.log(`\nUpdating database table '${tableName}'...`);

  // Get all existing placeholder IDs from the database in one go
  const { data: existingDbPlaceholders, error: fetchError } = await supabase
    .from(tableName)
    .select('placeholder_id');

  if (fetchError) {
    console.error('Fatal: Could not fetch existing placeholders from database:', fetchError);
    return; // Stop if we can't verify existing placeholders
  }

  const existingIds = new Set(existingDbPlaceholders?.map((p: { placeholder_id: string }) => p.placeholder_id) || []);
  console.log(`Found ${existingIds.size} existing placeholders in the database.`);

  const placeholdersToInsert: DbPlaceholder[] = [];

  // Use forEach instead of for...of for wider compatibility
  placeholders.forEach((placeholder) => {
    if (existingIds.has(placeholder.id)) {
      // console.log(`Placeholder "${placeholder.id}" already exists in database.`);
      existingCount++;
    } else {
      placeholdersToInsert.push({
        placeholder_id: placeholder.id,
        type: placeholder.type,
        // Add default values for other required columns if necessary
      });
    }
  });

  if (placeholdersToInsert.length > 0) {
    console.log(`Attempting to insert ${placeholdersToInsert.length} new placeholders...`);
    const { error: insertError } = await supabase
      .from(tableName)
      .insert(placeholdersToInsert);

    if (insertError) {
      console.error('Error inserting new placeholders:', insertError);
      // Note: This doesn't tell us *which* ones failed if it's a partial failure.
      // For more robust error handling, consider inserting one by one or handling conflicts.
      errorCount = placeholdersToInsert.length; // Assume all failed for simplicity
    } else {
      createdCount = placeholdersToInsert.length;
      console.log(`Successfully inserted ${createdCount} new placeholders.`);
    }
  } else {
    console.log('No new placeholders to insert.');
  }

  console.log(
    `\nDatabase update summary: ${createdCount} created, ${existingCount} already existed, ${errorCount} errors.`
  );
}


/**
 * Main execution function.
 */
async function main() {
  // Ensure required environment variables are set for Supabase
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
     console.error("Error: Supabase environment variables (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY) are not set.");
     process.exit(1);
  }

  const discoveredPlaceholders = await discoverPlaceholders();

  // Optionally print discovered placeholders
  /*
  console.log("\nDiscovered Placeholders:");
  for (const [id, details] of discoveredPlaceholders) {
    console.log(`- ID: ${id}, Type: ${details.type}, Found in: ${details.filePath}, Count: ${details.usageCount}`);
  }
  */

  // Update the database (ensure the 'placeholders' table exists first!)
  await updatePlaceholdersInDatabase(discoveredPlaceholders, 'placeholders');

  console.log('\nScript finished.');
}

// Execute the main function
main().catch(error => {
  console.error('\nScript encountered an unhandled error:', error);
  process.exit(1);
}); 