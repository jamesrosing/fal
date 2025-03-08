/**
 * Zenoti Service Booking API Test
 * 
 * This script tests the Zenoti Service Booking API endpoints.
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
const apiKey = process.env.ZENOTI_API_KEY;
const apiSecret = process.env.ZENOTI_API_SECRET;
const appId = process.env.ZENOTI_APP_ID;
const appSecret = process.env.ZENOTI_APP_SECRET || process.env.ZENOTI_APPLICATION_ID;
const accountName = process.env.ZENOTI_ACCOUNT_NAME || 'alluremd';
const userName = process.env.ZENOTI_USER_NAME;
const password = process.env.ZENOTI_PASSWORD;
const centerId = process.env.ZENOTI_CENTER_ID || '12345'; // Default value, should be replaced

console.log('Testing Zenoti Service Booking API with:');
console.log(`- API URL: ${apiUrl}`);
console.log(`- Account: ${accountName}`);
console.log(`- Center ID: ${centerId}`);
console.log(`- API Key: ${apiKey ? apiKey.substring(0, 8) + '...' : 'Not set'}`);
console.log(`- API Secret: ${apiSecret ? apiSecret.substring(0, 8) + '...' : 'Not set'}`);
console.log(`- App ID: ${appId ? appId.substring(0, 8) + '...' : 'Not set'}`);
console.log(`- App Secret: ${appSecret ? appSecret.substring(0, 8) + '...' : 'Not set'}`);

/**
 * Try different authentication methods
 */
async function tryAuthentication() {
  const authMethods = [
    {
      name: 'API Key + Secret (Basic Auth)',
      tryAuth: async () => {
        if (!apiKey || !apiSecret) return null;
        
        try {
          console.log('\nTrying API Key + Secret authentication...');
          const response = await axiosInstance.post(
            `${apiUrl}/oauth/token`,
            {
              grant_type: 'client_credentials',
              scope: 'integration'
            },
            {
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${Buffer.from(`${apiKey}:${apiSecret}`).toString('base64')}`
              }
            }
          );
          
          if (response.status === 200 && response.data.access_token) {
            console.log('Success! Token obtained via API Key + Secret');
            return response.data.access_token;
          }
          return null;
        } catch (error) {
          console.log('Failed:', error.message);
          if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Data:', error.response.data);
          }
          return null;
        }
      }
    },
    {
      name: 'App ID + Secret (Basic Auth)',
      tryAuth: async () => {
        if (!appId || !appSecret) return null;
        
        try {
          console.log('\nTrying App ID + Secret authentication...');
          const response = await axiosInstance.post(
            `${apiUrl}/oauth/token`,
            {
              grant_type: 'client_credentials',
              scope: 'integration'
            },
            {
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${Buffer.from(`${appId}:${appSecret}`).toString('base64')}`
              }
            }
          );
          
          if (response.status === 200 && response.data.access_token) {
            console.log('Success! Token obtained via App ID + Secret');
            return response.data.access_token;
          }
          return null;
        } catch (error) {
          console.log('Failed:', error.message);
          if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Data:', error.response.data);
          }
          return null;
        }
      }
    },
    {
      name: 'Password Grant',
      tryAuth: async () => {
        if (!userName || !password) return null;
        
        try {
          console.log('\nTrying Password Grant authentication...');
          const response = await axiosInstance.post(
            `${apiUrl}/v1/tokens`,
            {
              account_name: accountName,
              user_name: userName,
              password: password,
              grant_type: 'password',
              app_id: appId,
              app_secret: appSecret,
              device_id: 'web-app'
            },
            {
              headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              }
            }
          );
          
          if (response.status === 200 && response.data.access_token) {
            console.log('Success! Token obtained via Password Grant');
            return response.data.access_token;
          }
          return null;
        } catch (error) {
          console.log('Failed:', error.message);
          if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Data:', error.response.data);
          }
          return null;
        }
      }
    },
    {
      name: 'API Key in Header',
      tryAuth: async () => {
        if (!apiKey) return null;
        
        // This doesn't return a token but sets up for direct API calls
        console.log('\nTrying API Key in header (no token)...');
        return 'API_KEY_HEADER';
      }
    }
  ];
  
  for (const method of authMethods) {
    const token = await method.tryAuth();
    if (token) return { token, method: method.name };
  }
  
  return null;
}

/**
 * Test various Zenoti API endpoints
 */
async function testApiEndpoints(authResult) {
  const { token, method } = authResult;
  const isApiKeyHeader = token === 'API_KEY_HEADER';
  
  // Define endpoints to test
  const endpoints = [
    {
      name: 'List Services',
      url: `${apiUrl}/v1/centers/${centerId}/services`,
      method: 'GET',
      processResponse: (data) => {
        const services = data.services || [];
        console.log(`Found ${services.length} services`);
        if (services.length > 0) {
          console.log('First few services:');
          services.slice(0, 3).forEach(service => {
            console.log(`- ${service.name} (ID: ${service.id})`);
          });
        }
      }
    },
    {
      name: 'List Services (Alternative)',
      url: `${apiUrl}/v1/catalog/centers/${centerId}/services`,
      method: 'GET',
      processResponse: (data) => {
        const services = data.services || [];
        console.log(`Found ${services.length} services`);
        if (services.length > 0) {
          console.log('First few services:');
          services.slice(0, 3).forEach(service => {
            console.log(`- ${service.name} (ID: ${service.id})`);
          });
        }
      }
    },
    {
      name: 'List Products',
      url: `${apiUrl}/v1/centers/${centerId}/products`,
      method: 'GET',
      processResponse: (data) => {
        const products = data.products || [];
        console.log(`Found ${products.length} products`);
        if (products.length > 0) {
          console.log('First few products:');
          products.slice(0, 3).forEach(product => {
            console.log(`- ${product.name} (ID: ${product.id})`);
          });
        }
      }
    },
    {
      name: 'List Centers',
      url: `${apiUrl}/v1/centers`,
      method: 'GET',
      processResponse: (data) => {
        const centers = data.centers || [];
        console.log(`Found ${centers.length} centers`);
        if (centers.length > 0) {
          console.log('Centers:');
          centers.forEach(center => {
            console.log(`- ${center.name} (ID: ${center.id})`);
          });
        }
      }
    }
  ];
  
  // Test each endpoint
  for (const endpoint of endpoints) {
    console.log(`\nTesting ${endpoint.name}...`);
    try {
      const headers = isApiKeyHeader 
        ? { 'X-API-Key': apiKey, 'Accept': 'application/json' }
        : { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' };
      
      const response = await axiosInstance.request({
        method: endpoint.method,
        url: endpoint.url,
        headers
      });
      
      console.log(`Success! Status: ${response.status}`);
      endpoint.processResponse(response.data);
    } catch (error) {
      console.log(`Failed: ${error.message}`);
      if (error.response) {
        console.log(`Status: ${error.response.status}`);
        console.log('Data:', error.response.data);
      }
    }
  }
}

/**
 * Main function
 */
async function main() {
  try {
    console.log('\nTrying different authentication methods...');
    const authResult = await tryAuthentication();
    
    if (!authResult) {
      console.error('\nAll authentication methods failed. Please check your credentials.');
      return;
    }
    
    console.log(`\nAuthenticated successfully using: ${authResult.method}`);
    await testApiEndpoints(authResult);
    
  } catch (error) {
    console.error('Error in main function:', error.message);
  }
}

// Run the main function
main(); 