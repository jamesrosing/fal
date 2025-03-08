/**
 * Zenoti Token Generator
 * 
 * This script follows the exact format from the Zenoti documentation
 * to generate an access token.
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
const accountName = process.env.ZENOTI_ACCOUNT_NAME || 'alluremd';
const userName = process.env.ZENOTI_USER_NAME;
const password = process.env.ZENOTI_PASSWORD;

// Use the exact app_id and app_secret from the documentation
const documentationAppId = 'DB6D3C87-7913-43E3-81B6-08B0F1708D09';
const documentationAppSecret = '312a4d9488e04a829fe9dab88377e78f8e071240f3e241ca82e01c306e556599';
const documentationDeviceId = 'c113476f-04e1-484c-b887-57414441cdcf';

// Also try with our own credentials
const ownAppId = process.env.ZENOTI_APP_ID;
const ownAppSecret = process.env.ZENOTI_APP_SECRET || process.env.ZENOTI_APPLICATION_ID;
const ownDeviceId = process.env.ZENOTI_DEVICE_ID || 'web-app';

console.log('Zenoti Token Generator');
console.log('=====================');
console.log(`API URL: ${apiUrl}`);
console.log(`Account Name: ${accountName}`);
console.log(`User Name: ${userName}`);

/**
 * Generate token using the exact format from documentation
 */
async function generateTokenWithDocumentationCredentials() {
  console.log('\n1. Trying with documentation credentials:');
  console.log(`App ID: ${documentationAppId.substring(0, 8)}...`);
  console.log(`App Secret: ${documentationAppSecret.substring(0, 8)}...`);
  console.log(`Device ID: ${documentationDeviceId}`);
  
  try {
    const response = await axiosInstance.post(
      `${apiUrl}/v1/tokens`,
      {
        account_name: accountName,
        user_name: userName,
        password: password,
        grant_type: 'password',
        app_id: documentationAppId,
        app_secret: documentationAppSecret,
        device_id: documentationDeviceId
      },
      {
        headers: {
          'accept': 'application/json',
          'content-type': 'application/json'
        }
      }
    );
    
    console.log('Success! Token generated.');
    console.log('Access Token:', response.data.access_token);
    console.log('Token Type:', response.data.token_type);
    console.log('Expires:', response.data.access_token_expiry);
    console.log('Refresh Token:', response.data.refresh_token);
    
    return response.data;
  } catch (error) {
    console.log('Failed:', error.message);
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', error.response.data);
    }
    return null;
  }
}

/**
 * Generate token using our own credentials
 */
async function generateTokenWithOwnCredentials() {
  if (!ownAppId || !ownAppSecret) {
    console.log('\n2. Skipping own credentials (not set)');
    return null;
  }
  
  console.log('\n2. Trying with our own credentials:');
  console.log(`App ID: ${ownAppId.substring(0, 8)}...`);
  console.log(`App Secret: ${ownAppSecret.substring(0, 8)}...`);
  console.log(`Device ID: ${ownDeviceId}`);
  
  try {
    const response = await axiosInstance.post(
      `${apiUrl}/v1/tokens`,
      {
        account_name: accountName,
        user_name: userName,
        password: password,
        grant_type: 'password',
        app_id: ownAppId,
        app_secret: ownAppSecret,
        device_id: ownDeviceId
      },
      {
        headers: {
          'accept': 'application/json',
          'content-type': 'application/json'
        }
      }
    );
    
    console.log('Success! Token generated.');
    console.log('Access Token:', response.data.access_token);
    console.log('Token Type:', response.data.token_type);
    console.log('Expires:', response.data.access_token_expiry);
    console.log('Refresh Token:', response.data.refresh_token);
    
    return response.data;
  } catch (error) {
    console.log('Failed:', error.message);
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', error.response.data);
    }
    return null;
  }
}

/**
 * Try to get centers using the token
 */
async function getCentersWithToken(token) {
  if (!token) {
    console.log('No token available to test');
    return;
  }
  
  console.log('\nTesting token by getting centers...');
  try {
    const response = await axiosInstance.get(
      `${apiUrl}/v1/Centers`,
      {
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    console.log('Success! Centers retrieved.');
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
  } catch (error) {
    console.log('Failed to get centers:', error.message);
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', error.response.data);
    }
  }
}

/**
 * Main function
 */
async function main() {
  if (!userName || !password) {
    console.error('Username or password not set. Please check your .env.local file.');
    return;
  }
  
  // Try with documentation credentials
  const docToken = await generateTokenWithDocumentationCredentials();
  
  // Try with our own credentials
  const ownToken = await generateTokenWithOwnCredentials();
  
  // Test the token that worked
  const token = docToken?.access_token || ownToken?.access_token;
  if (token) {
    await getCentersWithToken(token);
  } else {
    console.log('\nFailed to generate token with both credential sets.');
    console.log('Please check:');
    console.log('1. Your account name, username, and password are correct');
    console.log('2. Your Zenoti account has API access enabled');
    console.log('3. Contact Zenoti support to verify the correct credentials');
  }
}

// Run the main function
main(); 