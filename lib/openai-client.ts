// Rename from lib/openai.ts to lib/openai-client.ts
import { OpenAI } from "openai";

const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default openaiClient;
