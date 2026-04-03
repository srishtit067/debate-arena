import { streamText } from 'ai';
import { createGroq } from '@ai-sdk/groq';

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req) {
  const { topic, history, scoreSummary, voteInfo } = await req.json();

  const historyText = history
    .filter(h => h.text && h.text.trim())
    .map(h => `${h.persona?.name || 'Unknown'}: ${h.text}`)
    .join('\n\n');

  const systemMessage = `You are The Supreme Judge AI — the absolute, unbiased arbiter of this debate.
Topic: "${topic}"

Round-by-Round Scores:
${scoreSummary || '(No round scores available)'}

${voteInfo ? `Audience Vote: ${voteInfo}` : ''}

Debate Transcript:
${historyText}

YOUR TASK:
1. Declare a definitive winner based on the arguments and round scores.
2. Briefly call out the strongest argument made in the entire debate.
3. Name ONE point that ALL debaters seemed to agree on (the consensus point).
4. If the audience voted, acknowledge their choice and say whether you agree or disagree.
5. Keep it to 3 short paragraphs. Be dramatic and authoritative. Do NOT use bracket notation.`;

  const result = await streamText({
    model: groq('llama-3.1-8b-instant'),
    system: systemMessage,
    prompt: "Deliver your final, undeniable verdict.",
    maxTokens: 400,
  });

  return result.toTextStreamResponse();
}
