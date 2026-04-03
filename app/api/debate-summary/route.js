import { generateText } from 'ai';
import { createGroq } from '@ai-sdk/groq';

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req) {
  const { topic, history, criticResults, userVote } = await req.json();

  const historyText = history.map(h => `${h.persona?.name || 'The Judge'}: ${h.text}`).join('\n\n');
  const scoresText = criticResults ? JSON.stringify(criticResults) : "No scores available.";
  const voteText = userVote ? `Audience Vote: ${userVote}` : "No audience vote.";

  const systemMessage = `You are an elite secretary AI. Generate a highly structured Markdown final report.
Topic: ${topic}

Round Scores:
${scoresText}

${voteText}

Transcript:
${historyText}

Strict Rules:
1. Provide a powerful overarching thesis overview.
2. Include a "ROUND-BY-ROUND EVOLUTION" section using the provided scores.
3. Create bullet points capturing the key arguments for each participant.
4. Summarize the Final Verdict and how it aligns with the Audience Vote.
5. Output CLEAN PLAIN TEXT (no markdown bolding/italics) for PDF compatibility.`;

  const result = await generateText({
    model: groq('llama-3.1-8b-instant'),
    system: systemMessage,
    prompt: "Generate the highly structured final debate report.",
  });

  return Response.json({ text: result.text });
}
