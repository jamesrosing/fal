// scripts/next15-migration.js
import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

/**
 * Migrate Next.js 14 code to Next.js 15 compatibility
 * This script finds and updates common patterns that need changes for Next.js 15
 */

const nextjsDynamicApis = [
  'cookies',
  'headers',
  'draftMode',
  'requestAsyncStorage',
  'useSearchParams'
];

// Find all TS/TSX files in the app directory
const files = await glob(['app/**/*.{ts,tsx}', 'lib/**/*.{ts,tsx}', 'components/**/*.{ts,tsx}']);
let modifiedCount = 0;
let errorCount = 0;

console.log(`Found ${files.length} files to check for Next.js 15 compatibility...`);

for (const file of files) {
  try {
    let content = fs.readFileSync(file, 'utf8');
    let modified = false;
    
    // Fix dynamic API usage within server components
    for (const api of nextjsDynamicApis) {
      // Check for direct API usage without await
      const apiUsageRegex = new RegExp(`const\\s+(\\w+)\\s+=\\s+${api}\\(\\);`, 'g');
      if (apiUsageRegex.test(content)) {
        content = content.replace(apiUsageRegex, `const $1 = await ${api}();`);
        modified = true;
      }
      
      // Check for destructuring from API without await
      const destructureRegex = new RegExp(`const\\s+\\{([^}]+)\\}\\s+=\\s+${api}\\(\\);`, 'g');
      if (destructureRegex.test(content)) {
        content = content.replace(destructureRegex, `const {$1} = await ${api}();`);
        modified = true;
      }
    }
    
    // Fix searchParams in page props
    if (content.includes('searchParams,') || content.includes('searchParams }')) {
      // Check if the component is already async
      if (!content.includes('export default async function Page') && content.includes('export default function Page')) {
        content = content.replace(
          /export\s+default\s+function\s+Page/g, 
          'export default async function Page'
        );
        modified = true;
      }
      
      // Handle searchParams
      const searchParamsUsageRegex = /const\s+(\w+)\s+=\s+searchParams\.(\w+)/g;
      if (searchParamsUsageRegex.test(content)) {
        content = content.replace(
          searchParamsUsageRegex, 
          'const $1 = (await searchParams).$2'
        );
        modified = true;
      }
    }
    
    // Fix API route requests
    if (content.includes('Request') && content.includes('NextRequest')) {
      // Fix nextUrl.searchParams
      const searchParamsRegex = /request\.nextUrl\.searchParams/g;
      if (searchParamsRegex.test(content)) {
        content = content.replace(
          /const\s+(\w+)\s+=\s+request\.nextUrl\.searchParams/g,
          'const $1 = await request.nextUrl.searchParams'
        );
        modified = true;
      }
    }
    
    // Fix middleware
    if (content.includes('middleware') && content.includes('NextRequest')) {
      // Make middleware async if not already
      if (!content.includes('export async function middleware') && content.includes('export function middleware')) {
        content = content.replace(
          /export\s+function\s+middleware/g, 
          'export async function middleware'
        );
        modified = true;
      }
      
      // Fix nextUrl properties
      const nextUrlDestructureRegex = /const\s+\{\s*([^}]+)\s*\}\s+=\s+request\.nextUrl/g;
      if (nextUrlDestructureRegex.test(content)) {
        // Replace with individual properties access
        content = content.replace(
          nextUrlDestructureRegex,
          'const pathname = request.nextUrl.pathname;\n  const search = request.nextUrl.search'
        );
        modified = true;
      }
    }
    
    // Save the modified file
    if (modified) {
      fs.writeFileSync(file, content);
      console.log(`✅ Updated ${file}`);
      modifiedCount++;
    }
  } catch (error) {
    console.error(`❌ Error processing ${file}:`, error);
    errorCount++;
  }
}

console.log(`\nMigration completed!`);
console.log(`Modified files: ${modifiedCount}`);
console.log(`Errors: ${errorCount}`);
console.log(`\nPlease verify the changes and test your application.`);
