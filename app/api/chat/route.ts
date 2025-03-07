import { NextResponse } from 'next/server';
import openaiClient from '@/lib/openai-client';
import { ZenotiService } from '@/lib/zenoti';

// Define function schema for OpenAI function calling
const functions = [
  {
    name: 'get_services',
    description: 'Get available services from the system',
    parameters: {
      type: 'object',
      properties: {
        category: {
          type: 'string',
          description: 'Optional category to filter services by (e.g., "facial", "massage", "hair")',
        },
      },
      required: [],
    },
  },
  {
    name: 'get_providers',
    description: 'Get service providers/staff members',
    parameters: {
      type: 'object',
      properties: {
        specialty: {
          type: 'string',
          description: 'Optional specialty to filter providers by (e.g., "dermatology", "massage")',
        },
      },
      required: [],
    },
  },
  {
    name: 'check_availability',
    description: 'Check available time slots for a service',
    parameters: {
      type: 'object',
      properties: {
        service_id: {
          type: 'string',
          description: 'ID of the service to check availability for',
        },
        date: {
          type: 'string',
          description: 'Date to check availability for in YYYY-MM-DD format',
        },
        provider_id: {
          type: 'string',
          description: 'Optional ID of the specific provider to check availability for',
        },
      },
      required: ['service_id', 'date'],
    },
  },
  {
    name: 'book_appointment',
    description: 'Book an appointment with a provider',
    parameters: {
      type: 'object',
      properties: {
        service_id: {
          type: 'string',
          description: 'ID of the service to book',
        },
        provider_id: {
          type: 'string',
          description: 'ID of the provider to book with',
        },
        slot_id: {
          type: 'string',
          description: 'ID of the time slot to book',
        },
        guest_first_name: {
          type: 'string',
          description: 'First name of the guest',
        },
        guest_last_name: {
          type: 'string',
          description: 'Last name of the guest',
        },
        guest_email: {
          type: 'string',
          description: 'Email of the guest',
        },
        guest_phone: {
          type: 'string',
          description: 'Phone number of the guest',
        },
        notes: {
          type: 'string',
          description: 'Optional notes for the appointment',
        },
      },
      required: ['service_id', 'provider_id', 'slot_id', 'guest_first_name', 'guest_last_name', 'guest_email', 'guest_phone'],
    },
  },
];

export async function POST(req: Request) {
  try {
    const { messages, userId } = await req.json();
    
    // Create a chat completion with function calling
    const response = await openaiClient.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages,
      functions,
      temperature: 0.7,
    });
    
    const message = response.choices[0].message;
    
    // Check if the model wants to call a function
    if (message.function_call) {
      const functionName = message.function_call.name;
      const functionArgs = JSON.parse(message.function_call.arguments);
      
      let functionResponse;
      
      // Execute the appropriate function
      switch (functionName) {
        case 'get_services':
          if (functionArgs.category) {
            functionResponse = await ZenotiService.getServicesByCategory(functionArgs.category);
          } else {
            functionResponse = await ZenotiService.getServices();
          }
          break;
          
        case 'get_providers':
          if (functionArgs.specialty) {
            functionResponse = await ZenotiService.getProvidersBySpecialty(functionArgs.specialty);
          } else {
            functionResponse = await ZenotiService.getProviders();
          }
          break;
          
        case 'check_availability':
          functionResponse = await ZenotiService.getAvailability(
            functionArgs.service_id,
            functionArgs.date,
            functionArgs.provider_id
          );
          break;
          
        case 'book_appointment':
          functionResponse = await ZenotiService.bookAppointment({
            booking_id: '', // Will be assigned by Zenoti
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
          });
          break;
          
        default:
          functionResponse = { error: `Function ${functionName} not implemented` };
      }
      
      // Send the function result back to OpenAI to get a final response
      const secondResponse = await openaiClient.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          ...messages,
          message,
          {
            role: 'function',
            name: functionName,
            content: JSON.stringify(functionResponse),
          },
        ],
        temperature: 0.7,
      });
      
      return NextResponse.json(secondResponse.choices[0].message);
    }
    
    // If no function call is needed, return the response directly
    return NextResponse.json(message);
  } catch (error: any) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred' },
      { status: 500 }
    );
  }
}