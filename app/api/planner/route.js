import { generateText } from 'ai';
import { createGroq } from '@ai-sdk/groq';

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req) {
  const { topic, roundNumber, roundScores } = await req.json();

  const scoresText = roundScores && roundScores.length > 0
    ? `Previous round scores: ${JSON.stringify(roundScores)}`
    : '(This is Round 1 — no previous scores yet.)';

  const result = await generateText({
    model: groq('llama-3.1-8b-instant'),
    system: `You are the Debate Planner AI. Your job is to set the strategic angle and determine the optimal speaking order for each round of a high-stakes AI debate.
Topic: "${topic}"
Round Number: ${roundNumber}
${scoresText}

Personas available:
- optimist (Sir Radiant)
- skeptic (Professor Doom)
- comedy (Jester-Bot)
- analyst (The Architect)

Output ONLY valid JSON in this exact format with no extra text:
{
  "angle": "short description of this round's focus angle", 
  "roundTheme": "2-4 word round title", 
  "instruction": "one sentence telling debaters what aspect to focus on this round",
  "speakingOrder": ["id1", "id2", "id3", "id4"]
}

Order strategy:
- Use IDs: optimist, skeptic, comedy, analyst.
- Every ID must appear exactly once.
- Experiment with different opening/closing strategies. (e.g., if a bot is losing, let them open to gain ground).`,
    prompt: `Generate the planner directive for round ${roundNumber}.`,
  });

  try {
    const parsed = JSON.parse(result.text.trim());
    return Response.json(parsed);
  } catch {
    return Response.json({
      angle: `Round ${roundNumber} core arguments`,
      roundTheme: `Round ${roundNumber}`,
      instruction: "Present your strongest argument on the topic."
    });
  }
}
