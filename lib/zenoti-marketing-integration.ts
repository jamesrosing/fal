// lib/zenoti-marketing.ts
import zenotiClient from './zenoti-client';
import { cachedQuery } from './cache';

// Define types for marketing features
export interface ZenotiDiscount {
  id: string;
  name: string;
  type: 'percentage' | 'fixed' | 'free_item';
  value: number;
  valid_from: string;
  valid_to: string;
  description?: string;
  eligibility?: string[];
  restrictions?: string[];
}

export interface ZenotiCampaign {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'inactive' | 'scheduled' | 'expired';
  start_date: string;
  end_date: string;
  description?: string;
  target_segment_id?: string;
  coupon_codes?: string[];
}

export interface ZenotiCoupon {
  code: string;
  campaign_id: string;
  value: number;
  type: 'percentage' | 'fixed' | 'free_item';
  expiry_date: string;
  is_redeemed: boolean;
  redeemed_date?: string;
  user_id?: string;
}

export interface ZenotiSegment {
  id: string;
  name: string;
  description?: string;
  criteria: Record<string, any>;
  member_count: number;
  created_at: string;
  updated_at: string;
}

export interface ZenotiGiftCard {
  id: string;
  code: string;
  initial_value: number;
  current_balance: number;
  issue_date: string;
  expiry_date: string;
  status: 'active' | 'redeemed' | 'expired' | 'cancelled';
  recipient_name?: string;
  recipient_email?: string;
  purchaser_id?: string;
}

export interface ZenotiPrepaidCard {
  id: string;
  code: string;
  name: string;
  total_value: number;
  remaining_value: number;
  issue_date: string;
  expiry_date: string;
  services_included: string[];
  owner_id: string;
  status: 'active' | 'expired' | 'cancelled';
}

export interface ZenotiLoyaltyAccount {
  user_id: string;
  points_balance: number;
  tier: string;
  tier_expiry?: string;
  lifetime_points: number;
  points_history: {
    date: string;
    amount: number;
    type: 'earn' | 'redeem' | 'expired' | 'adjustment';
    description: string;
  }[];
}

export interface ZenotiAbandonedCheckout {
  id: string;
  user_id: string;
  user_email: string;
  items: {
    type: 'service' | 'product' | 'membership';
    id: string;
    name: string;
    quantity: number;
    price: number;
  }[];
  created_at: string;
  last_updated: string;
  total_value: number;
  recovery_emails_sent: number;
  last_email_sent_at?: string;
}

