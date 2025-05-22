import { OpenAI } from 'openai';
import { Anthropic } from '@anthropic-ai/sdk';

// Initialize OpenAI client
const openai = new OpenAI({
apiKey: process.env.OPENAI_API_KEY,
});

// Initialize Anthropic client
const anthropic = new Anthropic({
apiKey: process.env.ANTHROPIC_API_KEY,
});

// Types for chat messages
export type MessageRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
role: MessageRole;
content: string;
}

export interface ChatCompletionOptions {
model?: string;
temperature?: number;
max_tokens?: number;
provider?: 'openai' | 'anthropic';
stream?: boolean;
}

/**
* Get a chat completion from OpenAI
*/
export const getChatCompletion = async (
messages: ChatMessage[],
options: ChatCompletionOptions = {}
) => {
const {
model = 'gpt-4-turbo',
temperature = 0.7,
max_tokens = 1000,
provider = 'openai',
stream = false,
} = options;

try {
if (provider === 'openai') {
const response = await openai.chat.completions.create({
model,
messages,
temperature,
max_tokens,
stream,
});

return { result: response, error: null };
} else if (provider === 'anthropic') {
// Convert messages to Anthropic format
const anthropicMessages = messages.map(msg => ({
role: msg.role === 'assistant' ? 'assistant' : 'user',
content: msg.content,
}));

const response = await anthropic.messages.create({
model: 'claude-3-opus-20240229',
max_tokens: max_tokens,
temperature: temperature,
messages: anthropicMessages,
system: messages.find(m => m.role === 'system')?.content,
});

return { result: response, error: null };
}

throw new Error(`Unsupported provider: ${provider}`);
} catch (error) {
console.error('AI completion error:', error);
return {
result: null,
error: typeof error === 'object' && error !== null && 'message' in error
? String(error.message)
: 'Failed to get AI completion',
};
}
};

/**
* Get a streaming chat completion
*/
export const getStreamingChatCompletion = async (
messages: ChatMessage[],
options: ChatCompletionOptions = {}
) => {
const {
model = 'gpt-4-turbo',
temperature = 0.7,
max_tokens = 1000,
provider = 'openai',
} = options;

try {
if (provider === 'openai') {
const stream = await openai.chat.completions.create({
model,
messages,
temperature,
max_tokens,
stream: true,
});

return { stream, error: null };
} else if (provider === 'anthropic') {
// Convert messages to Anthropic format
const anthropicMessages = messages.map(msg => ({
role: msg.role === 'assistant' ? 'assistant' : 'user',
content: msg.content,
}));

const stream = await anthropic.messages.create({
model: 'claude-3-opus-20240229',
max_tokens: max_tokens,
temperature: temperature,
messages: anthropicMessages,
system: messages.find(m => m.role === 'system')?.content,
stream: true,
});

return { stream, error: null };
}

throw new Error(`Unsupported provider: ${provider}`);
} catch (error) {
console.error('AI streaming error:', error);
return {
stream: null,
error: typeof error === 'object' && error !== null && 'message' in error
? String(error.message)
: 'Failed to get streaming AI completion',
};
}
};

/**
* Generate system message for medical chatbot
*/
export const getMedicalChatbotSystemMessage = (userInfo?: { name?: string; history?: string }) => {
let systemMessage = `You are a helpful medical assistant for Allure MD, a medical practice specializing in plastic surgery, dermatology, medical spa treatments, and functional medicine.

Your role is to provide informative, accurate, and helpful responses to patient inquiries about our services, procedures, and general medical questions.

Always be professional, empathetic, and courteous. If you don't know something, admit it and suggest the patient speak directly with one of our medical professionals.

Never provide specific medical advice, diagnoses, or treatment recommendations. Instead, provide general information and encourage patients to schedule a consultation for personalized advice.`;

if (userInfo?.name) {
systemMessage += `\n\nYou are currently speaking with ${userInfo.name}.`;
}

if (userInfo?.history) {
systemMessage += `\n\nRelevant patient history: ${userInfo.history}`;
}

return systemMessage;
};