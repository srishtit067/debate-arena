import { generateText } from 'ai';
import { createGroq } from '@ai-sdk/groq';
import { NEURAL_KEY } from '@/lib/neural-config';

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY || NEURAL_KEY });

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
Current Participants:
${personaListText}

Operational Rules:
1. Every Participant ID must appear exactly once in the "speakingOrder".
2. Strategic Pivot: If the debate is stale, assign a "tacticalPivot" instruction in the JSON.
3. IDs to use: ${personaIds.join(', ')}.

Output ONLY valid JSON:
{
  "angle": "short strategic focus", 
  "roundTheme": "round title", 
  "instruction": "one sentence guiding debaters",
  "tacticalPivot": "How a specific agent should shift their argument structure",
  "speakingOrder": ${JSON.stringify(personaIds)} // Shuffle this!
}`,
    prompt: `Generate the neural strategic directive for round ${roundNumber}.`,
  });

  try {
    const parsed = JSON.parse(result.text.trim());
    // Robustness: filter out any invalid IDs or duplicates
    const validOrder = (parsed.speakingOrder || [])
      .filter(id => personaIds.includes(id))
      .filter((v, i, a) => a.indexOf(v) === i);
    
    if (validOrder.length < personaIds.length) {
       // fallback if planner missed someone
       parsed.speakingOrder = personaIds; 
    } else {
       parsed.speakingOrder = validOrder;
    }
    
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
