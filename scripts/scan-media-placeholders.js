import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import fs from 'fs';
import { glob } from 'glob';
import { createClient as createSupabaseClient } from '@supabase/supabase-js'; // Direct import
import { v4 as uuidv4 } from 'uuid';

// Patterns to look for
const PLACEHOLDER_PATTERNS = [
  /placeholderId=["']([^"']+)["']/g, // In JSX props
  /getMediaByPlaceholderId\(["']([^"']+)["']\)/g // In function calls
];

async function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const componentPath = path.relative(process.cwd(), filePath); // Relative path
  const isPage = componentPath.startsWith('app') && /\/page\.(tsx|jsx|js|ts)$/.test(componentPath);

  // Extract page path for page components
  let pagePath = null;
  if (isPage) {
    pagePath = '/' + componentPath
      .substring(4) // Remove 'app/'
      .replace(/\/page\.(tsx|jsx|js|ts)$/, '') // Remove /page.ext
      .replace(/\/\(.*?\)\//g, '/') // Remove route groups like /(main)/
      .replace(/\/$/, ''); // Remove trailing slash unless it's the root

    // Handle index/root pages
    if (pagePath === '') {
      pagePath = '/';
    }
  }

  const placeholders = [];

  // Check for placeholders
  for (const pattern of PLACEHOLDER_PATTERNS) {
    let match;
    pattern.lastIndex = 0; // Reset regex state

    while ((match = pattern.exec(content)) !== null) {
      const name = match[1];

      // Add if not already found in this file
      if (!placeholders.some(p => p.name === name)) {
        placeholders.push({
          name,
          description: `Found in ${componentPath}`,
          page_path: pagePath,
          component_path: componentPath,
        });
      }
    }
  }

  return placeholders;
}

async function scanDirectory(dir) {
  console.log(`Scanning ${dir}...`);
  // Use POSIX paths for glob compatibility
  const posixDir = dir.replace(/\\/g, '/');
  const files = await glob(`${posixDir}/**/*.{tsx,jsx,js,ts}`);
  console.log(`Found ${files.length} files to scan in ${dir}.`);

  const allPlaceholders = [];

  for (const file of files) {
    try {
      const placeholders = await scanFile(file);
      allPlaceholders.push(...placeholders);
    } catch (error) {
        console.error(`Error scanning file ${file}:`, error);
    }
  }

  // Deduplicate placeholders by name
  const uniquePlaceholders = Array.from(new Map(allPlaceholders.map(p => [p.name, p])).values());

  return uniquePlaceholders;
}

async function savePlaceholders(placeholders) {
  // NOTE: This script runs outside Next.js, needs service_role key for DB writes
  // Ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in your environment
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
      console.warn('SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables not set. Cannot write to database.');
      console.warn('Placeholders will be logged to console and saved to placeholders.json only.');
      return 0;
  }

  // Initialize Supabase client directly with service role key
  const supabase = createSupabaseClient(supabaseUrl, serviceKey);

  let saved = 0;
  let existing = 0;
  let failed = 0;

  // Fetch existing placeholder names for efficient checking
  const { data: existingNamesData, error: fetchError } = await supabase
    .from('unified_media_placeholders')
    .select('name');

  if (fetchError) {
      console.error('Error fetching existing placeholders:', fetchError);
      console.warn('Proceeding without checking existing placeholders, duplicates might cause errors.')
  }
  const existingNames = new Set(existingNamesData?.map(p => p.name) || []);

  for (const placeholder of placeholders) {
    if (!existingNames.has(placeholder.name)) {
      // Target the correct table and use its columns
      const { error: insertError } = await supabase
        .from('unified_media_placeholders')
        .insert({
          id: uuidv4(),
          name: placeholder.name,
          description: placeholder.description,
          page_path: placeholder.page_path,
          component_path: placeholder.component_path,
        });

      if (insertError) {
        console.error(`Error saving placeholder "${placeholder.name}":`, insertError.message);
        failed++;
      } else {
        console.log(`Saved new placeholder: ${placeholder.name}`);
        saved++;
      }
    } else {
        // console.log(`Placeholder "${placeholder.name}" already exists.`);
        existing++;
    }
  }

  console.log(`\n--- Database Update Summary ---`);
  console.log(`New placeholders saved: ${saved}`);
  console.log(`Existing placeholders found: ${existing}`);
  console.log(`Failed saves: ${failed}`);
  console.log(`-----------------------------`);
  console.log(''); // Add a blank line for separation

  return saved;
}

async function main() {
  console.log('Scanning application for media placeholders...');

  const appDir = path.join(process.cwd(), 'app');
  const componentsDir = path.join(process.cwd(), 'components');

  const appPlaceholders = await scanDirectory(appDir);
  const componentPlaceholders = await scanDirectory(componentsDir);

  // Combine and deduplicate across directories
  const combinedPlaceholders = [...appPlaceholders, ...componentPlaceholders];
  const allPlaceholders = Array.from(new Map(combinedPlaceholders.map(p => [p.name, p])).values());

  console.log(`\nFound ${allPlaceholders.length} unique placeholder references in code.`);

  // Save to database
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      await savePlaceholders(allPlaceholders);
  } else {
      console.log('Skipping database save due to missing SUPABASE_SERVICE_ROLE_KEY.');
  }

  // Save to file for reference
  const outputFilename = 'placeholders-scan-output.json';
  fs.writeFileSync(outputFilename, JSON.stringify(allPlaceholders, null, 2));
  console.log(`Full placeholder reference list saved to ${outputFilename}`);

  console.log('\nScan complete.'); // Use standard newline escape
}

main().catch(error => {
    console.error("\nScript failed with an error:", error);
    process.exit(1);
});
