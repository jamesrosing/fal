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
    const validatedData = scheduleSchema.parse(data);
    
    // Process scheduling request
    // TODO: Implement actual scheduling logic
    
    return NextResponse.json({
      success: true,
      message: 'Appointment request received',
      data: validatedData,
    });
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
