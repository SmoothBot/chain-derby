import { RaceSessionPayload } from "@/hooks/useChainRace";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function saveRaceResults(payload: RaceSessionPayload): Promise<void> {
  // Add timeout to prevent hanging requests
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

  try {
    const response = await fetch(`${API_BASE_URL}/api/race-sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new Error(`API responded with ${response.status}: ${errorText}`);
    }

    // Don't wait for response body parsing - we just need to know it was accepted
    return;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      throw new Error('Request timed out - analytics server may be unavailable');
    }
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Unable to connect to analytics server - network or server issue');
    }
    
    throw error;
  }
}