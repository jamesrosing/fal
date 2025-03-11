import { NextResponse } from 'next/server';
import openaiClient from '@/lib/openai-client';
import { ZenotiService } from '@/lib/zenoti';

const functions = [
  {
    name: 'get_services',
    parameters: {
      type: 'object',
      properties: {
        center_id: { type: 'string', description: 'Center ID (optional, defaults to env)' },
      },
    },
  },
  {
    name: 'check_availability',
    parameters: {
      type: 'object',
      properties: {
        center_id: { type: 'string', description: 'Center ID (optional, defaults to env)' },
        service_id: { type: 'string' },
        date: { type: 'string' },
        provider_id: { type: 'string' },
      },
      required: ['service_id', 'date'],
    },
  },
  {
    name: 'book_appointment',
    parameters: {
      type: 'object',
      properties: {
        center_id: { type: 'string', description: 'Center ID (optional, defaults to env)' },
        service_id: { type: 'string' },
        provider_id: { type: 'string' },
        slot_id: { type: 'string' },
        guest_first_name: { type: 'string' },
        guest_last_name: { type: 'string' },
        guest_email: { type: 'string' },
        guest_phone: { type: 'string' },
        notes: { type: 'string' },
      },
      required: ['service_id', 'provider_id', 'slot_id', 'guest_first_name', 'guest_last_name', 'guest_email', 'guest_phone'],
    },
  },
];

export async function POST(req: Request) {
  const { messages } = await req.json();
  const response = await openaiClient.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages,
    functions,
    temperature: 0.7,
  });

  const message = response.choices[0].message;
  if (message.function_call) {
    const functionName = message.function_call.name;
    const functionArgs = JSON.parse(message.function_call.arguments);
    const centerId = functionArgs.center_id || process.env.ZENOTI_CENTER_ID;

    let functionResponse;
    switch (functionName) {
      case 'get_services':
        functionResponse = await ZenotiService.getServices(centerId);
        break;
      case 'check_availability':
        functionResponse = await ZenotiService.getAvailability(
          functionArgs.service_id,
          functionArgs.date,
          functionArgs.provider_id,
          centerId
        );
        break;
      case 'book_appointment':
        functionResponse = await ZenotiService.bookAppointment(
          {
            booking_id: '',
            service_id: functionArgs.service_id,
            provider_id: functionArgs.provider_id,
            slot_id: functionArgs.slot_id,
            guest: {
              first_name: functionArgs.guest_first_name,
              last_name: functionArgs.guest_last_name,
              email: functionArgs.guest_email,
              phone: functionArgs.guest_phone,
            },
            notes: functionArgs.notes,
          },
          centerId
        );
        break;
    }

    const secondResponse = await openaiClient.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [...messages, message, {
        role: 'function',
        name: functionName,
        content: JSON.stringify(functionResponse),
      }],
      temperature: 0.7,
    });
    return NextResponse.json(secondResponse.choices[0].message);
  }
  return NextResponse.json(message);
}