/**
 * Zenoti Integration Test
 * 
 * This script tests the Zenoti integration by attempting to connect
 * to the API and retrieve data using our client.
 */

import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import dotenv from 'dotenv';
import { zenotiClient } from '../lib/zenoti-client.ts';
import { testConnection } from '../lib/zenoti.ts';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = resolve(__dirname, '..', '.env.local');

dotenv.config({ path: envPath });

// Print environment variables (masked)
console.log('Zenoti Environment Variables:');
const envVars = [
  'ZENOTI_API_URL',
  'ZENOTI_ACCOUNT_NAME',
  'ZENOTI_USER_NAME',
  'ZENOTI_PASSWORD',
  'ZENOTI_APP_ID',
  'ZENOTI_APP_SECRET',
  'ZENOTI_APPLICATION_ID',
  'ZENOTI_API_KEY',
  'ZENOTI_API_SECRET',
  'ZENOTI_DEVICE_ID',
  'ZENOTI_CENTER_ID'
];

envVars.forEach(key => {
  const value = process.env[key];
  if (value) {
    const maskedValue = key.includes('KEY') || key.includes('SECRET') || key.includes('PASSWORD') 
      ? value.substring(0, 4) + '...' + value.substring(value.length - 4)
      : value;
    console.log(`- ${key}: ${maskedValue}`);
  } else {
    console.log(`- ${key}: Not set`);
  }
});

/**
 * Run tests
 */
async function runTests() {
  console.log('\n=== Running Zenoti Integration Tests ===\n');
  
  // Test 1: Connection Test
  console.log('Test 1: Connection Test');
  try {
    const result = await testConnection();
    console.log('Result:', result);
    if (result.success) {
      console.log('✅ Connection test passed');
      console.log(`Found ${result.serviceCount} services and ${result.providerCount} providers`);
    } else {
      console.log('❌ Connection test failed');
      console.log('Message:', result.message);
    }
  } catch (error) {
    console.error('❌ Connection test failed with error:', error.message);
  }
  
  // Test 2: Get Centers
  console.log('\nTest 2: Get Centers');
  try {
    const centers = await zenotiClient.getCenters();
    console.log(`Found ${centers.length} centers`);
    if (centers.length > 0) {
      console.log('First center:', centers[0]);
      console.log('✅ Get centers test passed');
    } else {
      console.log('⚠️ No centers found, but API call succeeded');
    }
  } catch (error) {
    console.error('❌ Get centers test failed with error:', error.message);
  }
  
  // Test 3: Get Services
  console.log('\nTest 3: Get Services');
  try {
    const services = await zenotiClient.getServices();
    console.log(`Found ${services.length} services`);
    if (services.length > 0) {
      console.log('First service:', services[0]);
      console.log('✅ Get services test passed');
    } else {
      console.log('⚠️ No services found, but API call succeeded');
    }
  } catch (error) {
    console.error('❌ Get services test failed with error:', error.message);
  }
  
  // Test 4: Get Providers
  console.log('\nTest 4: Get Providers');
  try {
    const providers = await zenotiClient.getProviders();
    console.log(`Found ${providers.length} providers`);
    if (providers.length > 0) {
      console.log('First provider:', providers[0]);
      console.log('✅ Get providers test passed');
    } else {
      console.log('⚠️ No providers found, but API call succeeded');
    }
  } catch (error) {
    console.error('❌ Get providers test failed with error:', error.message);
  }
  
  console.log('\n=== Zenoti Integration Tests Complete ===');
}

// Run the tests
runTests().catch(error => {
  console.error('Unhandled error in tests:', error);
  process.exit(1);
}); 