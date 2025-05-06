import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Context for the AI to understand the medical practice
const SYSTEM_CONTEXT = `You are an AI assistant for Allure MD, a premium medical practice specializing in:
1. Plastic surgery
2. Dermatology 
3. Medical spa treatments
4. Functional medicine

You should:
- Provide helpful, accurate information about our services
- Answer general medical questions with disclaimers when appropriate
- Assist with appointment scheduling
- Be polite, professional, and compassionate
- Never provide specific medical advice that should come from a doctor
- Always clarify you're an AI assistant, not a medical professional

When users ask about appointments, you can help them understand our services and collect their information, but clarify that final scheduling requires confirmation from our staff.`;

// Define response type
interface ChatResponse {
  message: string;
  actions?: Array<{
    type: string;
    data: any;
  }>;
  metadata?: Record<string, any>;
}

/**
 * Process a user message and generate an appropriate response
 */
export async function processUserMessage(
  message: string,
  conversationId?: string,
  userInfo?: any
): Promise<ChatResponse> {
  try {
    // Construct the conversation context
    const userContext = userInfo 
      ? `The user is ${userInfo.first_name} ${userInfo.last_name} (Email: ${userInfo.email}).`
      : 'This is an anonymous user (not logged in).';
    
    // Prepare messages for the API
    const messages = [
      { role: 'system', content: SYSTEM_CONTEXT + '\n\n' + userContext },
      { role: 'user', content: message }
    ];
    
    // If we need to retrieve conversation history
    if (conversationId) {
      // In a real implementation, we would fetch previous messages
      // from the database and add them to the messages array
    }
    
    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages,
      temperature: 0.7,
      max_tokens: 1000,
    });
    
    const responseContent = completion.choices[0].message.content || 'I apologize, but I couldn\'t process your request.';
    
    // Check for appointment scheduling intent
    const appointmentIntentMatch = message.toLowerCase().match(/appointment|schedule|book|visit/g);
    let actions = [];
    
    if (appointmentIntentMatch) {
      actions.push({
        type: 'SUGGEST_APPOINTMENT_BOOKING',
        data: {
          message: 'Would you like to schedule an appointment?',
          options: [
            { label: 'Yes, schedule now', value: 'schedule' },
            { label: 'No, just browsing', value: 'browse' }
          ]
        }
      });
    }
    
    return {
      message: responseContent,
      actions: actions.length > 0 ? actions : undefined,
      metadata: {
        model: completion.model,
        tokens: {
          prompt: completion.usage?.prompt_tokens,
          completion: completion.usage?.completion_tokens,
          total: completion.usage?.total_tokens
        }
      }
    };
  } catch (error) {
    console.error('Error processing message:', error);
    return {
      message: 'I apologize, but I\'m having trouble processing your message. Please try again later.',
    };
  }
}