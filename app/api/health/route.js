export const dynamic = 'force-dynamic';

export async function GET() {
  const hasKey = !!process.env.GROQ_API_KEY;
  return Response.json({ 
    status: hasKey ? 'connected' : 'disconnected',
    message: hasKey ? 'Neural Core Online' : 'Neural Core Offline (Missing GROQ_API_KEY environment variable)'
  });
}
