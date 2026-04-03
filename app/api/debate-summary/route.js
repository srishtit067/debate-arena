import { generateText } from 'ai';
import { createGroq } from '@ai-sdk/groq';

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req) {
  const { topic, history } = await req.json();

  const historyText = history.map(h => `${h.persona?.name || 'The Judge'}: ${h.text}`).join('\n\n');

  const systemMessage = `You are an elite secretary AI. Read the following debate transcript and generate a highly structured Markdown bullet-point summary.
Topic: ${topic}

Transcript:
${historyText}

Strict Rules:
1. Provide a powerful overarching thesis overview.
2. Create strict bullet points capturing the best arguments from each uniquely named participant.
3. Summarize the Final Verdict.
4. Output cleanly in plain text with dash/bullet formatting. No conversational filler. Omit markdown asterisks or bolding, keep the text clean for PDF generation.`;

  const result = await generateText({
    model: groq('llama-3.1-8b-instant'),
    system: systemMessage,
    prompt: "Generate the highly structured final debate report.",
  });

  return Response.json({ text: result.text });
}
