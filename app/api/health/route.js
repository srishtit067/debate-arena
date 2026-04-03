import { NEURAL_KEY } from '@/lib/neural-config';

export const dynamic = 'force-dynamic';

export async function GET() {
  const hasKey = !!(process.env.GROQ_API_KEY || NEURAL_KEY);
  return Response.json({ 
    status: hasKey ? 'connected' : 'disconnected',
    message: hasKey ? 'Neural Core Online (Using Local/Embedded Key)' : 'Neural Core Offline (Missing API Key)'
  });
}
