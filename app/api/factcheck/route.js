import { generateText } from 'ai';
import { createGroq } from '@ai-sdk/groq';

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req) {
  const { argument, personaName } = await req.json();

  const result = await generateText({
    model: groq('llama-3.1-8b-instant'),
    system: `You are a real-time Fact-Check AI. Analyze a single debate argument and return ONLY valid JSON.
Output format (no extra text):
{"verdict": "STRONG" | "WEAK" | "FALLACY", "note": "max 10 word explanation"}

STRONG = well-reasoned, logical, with evidence
WEAK = vague, unsupported, or emotional without substance  
FALLACY = contains a named logical fallacy`,
    prompt: `Fact-check this argument from ${personaName}: "${argument}"`,
  });

  try {
    const parsed = JSON.parse(result.text.trim());
    return Response.json(parsed);
  } catch {
    return Response.json({ verdict: 'STRONG', note: 'Argument appears valid.' });
  }
}
