/**
 * Zenoti API Client
 *
 * This client handles authentication and API calls to the Zenoti API.
 *
 * IMPORTANT: This client requires proper API credentials from Zenoti.
 * Contact Zenoti support if you encounter authentication issues.
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
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

// Token response interface
interface TokenResponse {
  access_token: string;
  access_token_expiry?: string;
  expires_in?: number;
  refresh_token?: string;
  refresh_token_expiry?: string;
  token_type: string;
  token_id?: string;
  app_id?: string;
  user_type?: 'Guest' | 'Employee';
}

// Center interface
interface Center {
  id: string;
  name: string;
  address?: string;
  working_hours?: any;
}

// Cache interface
interface CacheItem<T> {
  data: T;
  timestamp: number;
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
  disableSSLVerification: process.env.NODE_ENV !== 'production',
};

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
  private refreshToken: string | null = null;
  private refreshTokenExpiry: Date | null = null;
  private tokenType: string | null = null;
  private userType: 'Guest' | 'Employee' | null = null;

  /**
   * Constructor
   */
  constructor(config: Partial<ZenotiConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
    this.axiosInstance = this.createAxiosInstance();
    this.cache = new Map();
    this.cacheTTL = 5 * 60 * 1000; // 5 minutes

    // Log environment variables status (without exposing sensitive data)
    console.log('Zenoti API Environment Variables Status:', {
      ZENOTI_API_URL: this.config.apiUrl ? '✓ Set' : '✗ Missing',
      ZENOTI_ACCOUNT_NAME: this.config.accountName ? '✓ Set' : '✗ Missing',
      ZENOTI_USER_NAME: this.config.userName ? '✓ Set' : '✗ Missing',
      ZENOTI_PASSWORD: this.config.password ? '✓ Set' : '✗ Missing',
      ZENOTI_APP_ID: this.config.appId ? '✓ Set' : '✗ Missing',
      ZENOTI_API_KEY: this.config.apiKey ? '✓ Set' : '✗ Missing',
      ZENOTI_API_SECRET: this.config.apiSecret ? '✓ Set' : '✗ Missing',
      ZENOTI_DEVICE_ID: this.config.deviceId ? '✓ Set' : '✗ Missing',
      ZENOTI_CENTER_ID: this.config.centerId ? '✓ Set' : '✗ Missing',
    });
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
        'Content-Type': 'application/json',
      },
    });

    // Disable SSL verification in development if needed
    if (this.config.disableSSLVerification) {
      instance.defaults.httpsAgent = new https.Agent({
        rejectUnauthorized: false,
      });
    }

    // Add request interceptor for logging
    instance.interceptors.request.use((config: AxiosRequestConfig) => {
      console.log('Zenoti API Request:', {
        method: config.method,
        url: config.url,
        baseURL: config.baseURL,
        headers: {
          ...Object.keys(config.headers || {}).reduce((acc: Record<string, string>, key: string) => {
            if (['authorization', 'x-api-key', 'x-api-secret'].includes(key.toLowerCase())) {
              acc[key] = '[REDACTED]';
            } else if (config.headers && typeof config.headers === 'object') {
              const headers = config.headers as Record<string, any>;
              acc[key] = headers[key];
            }
            return acc;
          }, {}),
        },
        data: config.data,
        timeout: config.timeout,
      });
      return config;
    });

    // Add response interceptor for logging
    instance.interceptors.response.use(
      (response: AxiosResponse) => {
        console.log('Zenoti API Response:', {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
          data: response.data,
          config: {
            url: response.config.url,
            method: response.config.method,
          },
        });
        return response;
      },
      (error: any) => {
        console.error('Zenoti API Error:', {
          message: error.message,
          code: error.code,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          headers: error.response?.headers,
          config: {
            url: error.config?.url,
            baseURL: error.config?.baseURL,
            method: error.config?.method,
            timeout: error.config?.timeout,
          },
        });
        throw error;
      }
    );

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
      // Try refreshing with refresh token if available
      if (this.refreshToken && this.refreshTokenExpiry && new Date() < this.refreshTokenExpiry) {
        try {
          await this.refreshWithToken();
          if (this.token) return this.token;
        } catch (error) {
          console.log('Refresh token failed, generating new token:', error);
        }
      }

      // Try generating a new token with password grant
      if (this.config.userName && this.config.password) {
        try {
          const response = await this.axiosInstance.post('/v1/tokens', {
            account_name: this.config.accountName,
            user_name: this.config.userName,
            password: this.config.password,
            grant_type: 'password',
            app_id: this.config.appId,
            app_secret: this.config.appSecret,
            device_id: this.config.deviceId,
          });

          if (response.data.access_token) {
            this.token = response.data.access_token;
            this.tokenType = response.data.token_type || 'Bearer';
            this.userType = response.data.user_type || null;
            this.refreshToken = response.data.refresh_token || null;
            this.refreshTokenExpiry = response.data.refresh_token_expiry
              ? new Date(response.data.refresh_token_expiry)
              : null;

            // Set token expiry (subtract 5 minutes for safety)
            if (response.data.access_token_expiry) {
              this.tokenExpiry = new Date(response.data.access_token_expiry);
              this.tokenExpiry.setMinutes(this.tokenExpiry.getMinutes() - 5);
            } else if (response.data.expires_in) {
              this.tokenExpiry = new Date();
              this.tokenExpiry.setSeconds(this.tokenExpiry.getSeconds() + response.data.expires_in - 300);
            } else {
              // Default to 24 hours minus 5 minutes if expiry not provided
              this.tokenExpiry = new Date();
              this.tokenExpiry.setHours(this.tokenExpiry.getHours() + 23, this.tokenExpiry.getMinutes() + 55);
            }

            console.log('Token generated successfully:', {
              userType: this.userType,
              tokenType: this.tokenType,
              expiresAt: this.tokenExpiry.toISOString(),
            });

            return this.token;
          }
        } catch (error) {
          console.log('Password authentication failed, trying API key:', error);
        }
      }

      // Try with API key authentication
      if (this.config.apiKey) {
        console.log('Using API key authentication');
        return this.config.apiKey; // We'll use 'apikey' prefix in the request
      }

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
   * Refresh token using refresh token
   */
  private async refreshWithToken(): Promise<void> {
    if (!this.refreshToken || !this.refreshTokenExpiry) {
      throw new Error('No refresh token available');
    }

    if (new Date() >= this.refreshTokenExpiry) {
      throw new Error('Refresh token has expired');
    }

    try {
      const response = await this.axiosInstance.post('/v1/tokens/refresh', {
        refresh_token: this.refreshToken,
        app_id: this.config.appId,
        app_secret: this.config.appSecret,
      });

      if (response.data.access_token) {
        this.token = response.data.access_token;
        this.tokenType = response.data.token_type || 'Bearer';
        this.userType = response.data.user_type || null;
        this.refreshToken = response.data.refresh_token || null;
        this.refreshTokenExpiry = response.data.refresh_token_expiry
          ? new Date(response.data.refresh_token_expiry)
          : null;

        if (response.data.access_token_expiry) {
          this.tokenExpiry = new Date(response.data.access_token_expiry);
          this.tokenExpiry.setMinutes(this.tokenExpiry.getMinutes() - 5);
        } else if (response.data.expires_in) {
          this.tokenExpiry = new Date();
          this.tokenExpiry.setSeconds(this.tokenExpiry.getSeconds() + response.data.expires_in - 300);
        } else {
          this.tokenExpiry = new Date();
          this.tokenExpiry.setHours(this.tokenExpiry.getHours() + 23, this.tokenExpiry.getMinutes() + 55);
        }

        console.log('Token refreshed successfully:', {
          userType: this.userType,
          tokenType: this.tokenType,
          expiresAt: this.tokenExpiry.toISOString(),
        });
      }
    } catch (error) {
      console.error('Failed to refresh token:', error);
      throw error;
    }
  }

  /**
   * Make an authenticated API request
   */
  private async request<T>(method: string, endpoint: string, data: any = null): Promise<T> {
    try {
      const token = await this.getToken();
      const headers: Record<string, string> = {
        'Accept': 'application/json',
      };

      if (token === this.config.apiKey) {
        headers['Authorization'] = `apikey ${token}`;
      } else {
        headers['Authorization'] = `${this.tokenType} ${token}`;
      }

      const config: AxiosRequestConfig = {
        method,
        url: endpoint,
        headers,
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
  async getCenters(catalogEnabled: boolean = false, expand: string = 'working_hours') {
    const cacheKey = `centers_${catalogEnabled}_${expand}`;

    // Check cache
    if (this.cache.has(cacheKey)) {
      const { data, timestamp } = this.cache.get(cacheKey)!;
      if (Date.now() - timestamp < this.cacheTTL) {
        return data;
      }
    }

    try {
      const response = await this.request<any>('GET', `/v1/centers?catalog_enabled=${catalogEnabled}&expand=${expand}`);
      const centers = Array.isArray(response) ? response : (response.centers || []);

      // Cache the result
      this.cache.set(cacheKey, {
        data: centers,
        timestamp: Date.now(),
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
      const response = await this.request<any>('GET', `/v1/centers/${centerId}/services`);
      const services = response.services || [];

      // Cache the result
      this.cache.set(cacheKey, {
        data: services,
        timestamp: Date.now(),
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
      const response = await this.request<any>('GET', `/v1/centers/${centerId}/therapists`);
      const providers = response.therapists || [];

      // Cache the result
      this.cache.set(cacheKey, {
        data: providers,
        timestamp: Date.now(),
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
      const response = await this.request<any>('GET', `/v1/centers/${centerId}/services/${serviceId}/availability`, {
        date,
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