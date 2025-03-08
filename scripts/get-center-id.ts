import dotenv from 'dotenv';
import axios from 'axios';
import https from 'https';
import fs from 'fs';
import path from 'path';

// Load environment variables from .env.local
console.log('Loading environment variables...');
const result = dotenv.config({ path: '.env.local' });

if (result.error) {
  console.error('Error loading .env.local:', result.error);
} else {
  console.log('.env.local file loaded successfully');
}

// Read the .env.local file directly for debugging
try {
  const envPath = path.resolve(process.cwd(), '.env.local');
  console.log('Reading .env.local file from:', envPath);
  
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envLines = envContent.split('\n');
    
    // Extract Zenoti-related variables
    const zenotiVars: Record<string, string> = {};
    envLines.forEach(line => {
      if (line.trim().startsWith('ZENOTI_')) {
        const [key, ...valueParts] = line.split('=');
        const value = valueParts.join('=').trim();
        zenotiVars[key.trim()] = value;
        
        // Also set in process.env if not already set
        if (!process.env[key.trim()]) {
          process.env[key.trim()] = value;
        }
      }
    });
    
    console.log('\nZenoti variables found in .env.local:');
    Object.keys(zenotiVars).forEach(key => {
      const value = zenotiVars[key];
      // Mask sensitive values
      const maskedValue = key.includes('KEY') || key.includes('SECRET') || key.includes('PASSWORD') 
        ? value.substring(0, 4) + '...' + value.substring(value.length - 4)
        : value;
      console.log(`- ${key}: ${maskedValue}`);
    });
  } else {
    console.error('.env.local file not found');
  }
} catch (error) {
  console.error('Error reading .env.local file:', error);
}

// Create an axios instance with SSL verification disabled for development
const axiosInstance = axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false
  })
});

async function getCenters() {
  // Map possible alternative variable names
  if (!process.env.ZENOTI_APP_KEY && process.env.ZENOTI_APP_ID) {
    console.log('Using ZENOTI_APP_ID as ZENOTI_APP_KEY');
    process.env.ZENOTI_APP_KEY = process.env.ZENOTI_APP_ID;
  }
  
  if (!process.env.ZENOTI_APP_SECRET && process.env.ZENOTI_APPLICATION_ID) {
    console.log('Using ZENOTI_APPLICATION_ID as ZENOTI_APP_SECRET');
    process.env.ZENOTI_APP_SECRET = process.env.ZENOTI_APPLICATION_ID;
  }

  // Check required environment variables
  const requiredVars = ['ZENOTI_APP_KEY', 'ZENOTI_APP_SECRET'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error(`Missing required environment variables: ${missingVars.join(', ')}`);
    return;
  }

  // Try with both the configured API URL and the standard Zenoti API URL
  const apiUrls = [
    process.env.ZENOTI_API_URL || 'https://api.alluremd.zenoti.com',
    'https://api.zenoti.com'
  ];
  
  const appKey = process.env.ZENOTI_APP_KEY || '';
  const appSecret = process.env.ZENOTI_APP_SECRET || '';
  const accountName = process.env.ZENOTI_ACCOUNT_NAME || 'alluremd';
  const userName = process.env.ZENOTI_USER_NAME || '';
  const password = process.env.ZENOTI_PASSWORD || '';

  let success = false;

  for (const apiUrl of apiUrls) {
    console.log(`\nAttempting to connect to Zenoti API at: ${apiUrl}`);
    
    try {
      // Try the password-based authentication first if credentials are available
      if (userName && password) {
        console.log('Attempting password-based authentication...');
        try {
          const tokenResponse = await axiosInstance.post(
            `${apiUrl}/v1/tokens`,
            {
              account_name: accountName,
              user_name: userName,
              password: password,
              grant_type: 'password',
              app_id: appKey,
              app_secret: appSecret,
              device_id: process.env.ZENOTI_DEVICE_ID || 'web-app'
            },
            {
              headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }
            }
          );

          if (tokenResponse.status === 200 && tokenResponse.data.access_token) {
            const token = tokenResponse.data.access_token;
            console.log('Successfully obtained authentication token via password grant');
            
            // Get centers with this token
            const centersFound = await fetchCentersWithToken(apiUrl, token);
            if (centersFound) {
              success = true;
              break;
            }
          }
        } catch (authError: any) {
          console.log('Password-based authentication failed:', authError.message);
          if (authError.response) {
            console.log('Status:', authError.response.status);
            console.log('Data:', JSON.stringify(authError.response.data, null, 2));
          }
        }
      }

      // Fall back to client credentials if password auth failed or wasn't attempted
      console.log('Attempting client credentials authentication...');
      try {
        const tokenResponse = await axiosInstance.post(
          `${apiUrl}/oauth/token`,
          {
            grant_type: 'client_credentials',
            scope: 'integration'
          },
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Authorization': `Basic ${Buffer.from(`${appKey}:${appSecret}`).toString('base64')}`
            }
          }
        );

        if (tokenResponse.status === 200 && tokenResponse.data.access_token) {
          const token = tokenResponse.data.access_token;
          console.log('Successfully obtained authentication token via client credentials');

          // Get centers with this token
          const centersFound = await fetchCentersWithToken(apiUrl, token);
          if (centersFound) {
            success = true;
            break;
          }
        } else {
          console.error(`Failed to get token. Status: ${tokenResponse.status}`);
          console.error('Response:', JSON.stringify(tokenResponse.data, null, 2));
        }
      } catch (tokenError: any) {
        console.log('Client credentials authentication failed:', tokenError.message);
        if (tokenError.response) {
          console.log('Status:', tokenError.response.status);
          console.log('Data:', typeof tokenError.response.data === 'object' ? 
            JSON.stringify(tokenError.response.data, null, 2) : tokenError.response.data);
        }
      }
    } catch (error: any) {
      console.error('Error with API URL:', apiUrl);
      console.error('Error message:', error.message);
    }
  }

  if (!success) {
    console.error('\nFailed to connect to Zenoti API with all available methods.');
    console.log('\nTroubleshooting tips:');
    console.log('1. Verify your Zenoti account name, username, and password');
    console.log('2. Ensure your App ID/Key and App Secret are correct');
    console.log('3. Check if your Zenoti account has API access enabled');
    console.log('4. Contact Zenoti support to verify your API credentials');
  }
}

