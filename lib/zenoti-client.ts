/**
 * Zenoti API Client
 * 
 * This client handles authentication and API calls to the Zenoti API.
 * 
 * IMPORTANT: This client requires proper API credentials from Zenoti.
 * Contact Zenoti support if you encounter authentication issues.
 */

import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import https from 'https';

// Configuration interface
interface ZenotiConfig {
  apiUrl: string;
  accountName: string;
  userName: string;
  password: string;
  appId: string;
  appSecret: string;
  apiKey: string;
  apiSecret: string;
  deviceId: string;
  centerId: string;
  disableSSLVerification: boolean;
}

// Default configuration
const defaultConfig: ZenotiConfig = {
  apiUrl: process.env.ZENOTI_API_URL || 'https://api.alluremd.zenoti.com',
  accountName: process.env.ZENOTI_ACCOUNT_NAME || 'alluremd',
  userName: process.env.ZENOTI_USER_NAME || '',
  password: process.env.ZENOTI_PASSWORD || '',
  appId: process.env.ZENOTI_APP_ID || '',
  appSecret: process.env.ZENOTI_APP_SECRET || process.env.ZENOTI_APPLICATION_ID || '',
  apiKey: process.env.ZENOTI_API_KEY || '',
  apiSecret: process.env.ZENOTI_API_SECRET || '',
  deviceId: process.env.ZENOTI_DEVICE_ID || 'web-app',
  centerId: process.env.ZENOTI_CENTER_ID || '',
  disableSSLVerification: process.env.NODE_ENV !== 'production'
};

// Cache interface
interface CacheItem<T> {
  data: T;
  timestamp: number;
}

/**
 * Zenoti API Client
 */
export class ZenotiClient {
  private config: ZenotiConfig;
  private axiosInstance: AxiosInstance;
  private cache: Map<string, CacheItem<any>>;
  private cacheTTL: number;
  private token: string | null = null;
  private tokenExpiry: Date | null = null;

