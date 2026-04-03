import { generateText } from 'ai';
import { createGroq } from '@ai-sdk/groq';

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req) {
  const { roundArguments, roundTheme } = await req.json();

  const argsText = roundArguments.map(a => `${a.persona.name} (${a.persona.id}): "${a.text}"`).join('\n\n');

  const result = await generateText({
    model: groq('llama-3.1-8b-instant'),
    system: `You are the Neural Critic for the MULTI-MIND SIMULATOR. Your task is to objectively score the arguments from this round.
Round Focus: ${roundTheme || 'General Debate'}

Scoring Entities:
- nova-zero, entropy-x, glitch-wit, logic-mainframe, user (Human).

Scoring Metric (JSON):
{
  "scores": {
    "participantId": { "score": 0-100, "feedback": "one sentence critique", "fallacy": "name of fallacy or null" }
  },
  "mvp": "participantId of the strongest contributor"
}

Critical Guidelines:
1. Logic (40pts), Evidence/Reasoning (30pts), Rebuttal Quality (20pts), Style (10pts).
2. If identifying a fallacy, use standard logic terms (e.g., Slippery Slope, Ad Hominem).
3. If the "user" is participating, judge them with the same cold objectivity as the machines.`,
    prompt: `Deliberate and score these arguments:\n\n${argsText}`,
  });

  try {
    const parsed = JSON.parse(result.text.trim());
    return Response.json(parsed);
  } catch {
    // fallback scores
    const fallback = { scores: {}, mvp: null };
    roundArguments.forEach(a => {
      fallback.scores[a.persona.id] = { score: 70, feedback: "Solid argument.", fallacy: null };
    });
    return Response.json(fallback);
  }
}
