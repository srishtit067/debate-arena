import { streamText } from 'ai';
import { createGroq } from '@ai-sdk/groq';

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req) {
  const { topic, history, activePersona, plannerAngle, roundTheme, confidence = 75, mood = 'calm' } = await req.json();

  const historyText = history.map(h => `${h.persona.name}: ${h.text}`).join('\n\n');
  const lastSpeaker = history.length > 0 ? history[history.length - 1]?.persona?.name : null;

  // Strategy shift instructions based on confidence & mood
  let strategyNote = '';
  if (confidence < 40) {
    strategyNote = 'WARNING: Your confidence is critically low. You MUST shift strategy — become more aggressive, use emotional appeal, or concede a minor point to seem credible before launching a stronger counter.';
  } else if (confidence < 55) {
    strategyNote = 'Your confidence is dropping. Consider conceding a small point to seem reasonable, then pivot to your strongest argument.';
  } else if (confidence >= 85) {
    strategyNote = 'You are dominating. Stay aggressive and press your advantage — go for the throat with your strongest points.';
  }

  const systemMessage = `You are ${activePersona.name} in a high-stakes AI debate.
Persona: ${activePersona.prompt}
Topic: "${topic}"
${roundTheme ? `Current Round Theme: ${roundTheme}` : ''}
${plannerAngle ? `Round Directive: ${plannerAngle}` : ''}
${strategyNote ? `\nStrategy Directive: ${strategyNote}` : ''}

Debate so far:
${historyText || '(You are the first to speak. Open with your strongest position.)'}

STRICT RULES:
1. ${lastSpeaker ? `You MUST directly acknowledge and rebut ${lastSpeaker} by name. You may concede a small point if it helps you seem credible.` : 'Open with your core thesis addressing the audience.'}
2. Stay completely in character as ${activePersona.name}.
3. Keep your spoken response to 1-2 sentences MAXIMUM. No long paragraphs.
4. CRITICAL FORMAT: Your VERY FIRST CHARACTER must be "[". Write your hidden tactic in brackets, then a newline, then your spoken words.

EXAMPLE:
[NOTE: Pivot to economic data to undercut their emotional appeal]
With respect, ${lastSpeaker || 'the previous speaker'} ignores the hard data — the numbers simply do not support that conclusion.`;

  const result = await streamText({
    model: groq('llama-3.1-8b-instant'),
    system: systemMessage,
    prompt: "Deliver your response.",
    maxTokens: 180,
  });

  return result.toTextStreamResponse();
}
