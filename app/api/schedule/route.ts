// app/api/schedule/route.ts
import zenotiClient from '@/lib/zenoti';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const scheduleSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  phone: z.string(),
  service: z.string(),
  preferredDate: z.string(),
  message: z.string().optional(),
});

type ScheduleRequest = z.infer<typeof scheduleSchema>;

export async function POST(req: Request): Promise<Response> {
  try {
    const data = await req.json();
    const validatedData = scheduleSchema.parse(data) as ScheduleRequest;
    
    // Process scheduling request using Zenoti
    try {
      await zenotiClient.post('/v1/appointments', {
        guest: {
          name: validatedData.name,
          email: validatedData.email,
          phone: validatedData.phone,
        },
        service: validatedData.service,
        preferred_date: validatedData.preferredDate,
        notes: validatedData.message,
      });

      return NextResponse.json({
        success: true,
        message: 'Appointment request received',
        data: validatedData,
      });
    } catch (zenotiError) {
      console.error('Zenoti API Error:', zenotiError);
      return NextResponse.json({
        success: false,
        message: 'Failed to schedule appointment with Zenoti',
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Schedule API Error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Invalid request data',
        errors: error.errors,
      }, { status: 400 });
    }
    
    return NextResponse.json({
      success: false,
      message: 'Failed to process scheduling request',
    }, { status: 500 });
  }
}
