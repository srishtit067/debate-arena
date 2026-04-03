import { promises as fs } from 'fs';
import path from 'path';

const DATA_PATH = path.join(process.cwd(), 'data', 'history.json');

export async function GET() {
  try {
    const data = await fs.readFile(DATA_PATH, 'utf8');
    return Response.json(JSON.parse(data));
  } catch (error) {
    console.error('Error reading history:', error);
    return Response.json([]);
  }
}

export async function POST(req) {
  try {
    const newEntry = await req.json();
    const data = await fs.readFile(DATA_PATH, 'utf8');
    const history = JSON.parse(data);
    
    // Add unique ID and timestamp if not present
    const entryToSave = {
      ...newEntry,
      id: newEntry.id || Date.now().toString(),
      timestamp: newEntry.timestamp || new Date().toISOString(),
    };
    
    history.unshift(entryToSave); // Add to the beginning
    await fs.writeFile(DATA_PATH, JSON.stringify(history, null, 2));
    
    return Response.json({ success: true, entry: entryToSave });
  } catch (error) {
    console.error('Error saving history:', error);
    return Response.json({ success: false, error: 'Failed to save history' }, { status: 500 });
  }
}
