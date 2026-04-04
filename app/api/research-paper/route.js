import { generateText } from 'ai';
import { createGroq } from '@ai-sdk/groq';
import { NEURAL_KEY } from '@/lib/neural-config';

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY || NEURAL_KEY });

export async function POST(req) {
  const { topic, history, criticResults, userVote } = await req.json();

  const historyText = history.map(h => `${h.persona?.name || 'The Judge'}: ${h.text}`).join('\n\n');
  
  const systemMessage = `You are a high-level scientific researcher.
Transform the provided debate into a formal IEEE-style research paper.
Topic: ${topic}

Strict Output Format:
Return ONLY valid JSON with these fields:
"title": "A formal academic title",
"authors": "The Neural Council",
"abstract": "A 150-word formal abstract summarizing the adversarial deliberation.",
"introduction": "The background and significance of the study on ${topic}.",
"methodology": "How Oopsinator, Professor Doom, Sarcastron, and Glitchy were used as agents in the simulation.",
"analysis": "A deep synthesis of the conflicting logical arguments presented.",
"results": "The judicial verdict from VERDICTLORD and audience reaction metrics.",
"conclusion": "Final insights and future work on AI alignment."

Rules:
1. Use academic, scientific tone.
2. Do not use conversational language.
3. No bolding or markdown inside the JSON values.
4. Final PDF will be 2-column, so keep sentences punchy.`;

  try {
    const result = await generateText({
      model: groq('llama-3.1-70b-versatile'),
      system: systemMessage,
      prompt: `Synthesize this debate into an IEEE Research Paper: ${historyText}`,
    });

    const rawText = result.text.trim();
    // Use regex to extract JSON if it's trapped in markdown backticks
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    const jsonContent = jsonMatch ? jsonMatch[0] : rawText;

    const parsed = JSON.parse(jsonContent);
    return Response.json(parsed);
  } catch (e) {
    console.error("Research synthesis error:", e);
    return Response.json({ error: "Failed to synthesize paper", details: e.message }, { status: 500 });
  }
}
