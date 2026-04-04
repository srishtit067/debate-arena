export const maxDuration = 60;
export const dynamic = 'force-dynamic';

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY || NEURAL_KEY });

export async function POST(req) {
  try {
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
"introduction": "The background and significance of the study.",
"methodology": "The multi-agent council approach used in the simulation.",
"analysis": "A synthesis of the conflicting logical arguments presented.",
"results": "The final judicial verdict and metrics.",
"conclusion": "Final insights and future work."

Rules: NO markdown bolding, NO conversational filler, ONLY valid JSON.`;

    let result;
    try {
      // Primary Attempt: 70B Versatile
      result = await generateText({
        model: groq('llama-3.1-70b-versatile'),
        system: systemMessage,
        prompt: `Synthesize this debate into an IEEE Research Paper: ${historyText}`,
      });
    } catch (primaryErr) {
      console.warn("Primary 70B Synthesis failed, falling back to 8B...", primaryErr);
      // Fallback Attempt: 8B Instant (More reliable/faster)
      result = await generateText({
        model: groq('llama-3.1-8b-instant'),
        system: systemMessage,
        prompt: `Synthesize this debate into an IEEE Research Paper: ${historyText}`,
      });
    }

    const rawText = result.text.trim();
    // Search for the last '{' and matching '}' to find the main JSON block
    const firstBrace = rawText.indexOf('{');
    const lastBrace = rawText.lastIndexOf('}');
    
    if (firstBrace === -1 || lastBrace === -1) {
      throw new Error("AI failed to output a valid JSON block.");
    }

    const jsonContent = rawText.substring(firstBrace, lastBrace + 1);
    const parsed = JSON.parse(jsonContent);
    return Response.json(parsed);

  } catch (e) {
    console.error("Critical research synthesis error:", e);
    return Response.json({ 
      error: "Failed to synthesize paper", 
      details: e.message 
    }, { status: 500 });
  }
}
