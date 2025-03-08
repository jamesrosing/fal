/**
 * Zenoti Services API Test
 * 
 * This script tests the Zenoti API endpoints related to services and products.
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

console.log('Testing Zenoti Services API with:');
console.log(`- API URL: ${apiUrl}`);
console.log(`- Account: ${accountName}`);
console.log(`- Center ID: ${centerId}`);

/**
 * Get authentication token using password grant
 */
async function getAuthToken() {
  try {
    console.log('\nAttempting to get authentication token...');
    
    // Try password-based authentication first
    if (userName && password) {
      try {
        console.log('Using password-based authentication...');
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
          console.log('Successfully obtained token via password grant');
          return response.data.access_token;
        }
      } catch (error) {
        console.log('Password authentication failed:', error.message);
        if (error.response) {
          console.log('Status:', error.response.status);
          console.log('Data:', error.response.data);
        }
      }
    }
    
    // Try API key authentication as fallback
    if (apiKey && apiSecret) {
      try {
        console.log('Using API key authentication...');
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
          console.log('Successfully obtained token via API key');
          return response.data.access_token;
        }
      } catch (error) {
        console.log('API key authentication failed:', error.message);
        if (error.response) {
          console.log('Status:', error.response.status);
          console.log('Data:', error.response.data);
        }
      }
    }
    
    throw new Error('All authentication methods failed');
  } catch (error) {
    console.error('Failed to get authentication token:', error.message);
    return null;
  }
}

/**
 * List services from Zenoti
 */
async function listServices(token) {
  try {
    console.log('\nFetching services...');
    
    // Try the v1/centers/{centerId}/services endpoint
    try {
      const response = await axiosInstance.get(
        `${apiUrl}/v1/centers/${centerId}/services`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        }
      );
      
      console.log('Services found:', response.data.services?.length || 0);
      if (response.data.services?.length > 0) {
        console.log('First few services:');
        response.data.services.slice(0, 3).forEach(service => {
          console.log(`- ${service.name} (ID: ${service.id}, Price: ${service.price})`);
        });
      }
      return true;
    } catch (error) {
      console.log('Error with services endpoint:', error.message);
      if (error.response) {
        console.log('Status:', error.response.status);
        console.log('Data:', error.response.data);
      }
    }
    
    // Try alternative endpoint format
    try {
      const response = await axiosInstance.get(
        `${apiUrl}/v1/catalog/centers/${centerId}/services`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        }
      );
      
      console.log('Services found (alternative endpoint):', response.data.services?.length || 0);
      if (response.data.services?.length > 0) {
        console.log('First few services:');
        response.data.services.slice(0, 3).forEach(service => {
          console.log(`- ${service.name} (ID: ${service.id}, Price: ${service.price})`);
        });
      }
      return true;
    } catch (error) {
      console.log('Error with alternative services endpoint:', error.message);
      if (error.response) {
        console.log('Status:', error.response.status);
        console.log('Data:', error.response.data);
      }
    }
    
    return false;
  } catch (error) {
    console.error('Failed to list services:', error.message);
    return false;
  }
}

/**
 * List products from Zenoti
 */
async function listProducts(token) {
  try {
    console.log('\nFetching products...');
    
    // Try the v1/centers/{centerId}/products endpoint
    try {
      const response = await axiosInstance.get(
        `${apiUrl}/v1/centers/${centerId}/products`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        }
      );
      
      console.log('Products found:', response.data.products?.length || 0);
      if (response.data.products?.length > 0) {
        console.log('First few products:');
        response.data.products.slice(0, 3).forEach(product => {
          console.log(`- ${product.name} (ID: ${product.id}, Price: ${product.price})`);
        });
      }
      return true;
    } catch (error) {
      console.log('Error with products endpoint:', error.message);
      if (error.response) {
        console.log('Status:', error.response.status);
        console.log('Data:', error.response.data);
      }
    }
    
    // Try alternative endpoint format
    try {
      const response = await axiosInstance.get(
        `${apiUrl}/v1/catalog/centers/${centerId}/products`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        }
      );
      
      console.log('Products found (alternative endpoint):', response.data.products?.length || 0);
      if (response.data.products?.length > 0) {
        console.log('First few products:');
        response.data.products.slice(0, 3).forEach(product => {
          console.log(`- ${product.name} (ID: ${product.id}, Price: ${product.price})`);
        });
      }
      return true;
    } catch (error) {
      console.log('Error with alternative products endpoint:', error.message);
      if (error.response) {
        console.log('Status:', error.response.status);
        console.log('Data:', error.response.data);
      }
    }
    
    return false;
  } catch (error) {
    console.error('Failed to list products:', error.message);
    return false;
  }
}

/**
 * Main function
 */
async function main() {
  try {
    // Get authentication token
    const token = await getAuthToken();
    if (!token) {
      console.error('Could not obtain authentication token. Exiting.');
      return;
    }
    
    // Test services endpoints
    const servicesResult = await listServices(token);
    
    // Test products endpoints
    const productsResult = await listProducts(token);
    
    if (!servicesResult && !productsResult) {
      console.log('\nAll API endpoints failed. Please check:');
      console.log('1. Your center ID is correct');
      console.log('2. Your authentication credentials are valid');
      console.log('3. Your account has access to these API endpoints');
    }
    
  } catch (error) {
    console.error('Error in main function:', error.message);
  }
}

// Run the main function
main(); 