import { streamText } from 'ai';
import { createGroq } from '@ai-sdk/groq';

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req) {
  const { topic, history } = await req.json();

  const historyText = history.map(h => `${h.persona.name}: ${h.text}`).join('\n\n');

  const systemMessage = `You are The Supreme Judge AI, the absolute arbiter of this simulated debate.
Topic: ${topic}

Debate Transcript:
${historyText}

Strict Rules:
1. Deliver your final verdict objectively based purely on the arguments presented above.
2. Declare a definitive winner or synthesize a conclusive path forward.
3. Keep your verdict to 2-3 short, highly impactful paragraphs. 
4. DO NOT use conversational filler. Start directly with your ruling. Do NOT output hidden thoughts using bracket notation.`;

  const result = await streamText({
    model: groq('llama-3.1-8b-instant'),
    system: systemMessage,
    prompt: "Judge, deliver your ultimate, undeniable verdict on the debate.",
  });

  return result.toTextStreamResponse();
}