  /**
   * Constructor
   */
  constructor(config: Partial<ZenotiConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
    this.axiosInstance = this.createAxiosInstance();
    this.cache = new Map();
    this.cacheTTL = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Create axios instance
   */
  private createAxiosInstance(): AxiosInstance {
    const instance = axios.create({
      baseURL: this.config.apiUrl,
      timeout: 10000,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    // Disable SSL verification in development if needed
    if (this.config.disableSSLVerification) {
      instance.defaults.httpsAgent = new https.Agent({
        rejectUnauthorized: false
      });
    }
    
    return instance;
  }

  /**
   * Get authentication token
   */
  private async getToken(): Promise<string> {
    // Check if we have a valid token
    if (this.token && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return this.token;
    }
    
    try {
      // Try with password grant first
      if (this.config.userName && this.config.password) {
        try {
          const response = await this.axiosInstance.post('/v1/tokens', {
            account_name: this.config.accountName,
            user_name: this.config.userName,
            password: this.config.password,
            grant_type: 'password',
            app_id: this.config.appId,
            app_secret: this.config.appSecret,
            device_id: this.config.deviceId
          });
          
          if (response.data.access_token) {
            this.token = response.data.access_token;
            
            // Set token expiry (subtract 5 minutes for safety)
            if (response.data.access_token_expiry) {
              this.tokenExpiry = new Date(response.data.access_token_expiry);
              this.tokenExpiry.setMinutes(this.tokenExpiry.getMinutes() - 5);
            } else {
              // Default to 24 hours minus 5 minutes if expiry not provided
              this.tokenExpiry = new Date();
              this.tokenExpiry.setHours(this.tokenExpiry.getHours() + 23, this.tokenExpiry.getMinutes() + 55);
            }
            
            return response.data.access_token;
          }
        } catch (error) {
          console.log('Password authentication failed, trying API key authentication');
        }
      }
      
      // Try with API key authentication
      if (this.config.apiKey && this.config.apiSecret) {
        try {
          const response = await this.axiosInstance.post(
            '/oauth/token',
            {
              grant_type: 'client_credentials',
              scope: 'integration'
            },
            {
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${Buffer.from(`${this.config.apiKey}:${this.config.apiSecret}`).toString('base64')}`
              }
            }
          );
          
          if (response.data.access_token) {
            this.token = response.data.access_token;
            
            // Set token expiry (subtract 5 minutes for safety)
            if (response.data.expires_in) {
              this.tokenExpiry = new Date();
              this.tokenExpiry.setSeconds(this.tokenExpiry.getSeconds() + response.data.expires_in - 300);
            } else {
              // Default to 1 hour minus 5 minutes if expiry not provided
              this.tokenExpiry = new Date();
              this.tokenExpiry.setMinutes(this.tokenExpiry.getMinutes() + 55);
            }
            
            return response.data.access_token;
          }
        } catch (error) {
          console.log('API key authentication failed');
        }
      }
      
      // If we get here, all authentication methods failed
      throw new Error('All authentication methods failed');
    } catch (error: any) {
      console.error('Failed to get Zenoti authentication token:', error.message);
      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Data:', error.response.data);
      }
      throw new Error('Failed to authenticate with Zenoti API');
    }
  }

  /**
   * Make an authenticated API request
   */
  private async request<T>(method: string, endpoint: string, data: any = null): Promise<T> {
    try {
      // Try to get a token first
      let headers: Record<string, string> = {
        'Accept': 'application/json'
      };
      
      try {
        const token = await this.getToken();
        headers['Authorization'] = `Bearer ${token}`;
      } catch (error) {
        // If token authentication fails, try direct API key
        if (this.config.apiKey) {
          headers['Authorization'] = `apikey ${this.config.apiKey}`;
        } else {
          throw error;
        }
      }
      
      const config: AxiosRequestConfig = {
        method,
        url: endpoint,
        headers
      };
      
      if (method !== 'GET' && data) {
        config.data = data;
      } else if (method === 'GET' && data) {
        config.params = data;
      }
      
      const response = await this.axiosInstance.request<T>(config);
      return response.data;
    } catch (error: any) {
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
      const { data, timestamp } = this.cache.get(cacheKey)!;
      if (Date.now() - timestamp < this.cacheTTL) {
        return data;
      }
    }
    
    try {
      const response = await this.request<any>('GET', '/v1/Centers');
      const centers = Array.isArray(response) ? response : (response.centers || []);
      
      // Cache the result
      this.cache.set(cacheKey, {
        data: centers,
        timestamp: Date.now()
      });
      
      return centers;
    } catch (error) {
      console.error('Error getting centers:', error);
      return [];
    }
  }

  /**
   * Get services for a center
   */
  async getServices(centerId: string = this.config.centerId) {
    const cacheKey = `services_${centerId}`;
    
    // Check cache
    if (this.cache.has(cacheKey)) {
      const { data, timestamp } = this.cache.get(cacheKey)!;
      if (Date.now() - timestamp < this.cacheTTL) {
        return data;
      }
    }
    
    try {
      const response = await this.request<any>('GET', `/v1/Centers/${centerId}/services`);
      const services = response.services || [];
      
      // Cache the result
      this.cache.set(cacheKey, {
        data: services,
        timestamp: Date.now()
      });
      
      return services;
    } catch (error) {
      console.error(`Error getting services for center ${centerId}:`, error);
      return [];
    }
  }

  /**
   * Get providers (therapists) for a center
   */
  async getProviders(centerId: string = this.config.centerId) {
    const cacheKey = `providers_${centerId}`;
    
    // Check cache
    if (this.cache.has(cacheKey)) {
      const { data, timestamp } = this.cache.get(cacheKey)!;
      if (Date.now() - timestamp < this.cacheTTL) {
        return data;
      }
    }
    
    try {
      const response = await this.request<any>('GET', `/v1/Centers/${centerId}/therapists`);
      const providers = response.therapists || [];
      
      // Cache the result
      this.cache.set(cacheKey, {
        data: providers,
        timestamp: Date.now()
      });
      
      return providers;
    } catch (error) {
      console.error(`Error getting providers for center ${centerId}:`, error);
      return [];
    }
  }

  /**
   * Get available time slots for a service
   */
  async getAvailableSlots(serviceId: string, date: string, centerId: string = this.config.centerId) {
    try {
      const response = await this.request<any>('GET', `/v1/Centers/${centerId}/services/${serviceId}/availability`, {
        date
      });
      
      return response.slots || [];
    } catch (error) {
      console.error(`Error getting available slots for service ${serviceId}:`, error);
      return [];
    }
  }

  /**
   * Make a direct GET request
   */
  async get(url: string, config: AxiosRequestConfig = {}) {
    return this.request('GET', url, config.params);
  }

  /**
   * Make a direct POST request
   */
  async post(url: string, data: any, config: AxiosRequestConfig = {}) {
    return this.request('POST', url, data);
  }

  /**
   * Make a direct DELETE request
   */
  async delete(url: string, config: AxiosRequestConfig = {}) {
    return this.request('DELETE', url, config.data);
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
  }
}

// Export a singleton instance
export const zenotiClient = new ZenotiClient();

// Export the class for testing or custom instances
export default ZenotiClient;