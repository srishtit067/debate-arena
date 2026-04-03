import { generateText } from 'ai';
import { createGroq } from '@ai-sdk/groq';

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req) {
  const { topic, roundNumber, roundScores, participationMode, activePersonas } = await req.json();

  const scoresText = roundScores && roundScores.length > 0
    ? `Previous round scores: ${JSON.stringify(roundScores)}`
    : '(This is Round 1 — no previous scores yet.)';

  const personaListText = activePersonas.map(p => `- ${p.id} (${p.name}): ${p.prompt.split('.')[0]}`).join('\n');
  const personaIds = activePersonas.map(p => p.id);

  const result = await generateText({
    model: groq('llama-3.1-8b-instant'),
    system: `You are the Debate Planner AI for the MULTI-MIND SIMULATOR. Your job is to set the semantic strategy and determine the optimal turn-taking sequence for this round.
Topic: "${topic}"
Round: ${roundNumber}
Current Participants in this simulation:
${personaListText}

${scoresText}

Operational Rules:
1. Every Participant ID must appear exactly once in the "speakingOrder".
2. If "user" (The Human Unit) is present, place them strategically (e.g., as the provocateur or the final word).
3. IDs to use: ${personaIds.join(', ')}.

Output ONLY valid JSON:
{
  "angle": "short strategic focus for this round", 
  "roundTheme": "2-4 word round title", 
  "instruction": "one sentence guiding debaters on the specific sub-topic",
  "speakingOrder": ${JSON.stringify(personaIds)} // (Shuffle this based on your strategy)
}`,
    prompt: `Generate the neural strategic directive for round ${roundNumber}.`,
  });

  try {
    const parsed = JSON.parse(result.text.trim());
    return Response.json(parsed);
  } catch {
    return Response.json({
      angle: `Round ${roundNumber} core deliberation`,
      roundTheme: `Neural Round ${roundNumber}`,
      instruction: "Advance your primary objective and counter the previous arguments.",
      speakingOrder: personaIds
    });
  }
}
