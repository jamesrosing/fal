/**
 * Zenoti API Test Helper
 * 
 * This script helps generate authentication headers and test data
 * for use with Postman or similar API testing tools.
 */

// Load environment variables
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = resolve(__dirname, '..', '.env.local');

dotenv.config({ path: envPath });

// Print environment variables for verification
console.log('Zenoti Environment Variables:');
Object.keys(process.env)
  .filter(key => key.startsWith('ZENOTI_'))
  .forEach(key => {
    // Mask sensitive values
    const value = process.env[key];
    const maskedValue = key.includes('KEY') || key.includes('SECRET') || key.includes('PASSWORD') 
      ? value.substring(0, 4) + '...' + value.substring(value.length - 4)
      : value;
    console.log(`- ${key}: ${maskedValue}`);
  });

// Generate Basic Auth header for client credentials
const appKey = process.env.ZENOTI_APP_KEY || process.env.ZENOTI_APP_ID;
const appSecret = process.env.ZENOTI_APP_SECRET || process.env.ZENOTI_APPLICATION_ID;

if (appKey && appSecret) {
  const basicAuth = Buffer.from(`${appKey}:${appSecret}`).toString('base64');
  console.log('\nFor Client Credentials Authentication:');
  console.log('URL: https://api.alluremd.zenoti.com/oauth/token');
  console.log('Method: POST');
  console.log('Headers:');
  console.log('  Content-Type: application/x-www-form-urlencoded');
  console.log(`  Authorization: Basic ${basicAuth}`);
  console.log('Body (x-www-form-urlencoded):');
  console.log('  grant_type: client_credentials');
  console.log('  scope: integration');
}

// Generate password auth body
const accountName = process.env.ZENOTI_ACCOUNT_NAME;
const userName = process.env.ZENOTI_USER_NAME;
const password = process.env.ZENOTI_PASSWORD;
const deviceId = process.env.ZENOTI_DEVICE_ID || 'web-app';

if (accountName && userName && password) {
  console.log('\nFor Password Authentication:');
  console.log('URL: https://api.alluremd.zenoti.com/v1/tokens');
  console.log('Method: POST');
  console.log('Headers:');
  console.log('  Content-Type: application/json');
  console.log('  Accept: application/json');
  console.log('Body (raw JSON):');
  
  // Create a copy of the data with masked sensitive values for display
  const displayData = {
    account_name: accountName,
    user_name: userName,
    password: password.substring(0, 4) + '...' + password.substring(password.length - 4),
    grant_type: 'password',
    app_id: appKey ? appKey.substring(0, 8) + '...' : undefined,
    app_secret: appSecret ? appSecret.substring(0, 8) + '...' : undefined,
    device_id: deviceId
  };
  
  console.log(JSON.stringify(displayData, null, 2));
  
  console.log('\nNote: The actual values (not the masked ones shown above) should be used in your requests.');
}

console.log('\nInstructions:');
console.log('1. Copy the appropriate authentication details above');
console.log('2. Use them in Postman or another API testing tool');
console.log('3. If you get a token, use it in the Authorization header for subsequent requests:');
console.log('   Authorization: Bearer YOUR_TOKEN_HERE');
console.log('\nCommon Zenoti API Endpoints to Try:');
console.log('- GET https://api.alluremd.zenoti.com/v1/centers');
console.log('- GET https://api.alluremd.zenoti.com/v1/Centers'); 