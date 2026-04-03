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
    system: `You are the Debate Planner AI. Your job is to set the strategic angle for each round of a debate.
Topic: "${topic}"
Round Number: ${roundNumber}
${scoresText}

Output ONLY valid JSON in this exact format with no extra text:
{"angle": "short description of this round's focus angle", "roundTheme": "2-4 word round title", "instruction": "one sentence telling debaters what aspect to focus on this round"}

Round themes should escalate in intensity each round. Examples:
- Round 1: "Opening Salvos" (establish core positions)
- Round 2: "The Evidence War" (focus on data and proof)
- Round 3: "Ethical Frontiers" (moral and philosophical angles)
- Round 4: "Personal Stakes" (who benefits/loses)
- Round 5: "Final Reckoning" (closing strongest arguments)`,
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
