/**
 * Cloudinary Credentials Test Script
 * 
 * This script verifies that your Cloudinary credentials are properly set and working.
 * Run with: node scripts/test-cloudinary-credentials.js
 */

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

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

// Check for required variables
console.log(`${colors.bright}Cloudinary Credentials Check${colors.reset}\n`);

console.log(`${colors.cyan}Checking environment variables:${colors.reset}`);
console.log(`- Cloud name: ${CLOUDINARY_CLOUD_NAME ? colors.green + '✓' + colors.reset : colors.red + '✗' + colors.reset}`);
console.log(`- API key: ${CLOUDINARY_API_KEY ? colors.green + '✓' + colors.reset : colors.red + '✗' + colors.reset}`);
console.log(`- API secret: ${CLOUDINARY_API_SECRET ? colors.green + '✓' + colors.reset : colors.red + '✗' + colors.reset}`);
console.log(`- Upload preset: ${CLOUDINARY_UPLOAD_PRESET ? colors.green + '✓' + colors.reset : colors.red + '✗' + colors.reset}`);

// If any required variables are missing, exit
if (!CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET || !CLOUDINARY_CLOUD_NAME) {
  console.log(`\n${colors.red}Missing required environment variables!${colors.reset}`);
  console.log(`\nPlease ensure these variables are set in your .env.local file:`);
  console.log(`CLOUDINARY_API_KEY=your_api_key`);
  console.log(`CLOUDINARY_API_SECRET=your_api_secret`);
  console.log(`NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name`);
  process.exit(1);
}

// Test API connection
console.log(`\n${colors.cyan}Testing Cloudinary API connection:${colors.reset}`);

// Using fetch to test connection
async function testConnection() {
  try {
    // Formulate authentication for basic auth
    const auth = Buffer.from(`${CLOUDINARY_API_KEY}:${CLOUDINARY_API_SECRET}`).toString('base64');
    
    // Try to fetch account info as a simple ping test
    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/usage`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.status === 200) {
      console.log(`${colors.green}✓ Connection successful!${colors.reset}`);
      const data = await response.json();
      console.log(`  - Plan: ${data.plan}`);
      console.log(`  - Last updated: ${new Date(data.last_updated * 1000).toLocaleString()}`);
      
      // Test credential values
      console.log(`\n${colors.cyan}Credential Values:${colors.reset}`);
      console.log(`- Cloud Name: ${CLOUDINARY_CLOUD_NAME}`);
      console.log(`- API Key: ${CLOUDINARY_API_KEY.slice(0, 6)}...${CLOUDINARY_API_KEY.slice(-4)}`);
      console.log(`- API Secret: ${CLOUDINARY_API_SECRET.slice(0, 3)}...${CLOUDINARY_API_SECRET.slice(-3)}`);
      if (CLOUDINARY_UPLOAD_PRESET) {
        console.log(`- Upload Preset: ${CLOUDINARY_UPLOAD_PRESET}`);
      }
      
      console.log(`\n${colors.green}${colors.bright}✓ All credentials look good!${colors.reset}`);
    } else {
      const error = await response.text();
      console.log(`${colors.red}✗ Connection failed!${colors.reset}`);
      console.log(`  Status: ${response.status}`);
      console.log(`  Error: ${error}`);
      
      // Show the failed credentials
      console.log(`\n${colors.yellow}Check these values:${colors.reset}`);
      console.log(`- Cloud Name: ${CLOUDINARY_CLOUD_NAME}`);
      console.log(`- API Key: ${CLOUDINARY_API_KEY}`);
      console.log(`- API Secret: ${CLOUDINARY_API_SECRET ? CLOUDINARY_API_SECRET.slice(0, 3) + '...' + CLOUDINARY_API_SECRET.slice(-3) : 'missing'}`);
    }
  } catch (error) {
    console.log(`${colors.red}✗ Connection error:${colors.reset}`);
    console.log(`  ${error.message}`);
  }
}

testConnection(); 