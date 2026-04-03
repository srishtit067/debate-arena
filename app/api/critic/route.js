import { generateText } from 'ai';
import { createGroq } from '@ai-sdk/groq';

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req) {
  const { roundArguments } = await req.json();

  const argsText = roundArguments.map(a => `${a.persona.name}: "${a.text}"`).join('\n\n');

  const result = await generateText({
    model: groq('llama-3.1-8b-instant'),
    system: `You are the Critic AI. Score each debater's argument from this round.
Output ONLY valid JSON in this exact format with no extra text:
{
  "scores": {
    "agentId": { "score": 0-100, "feedback": "one sentence", "fallacy": "name of fallacy or null" }
  },
  "mvp": "agentId of best performer this round"
}

Scoring criteria:
- Logic and coherence (40pts)
- Use of evidence or reasoning (30pts)
- Rebuttal quality (20pts)
- Persona consistency (10pts)

Fallacies to detect: "Ad Hominem", "Straw Man", "False Dichotomy", "Slippery Slope", "Appeal to Emotion", "Circular Reasoning", null if none.`,
    prompt: `Score these round arguments:\n\n${argsText}`,
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
