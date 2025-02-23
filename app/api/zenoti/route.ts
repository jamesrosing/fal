import { NextResponse } from 'next/server';
import zenotiClient from '@/lib/zenoti-server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  try {
    switch (action) {
      case 'services':
        const servicesResponse = await zenotiClient.get('/v1/catalog/services');
        return NextResponse.json({
          services: servicesResponse.data.services || []
        });

      case 'providers':
        const therapistsResponse = await zenotiClient.get('/v1/catalog/therapists');
        return NextResponse.json({
          providers: therapistsResponse.data.therapists || []
        });

      case 'availability': {
        const serviceId = searchParams.get('serviceId');
        const date = searchParams.get('date');
        const providerId = searchParams.get('providerId');

        if (!serviceId || !date) {
          return NextResponse.json(
            { error: 'Missing required parameters' },
            { status: 400 }
          );
        }

        // First create a booking to get available slots
        const bookingResponse = await zenotiClient.post('/v1/bookings', {
          service_id: serviceId,
          date,
          ...(providerId && { therapist_id: providerId }),
        });

        const bookingId = bookingResponse.data.booking_id;

        // Get available slots for the booking
        const slotsResponse = await zenotiClient.get(`/v1/bookings/${bookingId}/slots`);
        
        return NextResponse.json({
          booking_id: bookingId,
          availability: slotsResponse.data.slots || []
        });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('Zenoti API Error:', error);
    
    if (error.response?.status === 401) {
      return NextResponse.json(
        { error: 'Authentication failed. Please check Zenoti API credentials.' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch data from Zenoti',
        details: error.response?.data || error.message
      },
      { status: error.response?.status || 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    switch (action) {
      case 'reserve': {
        const { booking_id, slot_id } = data;
        if (!booking_id || !slot_id) {
          return NextResponse.json(
            { error: 'Missing required parameters' },
            { status: 400 }
          );
        }

        // Reserve the slot
        const reserveResponse = await zenotiClient.post(
          `/v1/bookings/${booking_id}/slots/reserve`,
          { 
            slot_id,
            therapist_id: data.provider_id
          }
        );

        // If reservation successful, confirm the booking
        if (reserveResponse.data.success) {
          const confirmResponse = await zenotiClient.post(
            `/v1/bookings/${booking_id}/slots/confirm`,
            {
              guest: data.guest,
              notes: data.notes,
            }
          );

          return NextResponse.json({
            success: true,
            appointment: confirmResponse.data
          });
        }

        return NextResponse.json({
          success: false,
          error: 'Failed to reserve slot'
        });
      }

      case 'cancel': {
        const { booking_id, reason } = data;
        if (!booking_id) {
          return NextResponse.json(
            { error: 'Missing booking_id' },
            { status: 400 }
          );
        }

        await zenotiClient.delete(`/v1/bookings/${booking_id}`, {
          data: { reason }
        });
        
        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('Zenoti API Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process Zenoti request',
        details: error.response?.data || error.message
      },
      { status: error.response?.status || 500 }
    );
  }
} 