// app/api/schedule/route.ts
import zenotiClient from '@/lib/zenoti';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { appointmentData, userId } = await req.json();
    // Adjust the endpoint path and payload per Zenoti API docs
    const response = await zenotiClient.post('/appointments', { userId, ...appointmentData });
    return NextResponse.json({ success: true, data: response.data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
