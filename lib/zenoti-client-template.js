/**
 * Zenoti API Client Template
 * 
 * This is a template for the Zenoti API client that can be updated
 * once the correct authentication method is determined.
 * 
 * IMPORTANT: This is just a template and should be updated with the
 * correct authentication method before use.
 * 
 * NOTE: This file is kept as JavaScript for reference purposes.
 * If this template becomes actively used in the project, it should
 * be converted to TypeScript (zenoti-client-template.ts) with proper
 * type definitions for better code quality and consistency.
 */

import axios from 'axios';

// Configuration options
const config = {
  apiUrl: process.env.ZENOTI_API_URL || 'https://api.zenoti.com',
  apiKey: process.env.ZENOTI_API_KEY,
  apiSecret: process.env.ZENOTI_API_SECRET,
  appId: process.env.ZENOTI_APP_ID,
  appSecret: process.env.ZENOTI_APP_SECRET || process.env.ZENOTI_APPLICATION_ID,
  accountName: process.env.ZENOTI_ACCOUNT_NAME,
  userName: process.env.ZENOTI_USER_NAME,
  password: process.env.ZENOTI_PASSWORD,
  centerId: process.env.ZENOTI_CENTER_ID,
  // Set to true to disable SSL verification in development
  disableSSLVerification: process.env.NODE_ENV !== 'production'
};

// Create axios instance
const createAxiosInstance = () => {
  const instance = axios.create({
    baseURL: config.apiUrl,
    timeout: 10000,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  });
  
  // Disable SSL verification in development if needed
  if (config.disableSSLVerification) {
    const https = require('https');
    instance.defaults.httpsAgent = new https.Agent({
      rejectUnauthorized: false
    });
  }
  
  return instance;
};

// Authentication methods - uncomment the one that works for your account

// Method 1: API Key in Authorization header
const getAuthHeaders1 = async () => {
  return {
    'Authorization': `apikey ${config.apiKey}`
  };
};

// Method 2: OAuth token with password grant
const getAuthHeaders2 = async () => {
  const instance = createAxiosInstance();
  const response = await instance.post('/v1/tokens', {
    account_name: config.accountName,
    user_name: config.userName,
    password: config.password,
    grant_type: 'password',
    app_id: config.appId,
    app_secret: config.appSecret,
    device_id: 'web-app'
  });
  
  return {
    'Authorization': `Bearer ${response.data.access_token}`
  };
};

// Method 3: OAuth token with client credentials
const getAuthHeaders3 = async () => {
  const instance = createAxiosInstance();
  const response = await instance.post('/oauth/token', 
    {
      grant_type: 'client_credentials',
      scope: 'integration'
    },
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${config.appId}:${config.appSecret}`).toString('base64')}`
      }
    }
  );
  
  return {
    'Authorization': `Bearer ${response.data.access_token}`
  };
};

// Choose the authentication method that works for your account
const getAuthHeaders = getAuthHeaders1; // Change this to the method that works

/**
 * Zenoti API Client
 */
class ZenotiClient {
  constructor() {
    this.axiosInstance = createAxiosInstance();
    this.cache = new Map();
    this.cacheTTL = 5 * 60 * 1000; // 5 minutes
  }
  
  /**
   * Make an authenticated API request
   */
  async request(method, endpoint, data = null) {
    try {
      const headers = await getAuthHeaders();
      
      const response = await this.axiosInstance.request({
        method,
        url: endpoint,
        headers,
        data: method !== 'GET' ? data : undefined,
        params: method === 'GET' ? data : undefined
      });
      
      return response.data;
    } catch (error) {
      console.error(`Zenoti API error (${method} ${endpoint}):`, error.message);
      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Data:', error.response.data);
      }
      throw error;
    }
  }
  
  /**
   * Get centers
   */
  async getCenters() {
    const cacheKey = 'centers';
    
    // Check cache
    if (this.cache.has(cacheKey)) {
      const { data, timestamp } = this.cache.get(cacheKey);
      if (Date.now() - timestamp < this.cacheTTL) {
        return data;
      }
    }
    
    const response = await this.request('GET', '/v1/Centers');
    const centers = Array.isArray(response) ? response : (response.centers || []);
    
    // Cache the result
    this.cache.set(cacheKey, {
      data: centers,
      timestamp: Date.now()
    });
    
    return centers;
  }
  
  /**
   * Get services for a center
   */
  async getServices(centerId = config.centerId) {
    const cacheKey = `services_${centerId}`;
    
    // Check cache
    if (this.cache.has(cacheKey)) {
      const { data, timestamp } = this.cache.get(cacheKey);
      if (Date.now() - timestamp < this.cacheTTL) {
        return data;
      }
    }
    
    try {
      const response = await this.request('GET', `/v1/Centers/${centerId}/services`);
      const services = response.services || [];
      
      // Cache the result
      this.cache.set(cacheKey, {
        data: services,
        timestamp: Date.now()
      });
      
      return services;
    } catch (error) {
      console.error(`Error getting services for center ${centerId}:`, error.message);
      return [];
    }
  }
  
  /**
   * Get products for a center
   */
  async getProducts(centerId = config.centerId) {
    const cacheKey = `products_${centerId}`;
    
    // Check cache
    if (this.cache.has(cacheKey)) {
      const { data, timestamp } = this.cache.get(cacheKey);
      if (Date.now() - timestamp < this.cacheTTL) {
        return data;
      }
    }
    
    try {
      const response = await this.request('GET', `/v1/Centers/${centerId}/products`);
      const products = response.products || [];
      
      // Cache the result
      this.cache.set(cacheKey, {
        data: products,
        timestamp: Date.now()
      });
      
      return products;
    } catch (error) {
      console.error(`Error getting products for center ${centerId}:`, error.message);
      return [];
    }
  }
  
  /**
   * Get providers for a center
   */
  async getProviders(centerId = config.centerId) {
    const cacheKey = `providers_${centerId}`;
    
    // Check cache
    if (this.cache.has(cacheKey)) {
      const { data, timestamp } = this.cache.get(cacheKey);
      if (Date.now() - timestamp < this.cacheTTL) {
        return data;
      }
    }
    
    try {
      const response = await this.request('GET', `/v1/Centers/${centerId}/therapists`);
      const providers = response.therapists || [];
      
      // Cache the result
      this.cache.set(cacheKey, {
        data: providers,
        timestamp: Date.now()
      });
      
      return providers;
    } catch (error) {
      console.error(`Error getting providers for center ${centerId}:`, error.message);
      return [];
    }
  }
  
  /**
   * Get available time slots for a service
   */
  async getAvailableSlots(serviceId, date, centerId = config.centerId) {
    try {
      const response = await this.request('GET', `/v1/Centers/${centerId}/services/${serviceId}/availability`, {
        date: date
      });
      
      return response.slots || [];
    } catch (error) {
      console.error(`Error getting available slots for service ${serviceId}:`, error.message);
      return [];
    }
  }
}

// Export a singleton instance
export const zenotiClient = new ZenotiClient();

// Export the class for testing or custom instances
export default ZenotiClient; 