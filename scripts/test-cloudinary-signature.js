/**
 * Cloudinary Signature Testing Script
 * 
 * This script tests the Cloudinary signature generation process to ensure it works correctly.
 * Run with: node scripts/test-cloudinary-signature.js
 */

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

// Required environment variables
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;
const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

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
console.log(`${colors.bright}Cloudinary Signature Generation Test${colors.reset}\n`);

if (!CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET || !CLOUDINARY_CLOUD_NAME) {
  console.log(`${colors.red}Missing required environment variables!${colors.reset}`);
  console.log(`Please ensure these variables are set in your .env.local file:`);
  console.log(`CLOUDINARY_API_KEY=your_api_key`);
  console.log(`CLOUDINARY_API_SECRET=your_api_secret`);
  console.log(`NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name`);
  process.exit(1);
}

// Function to generate a SHA-1 hash (like Cloudinary expects)
async function generateSHA1(message) {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  
  // Use the Web Crypto API to generate the hash
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  
  // Convert the hash to a hex string
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Function to generate a signature in the same way as our API
async function generateSignature(params) {
  // Sort parameters alphabetically
  const sortedKeys = Object.keys(params).sort();
  
  // Create a string of key=value pairs joined by &
  const paramString = sortedKeys
    .map(key => `${key}=${params[key]}`)
    .join('&');
  
  // Append the API secret
  const stringToSign = paramString + CLOUDINARY_API_SECRET;
  
  // Generate the SHA-1 hash
  return await generateSHA1(stringToSign);
}

// Test signature generation
async function testSignatureGeneration() {
  console.log(`${colors.cyan}Testing signature generation:${colors.reset}`);
  
  // Create a test timestamp (consistent for repeatable results)
  const timestamp = Math.floor(Date.now() / 1000).toString();
  
  // Test case 1: Basic signature with timestamp and API key
  const params1 = {
    timestamp,
    api_key: CLOUDINARY_API_KEY
  };
  
  console.log(`\n${colors.yellow}Test case 1: Basic signature${colors.reset}`);
  console.log(`Parameters: ${JSON.stringify(params1)}`);
  
  try {
    const signature1 = await generateSignature(params1);
    console.log(`Generated signature: ${signature1}`);
    console.log(`${colors.green}✓ Signature generated successfully${colors.reset}`);
    
    // Test uploading with this signature
    console.log(`\nTesting upload URL with this signature...`);
    console.log(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload?api_key=${CLOUDINARY_API_KEY}&timestamp=${timestamp}&signature=${signature1}`);
  } catch (error) {
    console.log(`${colors.red}✗ Error generating signature: ${error.message}${colors.reset}`);
  }
  
  // Test case 2: Signature with folder and tags
  const params2 = {
    timestamp,
    api_key: CLOUDINARY_API_KEY,
    folder: 'test',
    tags: 'test,upload'
  };
  
  console.log(`\n${colors.yellow}Test case 2: Signature with folder and tags${colors.reset}`);
  console.log(`Parameters: ${JSON.stringify(params2)}`);
  
  try {
    const signature2 = await generateSignature(params2);
    console.log(`Generated signature: ${signature2}`);
    console.log(`${colors.green}✓ Signature generated successfully${colors.reset}`);
  } catch (error) {
    console.log(`${colors.red}✗ Error generating signature: ${error.message}${colors.reset}`);
  }
  
  // Test case 3: Expected server signature format
  const params3 = {
    timestamp,
    folder: 'gallery/',
    tags: 'gallery',
    api_key: CLOUDINARY_API_KEY
  };
  
  console.log(`\n${colors.yellow}Test case 3: Full upload parameters${colors.reset}`);
  console.log(`Parameters: ${JSON.stringify(params3)}`);
  
  try {
    const signature3 = await generateSignature(params3);
    console.log(`Generated signature: ${signature3}`);
    console.log(`${colors.green}✓ Signature generated successfully${colors.reset}`);
    
    console.log(`\n${colors.cyan}Corresponding client-side code:${colors.reset}`);
    console.log(`
// Add this to initUploadWidget callback in your client code:
callback({
  signature: "${signature3}",
  api_key: "${CLOUDINARY_API_KEY}",
  timestamp: "${timestamp}",
  folder: "gallery/",
  tags: "gallery"
});
`);
  } catch (error) {
    console.log(`${colors.red}✗ Error generating signature: ${error.message}${colors.reset}`);
  }
  
  console.log(`\n${colors.bright}🔍 Debugging Info:${colors.reset}`);
  console.log(`API Key: ${CLOUDINARY_API_KEY}`);
  console.log(`Cloud Name: ${CLOUDINARY_CLOUD_NAME}`);
  console.log(`Timestamp: ${timestamp}`);
  
  console.log(`\n${colors.green}${colors.bright}✓ Test complete!${colors.reset}`);
  console.log(`If signatures were generated successfully, your signature generation is working correctly.`);
  console.log(`If you're still having issues with uploads, check that you're sending the signature, api_key,`);
  console.log(`and timestamp from the server response to the Cloudinary widget correctly.`);
}

// Initialize the crypto module for Node.js environment
const crypto = require('crypto').webcrypto;

// Run the test
testSignatureGeneration(); 