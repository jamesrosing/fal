// app/api/schedule/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { ZenotiAPI } from '@/lib/zenoti';

const scheduleSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number'),
  service: z.string().min(1, 'Service is required'),
  therapist: z.string().min(1, 'Therapist is required'),
  slot_id: z.string().min(1, 'Time slot is required'),
  message: z.string().optional(),
});

type ScheduleRequest = z.infer<typeof scheduleSchema>;

export async function POST(req: Request): Promise<Response> {
  try {
    const data = await req.json();
    const validatedData = scheduleSchema.parse(data) as ScheduleRequest;
    
    // Process scheduling request using Zenoti
    try {
      const [firstName, ...lastNameParts] = validatedData.name.split(' ');
      const lastName = lastNameParts.join(' ');

      await ZenotiAPI.bookAppointment({
        service_id: validatedData.service,
        provider_id: validatedData.therapist,
        slot_id: validatedData.slot_id,
        guest: {
          first_name: firstName,
          last_name: lastName || firstName,
          email: validatedData.email,
          phone: validatedData.phone,
        },
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