// Marketing service wrapper with caching
export const ZenotiMarketingService = {
  // Discounts
  async getDiscounts(): Promise<ZenotiDiscount[]> {
    return cachedQuery('zenoti:discounts', async () => {
      const response = await zenotiClient.get('/v1/discounts');
      return response.data.discounts;
    }, 1800); // Cache for 30 minutes
  },

  async getDiscountById(id: string): Promise<ZenotiDiscount> {
    return cachedQuery(`zenoti:discount:${id}`, async () => {
      const response = await zenotiClient.get(`/v1/discounts/${id}`);
      return response.data;
    }, 1800);
  },

  async applyDiscount(bookingId: string, discountId: string): Promise<any> {
    const response = await zenotiClient.post(`/v1/bookings/${bookingId}/discounts`, {
      discount_id: discountId
    });
    
    // Clear any cached booking data
    clearCache(`zenoti:booking:${bookingId}`);
    
    return response.data;
  },

  // Campaigns and Coupons
  async getCampaigns(status?: 'active' | 'all'): Promise<ZenotiCampaign[]> {
    return cachedQuery(`zenoti:campaigns:${status || 'all'}`, async () => {
      const params = new URLSearchParams();
      if (status === 'active') params.append('status', 'active');
      
      const response = await zenotiClient.get(`/v1/campaigns?${params}`);
      return response.data.campaigns;
    }, 3600);
  },

  async getCampaignById(id: string): Promise<ZenotiCampaign> {
    return cachedQuery(`zenoti:campaign:${id}`, async () => {
      const response = await zenotiClient.get(`/v1/campaigns/${id}`);
      return response.data;
    }, 3600);
  },
  
  async validateCoupon(code: string): Promise<{ 
    valid: boolean; 
    coupon?: ZenotiCoupon; 
    error?: string;
  }> {
    try {
      const response = await zenotiClient.get(`/v1/coupons/${code}/validate`);
      return { 
        valid: true, 
        coupon: response.data 
      };
    } catch (error: any) {
      return { 
        valid: false, 
        error: error.response?.data?.message || 'Invalid coupon code' 
      };
    }
  },
  
  async applyCoupon(bookingId: string, couponCode: string): Promise<any> {
    const response = await zenotiClient.post(`/v1/bookings/${bookingId}/coupons`, {
      coupon_code: couponCode
    });
    
    // Clear any cached booking data
    clearCache(`zenoti:booking:${bookingId}`);
    
    return response.data;
  },

  // Target Segments
  async getSegments(): Promise<ZenotiSegment[]> {
    return cachedQuery('zenoti:segments', async () => {
      const response = await zenotiClient.get('/v1/segments');
      return response.data.segments;
    }, 3600);
  },

  async getSegmentMembers(segmentId: string): Promise<any[]> {
    return cachedQuery(`zenoti:segment:${segmentId}:members`, async () => {
      const response = await zenotiClient.get(`/v1/segments/${segmentId}/members`);
      return response.data.members;
    }, 3600);
  },

  // Gift Cards
  async createGiftCard(data: {
    value: number;
    recipient_name: string;
    recipient_email: string;
    sender_name?: string;
    message?: string;
    notify_recipient?: boolean;
  }): Promise<ZenotiGiftCard> {
    const response = await zenotiClient.post('/v1/gift-cards', data);
    return response.data.gift_card;
  },
  
  async getGiftCard(code: string): Promise<ZenotiGiftCard> {
    const response = await zenotiClient.get(`/v1/gift-cards/${code}`);
    return response.data;
  },
  
  async applyGiftCard(bookingId: string, giftCardCode: string, amount?: number): Promise<any> {
    const payload: any = { gift_card_code: giftCardCode };
    if (amount) payload.amount = amount;
    
    const response = await zenotiClient.post(`/v1/bookings/${bookingId}/gift-cards`, payload);
    
    // Clear any cached booking data
    clearCache(`zenoti:booking:${bookingId}`);
    
    return response.data;
  },

  // Prepaid Cards
  async getPrepaidCards(userId: string): Promise<ZenotiPrepaidCard[]> {
    const response = await zenotiClient.get(`/v1/users/${userId}/prepaid-cards`);
    return response.data.prepaid_cards;
  },
  
  async getPrepaidCardDetails(id: string): Promise<ZenotiPrepaidCard> {
    const response = await zenotiClient.get(`/v1/prepaid-cards/${id}`);
    return response.data;
  },
  
  async applyPrepaidCard(bookingId: string, prepaidCardId: string): Promise<any> {
    const response = await zenotiClient.post(`/v1/bookings/${bookingId}/prepaid-cards`, {
      prepaid_card_id: prepaidCardId
    });
    
    // Clear any cached booking data
    clearCache(`zenoti:booking:${bookingId}`);
    
    return response.data;
  },

  // Loyalty Points
  async getLoyaltyAccount(userId: string): Promise<ZenotiLoyaltyAccount> {
    return cachedQuery(`zenoti:loyalty:${userId}`, async () => {
      const response = await zenotiClient.get(`/v1/users/${userId}/loyalty`);
      return response.data;
    }, 900); // Cache for 15 minutes
  },
  
  async redeemLoyaltyPoints(userId: string, points: number, bookingId?: string): Promise<any> {
    const payload: any = { points };
    if (bookingId) payload.booking_id = bookingId;
    
    const response = await zenotiClient.post(`/v1/users/${userId}/loyalty/redeem`, payload);
    
    // Clear loyalty cache
    clearCache(`zenoti:loyalty:${userId}`);
    
    // Clear booking cache if applicable
    if (bookingId) clearCache(`zenoti:booking:${bookingId}`);
    
    return response.data;
  },

  // Abandoned Checkouts
  async getAbandonedCheckouts(params?: {
    from_date?: string;
    to_date?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ checkouts: ZenotiAbandonedCheckout[]; total: number }> {
    const queryParams = new URLSearchParams();
    
    if (params?.from_date) queryParams.append('from_date', params.from_date);
    if (params?.to_date) queryParams.append('to_date', params.to_date);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    
    const response = await zenotiClient.get(`/v1/abandoned-checkouts?${queryParams}`);
    
    return {
      checkouts: response.data.abandoned_checkouts,
      total: response.data.total
    };
  },
  
  async recoverAbandonedCheckout(id: string): Promise<any> {
    const response = await zenotiClient.post(`/v1/abandoned-checkouts/${id}/recover`);
    return response.data;
  }
};

// Helper function to clear cache
import { clearCache } from './cache';