// Helper function to fetch centers with a token
async function fetchCentersWithToken(apiUrl: string, token: string): Promise<boolean> {
  console.log('Fetching centers...');
  
  // Try the v1/centers endpoint first
  try {
    const centersResponse = await axiosInstance.get(
      `${apiUrl}/v1/centers?catalog_enabled=false`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      }
    );

    if (centersResponse.status === 200) {
      const centers = centersResponse.data.centers || [];
      displayCenters(centers);
      return centers.length > 0;
    }
  } catch (error: any) {
    console.log('Error with v1/centers endpoint:', error.message);
  }

  // Fall back to v1/Centers endpoint
  try {
    const centersResponse = await axiosInstance.get(
      `${apiUrl}/v1/Centers`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (centersResponse.status === 200) {
      const centers = Array.isArray(centersResponse.data) ? 
        centersResponse.data : 
        (centersResponse.data.centers || []);
      displayCenters(centers);
      return centers.length > 0;
    } else {
      console.error(`Failed to get centers. Status: ${centersResponse.status}`);
      console.error('Response:', JSON.stringify(centersResponse.data, null, 2));
    }
  } catch (error: any) {
    console.error('Error with v1/Centers endpoint:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', typeof error.response.data === 'object' ? 
        JSON.stringify(error.response.data, null, 2) : error.response.data);
    }
  }

  return false;
}

// Helper function to display centers
function displayCenters(centers: any[]) {
  console.log('\nCenters found:');
  if (centers && centers.length > 0) {
    centers.forEach((center: any) => {
      console.log(`- ID: ${center.id}, Name: ${center.name}`);
    });
    
    // Look for Allure MD center
    const allureMD = centers.find((center: any) => 
      center.name.toLowerCase().includes('allure')
    );
    
    if (allureMD) {
      console.log('\nAllure MD Center ID:', allureMD.id);
      console.log('You should update your .env.local file with:');
      console.log(`ZENOTI_CENTER_ID=${allureMD.id}`);
    }
  } else {
    console.log('No centers found');
  }
}

// Execute the function
getCenters().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});