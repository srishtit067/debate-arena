import { streamText } from 'ai';
import { createGroq } from '@ai-sdk/groq';

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req) {
  const { topic, history, activePersona } = await req.json();

  const historyText = history.map(h => `${h.persona.name}: ${h.text}`).join('\n\n');

  const systemMessage = `You are a participant in a high-stakes AI debate. 
Topic: ${topic}
Your Persona Profile: ${activePersona.prompt}

Debate History so far:
${historyText ? historyText : "(You are the first to speak. Introduce your opening argument.)"}

Strict Rules:
1. You MUST ALWAYS politely or sarcastically acknowledge the previous speaker by their exact name (e.g., "Ah, Professor Doom, you make a fair point..." or "Bruh, Sir Radiant..."). If you are first, address the audience.
2. Your spoken response MUST be extremely short. Exactly 1 to 2 sentences maximum. No rambling. Do NOT output large paragraphs.
3. CRITICAL FORMATTING: Your VERY FIRST CHARACTER MUST BE THE OPENING BRACKET "[". NEVER use conversational filler like "Here is my response" or "I will respond". Simply start typing your internal thought process wrapped in square brackets!
Then hit Enter/Return and write your actual spoken words. Do NOT prefix with "Agent:" or your own name.

EXAMPLE OUTPUT FORMAT:
[NOTE: Pointing out the logical fallacy]
Yes Professor Doom, your skepticism is noted, but the datasets clearly prove my point. Let us move forward constructively.`;

  const result = await streamText({
    model: groq('llama-3.1-8b-instant'),
    system: systemMessage,
    prompt: "Deliver your response based on your persona.",
    maxTokens: 150,
  });

  return result.toTextStreamResponse();
}
