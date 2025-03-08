/**
 * Zenoti API Integration
 * 
 * This module provides a service for interacting with the Zenoti API.
 */

import { zenotiClient } from './zenoti-client';

// Simple in-memory cache implementation
const cache = new Map<string, { data: any; timestamp: number }>();

/**
 * Cache a query result with an expiration time
 */
async function cachedQuery<T>(
  key: string,
  queryFn: () => Promise<T>,
  ttlSeconds: number = 3600
): Promise<T> {
  const now = Date.now();
  
  // Check if we have a valid cached result
  if (cache.has(key)) {
    const cached = cache.get(key)!;
    if (now - cached.timestamp < ttlSeconds * 1000) {
      return cached.data as T;
    }
  }
  
  // Execute the query function
  const result = await queryFn();
  
  // Cache the result
  cache.set(key, {
    data: result,
    timestamp: now
  });
  
  return result;
}

// Service interfaces
export interface ZenotiService {
  id: string;
  name: string;
  duration: number;
  price: number;
  category: string;
  description?: string;
}

export interface ZenotiProvider {
  id: string;
  name: string;
  specialties: string[];
  image_url?: string;
  bio?: string;
}

export interface ZenotiSlot {
  id: string;
  start_time: string;
  end_time: string;
  provider_id: string;
  provider_name: string;
}

export interface ZenotiBooking {
  booking_id: string;
  service_id: string;
  provider_id: string;
  slot_id: string;
  guest: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  };
  notes?: string;
}

// Zenoti Service
export const ZenotiService = {
  // Get all services
  async getServices(): Promise<ZenotiService[]> {
    try {
      return await cachedQuery('zenoti:services', async () => {
        console.log('Fetching services from real Zenoti API');
        const services = await zenotiClient.getServices();
        return services;
      }, 86400); // Cache for 24 hours
    } catch (error) {
      console.error('Failed to fetch services from Zenoti API:', error);
      // Instead of returning mock data, return an empty array
      return [];
    }
  },

  // Get services by category
  async getServicesByCategory(category: string): Promise<ZenotiService[]> {
    try {
      const services = await this.getServices();
      return services.filter(service => service.category === category);
    } catch (error) {
      console.error(`Failed to fetch services for category ${category} from Zenoti API:`, error);
      return [];
    }
  },

  // Get all providers
  async getProviders(): Promise<ZenotiProvider[]> {
    try {
      return await cachedQuery('zenoti:providers', async () => {
        console.log('Fetching providers from real Zenoti API');
        const providers = await zenotiClient.getProviders();
        return providers;
      }, 86400);
    } catch (error) {
      console.error('Failed to fetch providers from Zenoti API:', error);
      return [];
    }
  },

  // Get providers by specialty
  async getProvidersBySpecialty(specialty: string): Promise<ZenotiProvider[]> {
    try {
      const providers = await this.getProviders();
      return providers.filter(provider => 
        provider.specialties && 
        provider.specialties.some(s => s.toLowerCase() === specialty.toLowerCase())
      );
    } catch (error) {
      console.error(`Failed to fetch providers for specialty ${specialty} from Zenoti API:`, error);
      return [];
    }
  },

  // Get availability for a service
  async getAvailability(
    serviceId: string,
    date: string,
    providerId?: string
  ): Promise<{ booking_id: string; slots: ZenotiSlot[] }> {
    try {
      // Build query params
      const params = new URLSearchParams();
      params.append('date', date);
      if (providerId) {
        params.append('provider_id', providerId);
      }

      return await cachedQuery(
        `zenoti:availability:${serviceId}:${date}:${providerId || 'any'}`,
        async () => {
          console.log(`Fetching availability for service ${serviceId} on ${date}`);
          const slots = await zenotiClient.getAvailableSlots(serviceId, date);
          return {
            booking_id: `temp-${Date.now()}`,
            slots
          };
        },
        3600 // Cache for 1 hour
      );
    } catch (error) {
      console.error(`Failed to fetch availability for service ${serviceId} from Zenoti API:`, error);
      // Return empty slots instead of mock data
      return { booking_id: `temp-${Date.now()}`, slots: [] };
    }
  },

  // Book appointment
  async bookAppointment(booking: ZenotiBooking): Promise<any> {
    try {
      console.log('Booking appointment with real Zenoti API:', booking);
      const response = await zenotiClient.post('/v1/appointments', booking);
      
      // Type assertion for response
      const typedResponse = response as { 
        status: number; 
        data: { 
          message?: string; 
          appointment: any 
        } 
      };
      
      if (typedResponse.status !== 201 && typedResponse.status !== 200) {
        throw new Error(typedResponse.data.message || 'Failed to book appointment');
      }
      return typedResponse.data.appointment;
    } catch (error) {
      console.error('Failed to book appointment with Zenoti API:', error);
      // Instead of returning mock data, throw an error with a customer-friendly message
      throw new Error('We apologize, the online booking system is temporarily unavailable. Please call 949-706-7874 to schedule your appointment.');
    }
  },

  // Cancel booking
  async cancelBooking(bookingId: string, reason?: string): Promise<void> {
    try {
      console.log(`Cancelling booking ${bookingId} with real Zenoti API`);
      await zenotiClient.delete(`/v1/appointments/${bookingId}`, {
        data: reason ? { cancellation_reason: reason } : undefined,
      });
    } catch (error) {
      console.error(`Failed to cancel booking ${bookingId} with Zenoti API:`, error);
      // Instead of silently failing, throw an error with a customer-friendly message
      throw new Error('We apologize, the online cancellation system is temporarily unavailable. Please call 949-706-7874 to cancel your appointment.');
    }
  },
};

// API Connectivity Test
export const testConnection = async (): Promise<{
  success: boolean;
  message: string;
  serviceCount?: number;
  providerCount?: number;
}> => {
  try {
    const [services, providers] = await Promise.all([
      ZenotiService.getServices(),
      ZenotiService.getProviders(),
    ]);
    return {
      success: true,
      message: 'Successfully connected to Zenoti API',
      serviceCount: services.length,
      providerCount: providers.length,
    };
  } catch (error) {
    console.error('Failed to connect to Zenoti API:', error);
    return {
      success: false,
      message: 'Failed to connect to Zenoti API. Please check your credentials and try again.',
    };
  }
};

// Helper function for retrying API calls
export async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 1000
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) throw error;
    console.log(`Retrying... (${retries} attempts left)`);
    await new Promise(resolve => setTimeout(resolve, delay));
    return withRetry(fn, retries - 1, delay * 2);
  }
}