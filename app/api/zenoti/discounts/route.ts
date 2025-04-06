// app/api/zenoti/discounts/route.ts
import { NextResponse } from 'next/server';
import { ZenotiMarketingService } from '@/lib/zenoti-marketing';

export async function GET() {
  try {
    const discounts = await ZenotiMarketingService.getDiscounts();
    return NextResponse.json({ discounts });
  } catch (error: any) {
    console.error('Error fetching discounts:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch discounts' },
      { status: 500 }
    );
  }
}

// app/api/zenoti/campaigns/route.ts
import { NextResponse } from 'next/server';
import { ZenotiMarketingService } from '@/lib/zenoti-marketing';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = (await searchParams).get('status') as 'active' | 'all' | undefined;
    
    const campaigns = await ZenotiMarketingService.getCampaigns(status);
    return NextResponse.json({ campaigns });
  } catch (error: any) {
    console.error('Error fetching campaigns:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch campaigns' },
      { status: 500 }
    );
  }
}

// app/api/zenoti/coupons/validate/route.ts
import { NextResponse } from 'next/server';
import { ZenotiMarketingService } from '@/lib/zenoti-marketing';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = (await searchParams).get('code');
    
    if (!code) {
      return NextResponse.json(
        { error: 'Coupon code is required' },
        { status: 400 }
      );
    }
    
    const result = await ZenotiMarketingService.validateCoupon(code);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error validating coupon:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to validate coupon' },
      { status: 500 }
    );
  }
}

// app/api/zenoti/gift-cards/[code]/route.ts
import { NextResponse } from 'next/server';
import { ZenotiMarketingService } from '@/lib/zenoti-marketing';

export async function GET(
  request: Request,
  { params }: { params: { code: string } }
) {
  try {
    const code = params.code;
    
    if (!code) {
      return NextResponse.json(
        { error: 'Gift card code is required' },
        { status: 400 }
      );
    }
    
    const giftCard = await ZenotiMarketingService.getGiftCard(code);
    return NextResponse.json(giftCard);
  } catch (error: any) {
    console.error('Error fetching gift card:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch gift card' },
      { status: 500 }
    );
  }
}

// app/api/zenoti/gift-cards/route.ts
import { NextResponse } from 'next/server';
import { ZenotiMarketingService } from '@/lib/zenoti-marketing';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.value || !body.recipient_name || !body.recipient_email) {
      return NextResponse.json(
        { error: 'Value, recipient name, and recipient email are required' },
        { status: 400 }
      );
    }
    
    const giftCard = await ZenotiMarketingService.createGiftCard({
      value: body.value,
      recipient_name: body.recipient_name,
      recipient_email: body.recipient_email,
      sender_name: body.sender_name,
      message: body.message,
      notify_recipient: body.notify_recipient
    });
    
    return NextResponse.json(giftCard);
  } catch (error: any) {
    console.error('Error creating gift card:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create gift card' },
      { status: 500 }
    );
  }
}

// app/api/zenoti/loyalty/[userId]/route.ts
import { NextResponse } from 'next/server';
import { ZenotiMarketingService } from '@/lib/zenoti-marketing';

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = params.userId;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    const loyaltyAccount = await ZenotiMarketingService.getLoyaltyAccount(userId);
    return NextResponse.json(loyaltyAccount);
  } catch (error: any) {
    console.error('Error fetching loyalty account:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch loyalty account' },
      { status: 500 }
    );
  }
}

// app/api/zenoti/loyalty/[userId]/redeem/route.ts
import { NextResponse } from 'next/server';
import { ZenotiMarketingService } from '@/lib/zenoti-marketing';

export async function POST(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = params.userId;
    const body = await request.json();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    if (!body.points || body.points <= 0) {
      return NextResponse.json(
        { error: 'Points to redeem is required and must be greater than 0' },
        { status: 400 }
      );
    }
    
    const result = await ZenotiMarketingService.redeemLoyaltyPoints(
      userId,
      body.points,
      body.booking_id
    );
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error redeeming loyalty points:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to redeem loyalty points' },
      { status: 500 }
    );
  }
}

// app/api/zenoti/bookings/[bookingId]/discounts/route.ts
import { NextResponse } from 'next/server';
import { ZenotiMarketingService } from '@/lib/zenoti-marketing';

export async function POST(
  request: Request,
  { params }: { params: { bookingId: string } }
) {
  try {
    const bookingId = params.bookingId;
    const body = await request.json();
    
    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      );
    }
    
    if (!body.discount_id) {
      return NextResponse.json(
        { error: 'Discount ID is required' },
        { status: 400 }
      );
    }
    
    const result = await ZenotiMarketingService.applyDiscount(
      bookingId,
      body.discount_id
    );
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error applying discount:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to apply discount' },
      { status: 500 }
    );
  }
}

// app/api/zenoti/bookings/[bookingId]/coupons/route.ts
import { NextResponse } from 'next/server';
import { ZenotiMarketingService } from '@/lib/zenoti-marketing';

export async function POST(
  request: Request,
  { params }: { params: { bookingId: string } }
) {
  try {
    const bookingId = params.bookingId;
    const body = await request.json();
    
    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      );
    }
    
    if (!body.coupon_code) {
      return NextResponse.json(
        { error: 'Coupon code is required' },
        { status: 400 }
      );
    }
    
    const result = await ZenotiMarketingService.applyCoupon(
      bookingId,
      body.coupon_code
    );
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error applying coupon:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to apply coupon' },
      { status: 500 }
    );
  }
}

// app/api/zenoti/bookings/[bookingId]/gift-cards/route.ts
import { NextResponse } from 'next/server';
import { ZenotiMarketingService } from '@/lib/zenoti-marketing';

export async function POST(
  request: Request,
  { params }: { params: { bookingId: string } }
) {
  try {
    const bookingId = params.bookingId;
    const body = await request.json();
    
    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      );
    }
    
    if (!body.gift_card_code) {
      return NextResponse.json(
        { error: 'Gift card code is required' },
        { status: 400 }
      );
    }
    
    const result = await ZenotiMarketingService.applyGiftCard(
      bookingId,
      body.gift_card_code,
      body.amount
    );
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error applying gift card:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to apply gift card' },
      { status: 500 }
    );
  }
}

// app/api/zenoti/abandoned-checkouts/route.ts
import { NextResponse } from 'next/server';
import { ZenotiMarketingService } from '@/lib/zenoti-marketing';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fromDate = (await searchParams).get('from_date') || undefined;
    const toDate = (await searchParams).get('to_date') || undefined;
    const limitParam = (await searchParams).get('limit');
    const offsetParam = (await searchParams).get('offset');
    
    const limit = limitParam ? parseInt(limitParam) : undefined;
    const offset = offsetParam ? parseInt(offsetParam) : undefined;
    
    const result = await ZenotiMarketingService.getAbandonedCheckouts({
      from_date: fromDate,
      to_date: toDate,
      limit,
      offset
    });
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error fetching abandoned checkouts:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch abandoned checkouts' },
      { status: 500 }
    );
  }
}

// app/api/zenoti/abandoned-checkouts/[id]/recover/route.ts
import { NextResponse } from 'next/server';
import { ZenotiMarketingService } from '@/lib/zenoti-marketing';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Abandoned checkout ID is required' },
        { status: 400 }
      );
    }
    
    const result = await ZenotiMarketingService.recoverAbandonedCheckout(id);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error recovering abandoned checkout:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to recover abandoned checkout' },
      { status: 500 }
    );
  }
}