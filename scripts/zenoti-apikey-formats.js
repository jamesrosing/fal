/**
 * Zenoti API Key Format Test
 * 
 * This script tests different formats for the API key in the Authorization header.
 */

import dotenv from 'dotenv';
import axios from 'axios';
import https from 'https';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = resolve(__dirname, '..', '.env.local');

dotenv.config({ path: envPath });

// Create an axios instance with SSL verification disabled for development
const axiosInstance = axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false
  })
});

// Load environment variables
const apiUrl = 'https://api.zenoti.com'; // Use the standard API URL as per documentation
const apiKey = process.env.ZENOTI_API_KEY;
const apiSecret = process.env.ZENOTI_API_SECRET;

console.log('Testing different API key formats:');
console.log(`- API URL: ${apiUrl}`);
console.log(`- API Key: ${apiKey ? apiKey.substring(0, 8) + '...' : 'Not set'}`);

/**
 * Test different API key formats
 */
async function testApiKeyFormats() {
  // Different formats to try
  const formats = [
    {
      name: 'Format 1: apikey <key>',
      header: { 'Authorization': `apikey ${apiKey}` }
    },
    {
      name: 'Format 2: ApiKey <key>',
      header: { 'Authorization': `ApiKey ${apiKey}` }
    },
    {
      name: 'Format 3: Bearer <key>',
      header: { 'Authorization': `Bearer ${apiKey}` }
    },
    {
      name: 'Format 4: <key>',
      header: { 'Authorization': apiKey }
    },
    {
      name: 'Format 5: X-API-Key header',
      header: { 'X-API-Key': apiKey }
    },
    {
      name: 'Format 6: apikey header',
      header: { 'apikey': apiKey }
    },
    {
      name: 'Format 7: API key and secret as Basic Auth',
      header: { 'Authorization': `Basic ${Buffer.from(`${apiKey}:${apiSecret || ''}`).toString('base64')}` }
    }
  ];
  
  // Test each format
  for (const format of formats) {
    console.log(`\nTrying ${format.name}`);
    try {
      const response = await axiosInstance.get(
        `${apiUrl}/v1/Centers`,
        {
          headers: {
            'accept': 'application/json',
            ...format.header
          }
        }
      );
      
      console.log(`Success! Status: ${response.status}`);
      if (Array.isArray(response.data)) {
        console.log(`Found ${response.data.length} centers`);
      } else if (response.data.centers) {
        console.log(`Found ${response.data.centers.length} centers`);
      } else {
        console.log('Response data:', response.data);
      }
      
      // If successful, print the working format
      console.log('\n✅ WORKING FORMAT FOUND:');
      console.log(format.name);
      console.log('Headers:', format.header);
      
      return format;
    } catch (error) {
      console.log(`Failed: ${error.message}`);
      if (error.response) {
        console.log(`Status: ${error.response.status}`);
        console.log('Data:', error.response.data);
      }
    }
  }
  
  return null;
}

/**
 * Main function
 */
async function main() {
  if (!apiKey) {
    console.error('API Key is not set. Please check your .env.local file.');
    return;
  }
  
  console.log('\nTesting different API key formats...');
  const workingFormat = await testApiKeyFormats();
  
  if (!workingFormat) {
    console.log('\nAll API key formats failed. Please check:');
    console.log('1. Your API key is correct');
    console.log('2. Your account has access to these API endpoints');
    console.log('3. Contact Zenoti support to verify the correct authentication method');
  }
}

// Run the main function
main(); 