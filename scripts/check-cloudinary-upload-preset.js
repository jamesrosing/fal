/**
 * Cloudinary Upload Preset Check Script
 * 
 * This script checks whether a specific upload preset is properly configured for unsigned uploads.
 * Run with: node scripts/check-cloudinary-upload-preset.js [preset-name]
 */

// ES Module imports
import dotenv from 'dotenv';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Setup ES Module equivalents for __dirname and require
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

// Load environment variables from .env.local
dotenv.config({ path: resolve(__dirname, '../.env.local') });

// Required environment variables
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;
const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bright: '\x1b[1m',
};

// Parse command line arguments
const args = process.argv.slice(2);
const presetToCheck = args[0] || CLOUDINARY_UPLOAD_PRESET || 'emsculpt';

// Check for required variables
console.log(`${colors.bright}Cloudinary Upload Preset Check${colors.reset}\n`);

if (!CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET || !CLOUDINARY_CLOUD_NAME) {
  console.log(`${colors.red}Missing required environment variables!${colors.reset}`);
  console.log(`Please ensure these variables are set in your .env.local file:`);
  console.log(`CLOUDINARY_API_KEY=your_api_key`);
  console.log(`CLOUDINARY_API_SECRET=your_api_secret`);
  console.log(`NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name`);
  process.exit(1);
}

console.log(`${colors.cyan}Checking upload preset: ${colors.bright}${presetToCheck}${colors.reset}\n`);

// Function to check if an upload preset exists and is configured for unsigned uploads
async function checkUploadPreset(presetName) {
  try {
    // Formulate authentication for basic auth
    const auth = Buffer.from(`${CLOUDINARY_API_KEY}:${CLOUDINARY_API_SECRET}`).toString('base64');
    
    // Fetch upload preset details
    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload_presets/${presetName}`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.status === 200) {
      const data = await response.json();
      
      console.log(`${colors.green}✓ Upload preset "${presetName}" exists${colors.reset}`);
      console.log(`${colors.cyan}Preset details:${colors.reset}`);
      console.log(`  - Name: ${data.name}`);
      console.log(`  - Signing Mode: ${data.signing_mode || 'Unknown'}`);
      console.log(`  - Folder: ${data.folder || 'None'}`);
      
      // Check if unsigned
      if (data.signing_mode === 'unsigned') {
        console.log(`\n${colors.green}${colors.bright}✓ This preset IS configured for unsigned uploads!${colors.reset}`);
        console.log(`\nYou can use this preset for client-side uploads with:`);
        console.log(`
<CloudinaryUploader
  useUploadPreset={true}
  uploadPreset="${presetName}"
  ...other props
/>
`);
      } else {
        console.log(`\n${colors.red}✗ This preset is NOT configured for unsigned uploads!${colors.reset}`);
        console.log(`\nTo fix this, you need to set the signing mode to "unsigned" in your Cloudinary dashboard:`);
        console.log(`1. Go to https://console.cloudinary.com/settings/upload`);
        console.log(`2. Find the "${presetName}" preset in the upload presets section`);
        console.log(`3. Click "Edit"`);
        console.log(`4. Change "Signing Mode" to "Unsigned"`);
        console.log(`5. Save changes`);
      }
      
      return data;
    } else if (response.status === 404) {
      console.log(`${colors.red}✗ Upload preset "${presetName}" not found${colors.reset}`);
      console.log(`\nYou need to create this preset in your Cloudinary dashboard:`);
      console.log(`1. Go to https://console.cloudinary.com/settings/upload`);
      console.log(`2. Click "Add upload preset"`);
      console.log(`3. Use "${presetName}" as the preset name`);
      console.log(`4. Make sure "Signing Mode" is set to "Unsigned"`);
      console.log(`5. Configure other settings as needed`);
      console.log(`6. Save changes`);
      
      return null;
    } else {
      const error = await response.text();
      console.log(`${colors.red}✗ Error checking upload preset:${colors.reset}`);
      console.log(`  Status: ${response.status}`);
      console.log(`  Error: ${error}`);
      
      return null;
    }
  } catch (error) {
    console.log(`${colors.red}✗ Connection error:${colors.reset}`);
    console.log(`  ${error.message}`);
    return null;
  }
}

// Function to provide alternative options if preset isn't working
function suggestAlternatives() {
  console.log(`\n${colors.cyan}Alternatives:${colors.reset}`);
  console.log(`1. ${colors.bright}Use signed uploads instead${colors.reset} (recommended):`);
  console.log(`   <CloudinaryUploader useUploadPreset={false} ... />`);
  console.log(`   This uses server-side authentication which is more secure.`);
  
  console.log(`\n2. ${colors.bright}Create a new upload preset${colors.reset}:`);
  console.log(`   - Go to https://console.cloudinary.com/settings/upload`);
  console.log(`   - Click "Add upload preset"`);
  console.log(`   - Set "Signing Mode" to "Unsigned"`);
  console.log(`   - Save and update your code to use the new preset name`);
  
  console.log(`\n3. ${colors.bright}Update your environment variables${colors.reset}:`);
  console.log(`   Add or update in .env.local:`);
  console.log(`   NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_unsigned_preset`);
}

// Run the check
async function run() {
  const presetDetails = await checkUploadPreset(presetToCheck);
  
  if (!presetDetails || presetDetails.signing_mode !== 'unsigned') {
    suggestAlternatives();
  }
  
  console.log(`\n${colors.bright}Done!${colors.reset}`);
}

run(); 