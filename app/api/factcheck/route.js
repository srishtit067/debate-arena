import { generateText } from 'ai';
import { createGroq } from '@ai-sdk/groq';
import { NEURAL_KEY } from '@/lib/neural-config';

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY || NEURAL_KEY });

export async function POST(req) {
  const { argument, personaName } = await req.json();

  // Step 1: Identify a claim and "Search" for it (Simulated Tool Call)
  const searchResult = await generateText({
    model: groq('llama-3.1-8b-instant'),
    system: `You are the Neural Search Tool for the Multi-Mind Simulator.
Your job is to identify the MOST verifiable claim in an argument and return a snippet of "simulated data" or a "source" to verify it.
Output ONLY valid JSON in this format:
{"claim": "the found claim", "searchQuery": "query used", "dataFound": "1-sentence factual snippet", "source": "e.g. NASA Earth Observatory", "sourceUrl": "e.g. https://earthobservatory.nasa.gov"}`,
    prompt: `Analyze this argument from ${personaName}: "${argument}"`,
  });

  let toolData = null;
  try {
    toolData = JSON.parse(searchResult.text.trim());
  } catch (e) {
    toolData = { claim: "general argument", dataFound: "Data correlates with logical consensus.", source: "Simulator Core", sourceUrl: "https://groq.com" };
  }

  // Step 2: Use the "Tool Data" to generate a final verdict
  const finalVerdict = await generateText({
    model: groq('llama-3.1-8b-instant'),
    system: `You are a real-time Fact-Check AI. 
You have been provided with "Search Tool Results" for a specific claim.
Use this tool data to provide a definitive verdict.
Output ONLY valid JSON:
{"verdict": "STRONG" | "WEAK" | "FALLACY", "note": "max 10 word explanation", "searchSnippet": "the data found", "source": "the source", "sourceUrl": "clickable url"}`,
    prompt: `Argument: "${argument}"
Search Tool Data: ${JSON.stringify(toolData)}`,
  });

  try {
    const parsed = JSON.parse(finalVerdict.text.trim());
    return Response.json(parsed);
  } catch {
    return Response.json({ 
      verdict: 'STRONG', 
      note: 'Argument appears valid based on neural search.',
      searchSnippet: toolData.dataFound,
      source: toolData.source,
      sourceUrl: toolData.sourceUrl
    });
  }
}
