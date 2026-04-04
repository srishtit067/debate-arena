import { NextResponse } from 'next/server';
import { generateText } from 'ai';
import { groq } from '@ai-sdk/groq';

export const dynamic = 'force-dynamic';
export const maxDuration = 40;

const STATIC_FALLBACKS = [
  "Is AI replacing human creativity?",
  "Should education systems change for the digital age?",
  "Are remote jobs harming global productivity?",
  "Should social media platforms be legally controlled?"
];

export async function GET() {
  const apiKey = process.env.GNEWS_API_KEY;

  try {
    let rawHeadlines = [];

    if (apiKey) {
      // Fetch India Top Headlines
      const response = await fetch(`https://gnews.io/api/v4/top-headlines?country=in&category=general&apikey=${apiKey}`, {
        next: { revalidate: 3600 } // Cache for 1 hour
      });

      if (response.ok) {
        const data = await response.json();
        rawHeadlines = data.articles?.slice(0, 8).map(art => art.title) || [];
      }
    }

    // If no headlines (API failed or no key), use fallbacks
    if (rawHeadlines.length === 0) {
      return NextResponse.json(STATIC_FALLBACKS);
    }

    // AI Transformation with AI SDK (Groq)
    try {
      const { text } = await generateText({
        model: groq('llama-3.1-70b-versatile'),
        system: "You are a professional Debate Strategist. Convert headlines into a JSON array of 4 short, engaging debate questions. Return ONLY a JSON object with a 'topics' key.",
        prompt: `Headlines:\n${rawHeadlines.join('\n')}`,
      });

      const aiResponse = JSON.parse(text);
      const topics = aiResponse.topics || Object.values(aiResponse)[0];

      if (Array.isArray(topics) && topics.length > 0) {
        return NextResponse.json(topics.slice(0, 4));
      }
    } catch (aiErr) {
      console.error('AI SDK Generation Error:', aiErr);
    }

    return NextResponse.json(STATIC_FALLBACKS);

  } catch (error) {
    console.error('Trending API Error:', error);
    return NextResponse.json(STATIC_FALLBACKS);
  }
}
