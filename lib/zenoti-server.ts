import axios from 'axios';

const ZENOTI_API_URL = process.env.ZENOTI_API_URL;
const ZENOTI_API_KEY = process.env.ZENOTI_API_KEY;
const ZENOTI_API_SECRET = process.env.ZENOTI_API_SECRET;
const ZENOTI_APPLICATION_ID = process.env.ZENOTI_APPLICATION_ID;

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
        data: response.data,
      });
      return response;
    },
    error => {
      console.error('Zenoti API Error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      throw error;
    }
  );
}

export default zenotiClient; 