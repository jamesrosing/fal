import axios from 'axios';

const ZENOTI_API_URL = process.env.ZENOTI_API_URL;
const ZENOTI_API_KEY = process.env.ZENOTI_API_KEY;
const ZENOTI_API_SECRET = process.env.ZENOTI_API_SECRET;
const ZENOTI_APPLICATION_ID = process.env.ZENOTI_APP_ID;

if (!ZENOTI_API_URL || !ZENOTI_API_KEY || !ZENOTI_API_SECRET || !ZENOTI_APPLICATION_ID) {
  throw new Error('Missing required Zenoti environment variables');
}

const zenotiClient = axios.create({
  baseURL: ZENOTI_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${ZENOTI_API_KEY}`,
    'X-Api-Key': ZENOTI_API_KEY,
    'X-Api-Secret': ZENOTI_API_SECRET,
    'X-Application-Id': ZENOTI_APPLICATION_ID,
    'Accept': 'application/json',
  },
  timeout: 15000, // 15 second timeout
});

// Add request interceptor for logging
if (process.env.NODE_ENV === 'development') {
  zenotiClient.interceptors.request.use(request => {
    console.log('Zenoti API Request:', {
      method: request.method,
      url: request.url,
      headers: {
        ...request.headers,
        'Authorization': '[REDACTED]',
        'X-Api-Key': '[REDACTED]',
        'X-Api-Secret': '[REDACTED]',
      },
      data: request.data,
    });
    return request;
  });

  zenotiClient.interceptors.response.use(
    response => {
      console.log('Zenoti API Response:', {
        status: response.status,
        statusText: response.statusText,
        data: response.data,
        url: response.config?.url,
      });
      return response;
    },
    error => {
      console.error('Zenoti API Error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        url: error.config?.url,
        method: error.config?.method,
        credentials: {
          apiKeyLength: ZENOTI_API_KEY?.length || 0,
          apiSecretLength: ZENOTI_API_SECRET?.length || 0,
          applicationIdLength: ZENOTI_APPLICATION_ID?.length || 0,
          apiUrlPresent: !!ZENOTI_API_URL
        }
      });

      // Enhance error object with more details
      if (error.response) {
        error.zenotiDetails = {
          endpoint: error.config?.url,
          statusCode: error.response.status,
          message: error.response.data?.message || error.message,
          errors: error.response.data?.errors,
          timestamp: new Date().toISOString()
        };
      }
      
      throw error;
    }
  );
}

/**
 * Utility for retrying failed requests
 */
export async function withRetry<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    if (retries <= 0 || (error.response && error.response.status === 401)) {
      throw error; // Don't retry auth errors or if no retries left
    }
    
    console.log(`Retrying failed request, ${retries} attempts remaining...`);
    await new Promise(resolve => setTimeout(resolve, delay));
    return withRetry(fn, retries - 1, delay * 1.5); // Exponential backoff
  }
}

export default zenotiClient; 