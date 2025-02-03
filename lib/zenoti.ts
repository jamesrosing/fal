// lib/zenoti.ts
import axios from 'axios';

const zenotiClient = axios.create({
  baseURL: process.env.ZENOTI_API_URL || 'https://api.zenoti.com',
  headers: {
    'Content-Type': 'application/json',
    'x-zenoti-api-key': process.env.ZENOTI_API_KEY,
    'x-zenoti-api-secret': process.env.ZENOTI_API_SECRET,
    'x-zenoti-application-id': process.env.ZENOTI_APPLICATION_ID,
  },
});

// Response interceptor for rate limit logging and error handling
zenotiClient.interceptors.response.use(
  (response) => {
    const limit = response.headers['x-ratelimit-limit'];
    const remaining = response.headers['x-ratelimit-remaining'];
    const reset = response.headers['x-ratelimit-reset'];
    console.log(`Zenoti Rate Limit: Limit=${limit}, Remaining=${remaining}, Reset=${reset}`);
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 429) {
      const reset = error.response.headers['x-ratelimit-reset'];
      console.error(`Rate limit exceeded. Try again after ${reset} seconds.`);
      return Promise.reject(new Error(`Zenoti API rate limit exceeded. Please try again after ${reset} seconds.`));
    }
    return Promise.reject(error);
  }
);

export default zenotiClient;
