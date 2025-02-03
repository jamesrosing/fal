// app/api/chat/route.ts
import openai from '@/lib/openai';
import zenotiClient from '@/lib/zenoti';
import { NextResponse } from 'next/server';

const functions = [
  {
    name: 'schedule_appointment',
    description: 'Schedule an appointment with Allure MD',
    parameters: {
      type: 'object',
      properties: {
        service_id: { 
          type: 'string',
          description: 'The ID of the service to book'
        },
        datetime: { 
          type: 'string', 
          format: 'date-time',
          description: 'The desired appointment date and time'
        },
        staff_id: { 
          type: 'string',
          description: 'Optional preferred staff member ID'
        },
        notes: { 
          type: 'string',
          description: 'Any additional notes for the appointment'
        }
      },
      required: ['service_id', 'datetime']
    }
  },
  {
    name: 'get_available_slots',
    description: 'Get available appointment slots for a service',
    parameters: {
      type: 'object',
      properties: {
        service_id: { 
          type: 'string',
          description: 'The service to check availability for'
        },
        date: { 
          type: 'string',
          format: 'date',
          description: 'The date to check availability for'
        }
      },
      required: ['service_id', 'date']
    }
  }
];

export async function POST(req: Request) {
  try {
    const { messages, userId } = await req.json();

    // Call OpenAI with function calling enabled
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages,
      functions,
      temperature: 0.7,
    });

    const message = response.choices[0].message;

    // Handle function calls
    if (message.function_call) {
      const { name, arguments: args } = message.function_call;
      const parsedArgs = JSON.parse(args);

      switch (name) {
        case 'schedule_appointment':
          try {
            const zenotiResponse = await zenotiClient.post('/appointments', {
              userId,
              ...parsedArgs
            });
            return NextResponse.json({
              role: 'assistant',
              content: `Great! I've scheduled your appointment for ${new Date(parsedArgs.datetime).toLocaleString()}. Your appointment ID is ${zenotiResponse.data.id}.`
            });
          } catch (error: any) {
            return NextResponse.json({
              role: 'assistant',
              content: `I apologize, but I couldn't schedule the appointment. ${error.message}`
            });
          }

        case 'get_available_slots':
          try {
            const slotsResponse = await zenotiClient.get('/availability', {
              params: parsedArgs
            });
            const slots = slotsResponse.data.available_slots;
            return NextResponse.json({
              role: 'assistant',
              content: `Here are the available slots for ${parsedArgs.date}:\n${slots.map((slot: string) => `- ${slot}`).join('\n')}`
            });
          } catch (error: any) {
            return NextResponse.json({
              role: 'assistant',
              content: `I couldn't retrieve the available slots. ${error.message}`
            });
          }
      }
    }

    // Return regular chat response if no function was called
    return NextResponse.json(message);
  } catch (error: any) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { role: 'assistant', content: 'I apologize, but I encountered an error. Please try again.' },
      { status: 500 }
    );
  }
}
