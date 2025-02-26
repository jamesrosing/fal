'use client';

// Types
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

// API Methods
export const ZenotiAPI = {
  // Get all services
  async getServices(): Promise<ZenotiService[]> {
    try {
      const response = await fetch('/api/zenoti?action=services');
      const data = await response.json();
      return data.services;
    } catch (error) {
      console.error('Failed to fetch services:', error);
      throw error;
    }
  },

  // Get all providers
  async getProviders(): Promise<ZenotiProvider[]> {
    try {
      const response = await fetch('/api/zenoti?action=providers');
      const data = await response.json();
      return data.providers;
    } catch (error) {
      console.error('Failed to fetch providers:', error);
      throw error;
    }
  },

  // Get available time slots
  async getAvailability(
    serviceId: string,
    date: string,
    providerId?: string
  ): Promise<{ booking_id: string; slots: ZenotiSlot[] }> {
    try {
      const params = new URLSearchParams({
        action: 'availability',
        serviceId,
        date,
        ...(providerId && { providerId }),
      });
      
      const response = await fetch(`/api/zenoti?${params}`);
      const data = await response.json();
      return {
        booking_id: data.booking_id,
        slots: data.availability,
      };
    } catch (error) {
      console.error('Failed to fetch availability:', error);
      throw error;
    }
  },

  // Book an appointment
  async bookAppointment(booking: ZenotiBooking): Promise<any> {
    try {
      const response = await fetch('/api/zenoti', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'reserve',
          ...booking,
        }),
      });
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to book appointment');
      }
      
      return data.appointment;
    } catch (error) {
      console.error('Failed to book appointment:', error);
      throw error;
    }
  },

  // Cancel booking
  async cancelBooking(bookingId: string, reason?: string): Promise<void> {
    try {
      await fetch('/api/zenoti', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'cancel',
          booking_id: bookingId,
          reason,
        }),
      });
    } catch (error) {
      console.error('Failed to cancel booking:', error);
      throw error;
    }
  },
};
