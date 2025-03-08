/**
 * Zenoti Direct API Test
 * 
 * This script tests the Zenoti API using the direct API key approach
 * as specified in the official documentation.
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
const apiUrl = process.env.ZENOTI_API_URL || 'https://api.alluremd.zenoti.com';
const standardApiUrl = 'https://api.zenoti.com'; // Standard API URL as per documentation
const apiKey = process.env.ZENOTI_API_KEY;
const centerId = process.env.ZENOTI_CENTER_ID || '12345'; // Default value, should be replaced

console.log('Testing Zenoti API with direct API key approach:');
console.log(`- API URL: ${apiUrl}`);
console.log(`- Standard API URL: ${standardApiUrl}`);
console.log(`- API Key: ${apiKey ? apiKey.substring(0, 8) + '...' : 'Not set'}`);
console.log(`- Center ID: ${centerId}`);

/**
 * Test retrieving a center by ID
 */
async function testGetCenter(url, centerId) {
  console.log(`\nTesting Get Center with URL: ${url}`);
  try {
    const response = await axiosInstance.get(
      `${url}/v1/Centers/${centerId}`,
      {
        headers: {
          'accept': 'application/json',
          'Authorization': `apikey ${apiKey}`
        }
      }
    );
    
    console.log(`Success! Status: ${response.status}`);
    console.log('Center details:');
    console.log(`- ID: ${response.data.id}`);
    console.log(`- Name: ${response.data.name}`);
    console.log(`- Code: ${response.data.code}`);
    console.log(`- Phone: ${response.data.phone}`);
    console.log(`- Email: ${response.data.email}`);
    return true;
  } catch (error) {
    console.log(`Failed: ${error.message}`);
    if (error.response) {
      console.log(`Status: ${error.response.status}`);
      console.log('Data:', error.response.data);
    }
    return false;
  }
}

/**
 * Test retrieving all centers
 */
async function testGetAllCenters(url) {
  console.log(`\nTesting Get All Centers with URL: ${url}`);
  try {
    const response = await axiosInstance.get(
      `${url}/v1/Centers`,
      {
        headers: {
          'accept': 'application/json',
          'Authorization': `apikey ${apiKey}`
        }
      }
    );
    
    console.log(`Success! Status: ${response.status}`);
    if (Array.isArray(response.data)) {
      console.log(`Found ${response.data.length} centers`);
      if (response.data.length > 0) {
        console.log('Centers:');
        response.data.forEach(center => {
          console.log(`- ${center.name} (ID: ${center.id})`);
        });
      }
    } else if (response.data.centers) {
      console.log(`Found ${response.data.centers.length} centers`);
      if (response.data.centers.length > 0) {
        console.log('Centers:');
        response.data.centers.forEach(center => {
          console.log(`- ${center.name} (ID: ${center.id})`);
        });
      }
    } else {
      console.log('Unexpected response format:', response.data);
    }
    return true;
  } catch (error) {
    console.log(`Failed: ${error.message}`);
    if (error.response) {
      console.log(`Status: ${error.response.status}`);
      console.log('Data:', error.response.data);
    }
    return false;
  }
}

/**
 * Test retrieving services for a center
 */
async function testGetServices(url, centerId) {
  console.log(`\nTesting Get Services with URL: ${url}`);
  try {
    const response = await axiosInstance.get(
      `${url}/v1/Centers/${centerId}/services`,
      {
        headers: {
          'accept': 'application/json',
          'Authorization': `apikey ${apiKey}`
        }
      }
    );
    
    console.log(`Success! Status: ${response.status}`);
    const services = response.data.services || [];
    console.log(`Found ${services.length} services`);
    if (services.length > 0) {
      console.log('First few services:');
      services.slice(0, 3).forEach(service => {
        console.log(`- ${service.name} (ID: ${service.id})`);
      });
    }
    return true;
  } catch (error) {
    console.log(`Failed: ${error.message}`);
    if (error.response) {
      console.log(`Status: ${error.response.status}`);
      console.log('Data:', error.response.data);
    }
    return false;
  }
}

/**
 * Main function
 */
async function main() {
  if (!apiKey) {
    console.error('API Key is not set. Please check your .env.local file.');
    return;
  }
  
  // Try with both the custom subdomain and standard API URL
  const urls = [apiUrl, standardApiUrl];
  let success = false;
  
  for (const url of urls) {
    console.log(`\n--- Testing with URL: ${url} ---`);
    
    // Test getting all centers first to find valid center IDs
    const centersSuccess = await testGetAllCenters(url);
    
    if (centersSuccess) {
      success = true;
      // If we can get centers, try getting a specific center
      await testGetCenter(url, centerId);
      
      // Try getting services for the center
      await testGetServices(url, centerId);
      
      // If successful with this URL, no need to try the other URL
      break;
    }
  }
  
  if (!success) {
    console.log('\nAll API requests failed. Please check:');
    console.log('1. Your API key is correct');
    console.log('2. Your center ID is correct');
    console.log('3. Your account has access to these API endpoints');
    console.log('4. The API URL is correct');
  }
}

// Run the main function
main(); 