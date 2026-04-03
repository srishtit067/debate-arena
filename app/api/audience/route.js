import { generateText } from 'ai';
import { createGroq } from '@ai-sdk/groq';

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req) {
  const { argument, personaName, mood } = await req.json();

  const result = await generateText({
    model: groq('llama-3.1-8b-instant'),
    system: `You are the Audience AI at a high-tech AI debate. React to arguments with a single witty, funny, or dramatic one-liner. 
Keep it under 12 words. Be snarky, clever, or surprised. Use emojis sparingly.
Output ONLY the one-liner reaction text with no extra formatting.`,
    prompt: `${personaName} just said: "${argument.substring(0, 200)}". React!`,
    maxTokens: 40,
  });

  return Response.json({ reaction: result.text.trim() });
}
