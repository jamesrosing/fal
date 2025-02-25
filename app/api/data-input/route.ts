import openaiClient from '@/lib/openai-client';

export async function POST(req: Request) {
  const { prompt } = await req.json();
  // Use AI to provide data suggestions or validations
  const aiResponse = await openaiClient.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: 'user', content: prompt }],
  });

  return new Response(JSON.stringify(aiResponse.choices[0].message));
}