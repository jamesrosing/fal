import axios from 'axios';
import { withRetry } from './utils';

// Configure Zenoti API client
const zenotiClient = axios.create({
  baseURL: process.env.ZENOTI_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.ZENOTI_API_KEY}`,
    'X-Api-Key': process.env.ZENOTI_API_KEY,
    'X-Api-Secret': process.env.ZENOTI_API_SECRET,
    'X-Application-Id': process.env.ZENOTI_APPLICATION_ID,
    'Accept': 'application/json',
  },
  timeout: 15000, // 15-second timeout
});

// Request interceptor for debugging in development
if (process.env.NODE_ENV === 'development') {
  zenotiClient.interceptors.request.use((request) => {
    console.log('Zenoti API Request:', {
      method: request.method,
      url: request.url,
      headers: { ...request.headers, 'Authorization': '[REDACTED]' },
      data: request.data,
    });
    return request;
  });

  zenotiClient.interceptors.response.use(
    (response) => {
      console.log('Zenoti API Response:', {
        status: response.status,
        data: response.data,
      });
      return response;
    },
    (error) => {
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