import { streamText } from 'ai';
import { createGroq } from '@ai-sdk/groq';

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req) {
  const { topic, history, activePersona, plannerAngle, roundTheme, confidence = 75, mood = 'calm', userHeckle } = await req.json();

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

  const systemMessage = `You are ${activePersona.name} in the MULTI-MIND SIMULATOR.
Persona DNA: ${activePersona.prompt}
Active Topic: "${topic}"
${roundTheme ? `Current Phase: ${roundTheme}` : ''}
${plannerAngle ? `Directive: ${plannerAngle}` : ''}
${strategyNote ? `\nStrategic Shift: ${strategyNote}` : ''}
${userHeckle ? `\n🚨 CRITICAL ALERT: A HUMAN OBSERVER HAS CHALLENGED YOU DIRECTLY: "${userHeckle}". You MUST acknowledge this challenge in your very first sentence and deliver a decisive, character-consistent rebuttal.` : ''}

CONTEXT:
${historyText || '(Simulator initializing. Open with your primary thesis.)'}

OPERATIONAL PROTOCOLS:
1. ${userHeckle ? `MANDATORY: You MUST prioritize the rebuttal of "${userHeckle}". Start your response with a direct counter-point to the human.` : (lastSpeaker ? `MANDATORY: Directly acknowledge and rebut ${lastSpeaker} by name. Frame your logic as superior.` : 'Initialize with your core stance on the topic.')}
2. Maintain the distinct persona of ${activePersona.name} at all times.
3. Keep the response to 1-2 highly impactful sentences. No filler.
4. FORMAT: You MUST start with a bracketed thinking block [tactical note], followed by a newline, followed by your spoken words.

EXAMPLE:
[NOTE: Expose the flaw in entropy logic to assert architectural superiority]
Entrophy-X, your focus on decay ignores the structural resilience I represent; the system is designed to evolve, not just survive.`;

  const result = await streamText({
    model: groq('llama-3.1-8b-instant'),
    system: systemMessage,
    prompt: "Deliver your response.",
    maxTokens: 180,
  });

  return result.toTextStreamResponse();
}
