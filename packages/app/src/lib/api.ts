import { RaceSessionPayload } from "@/hooks/useChainRace";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function saveRaceResults(payload: RaceSessionPayload): Promise<void> {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  if (isDevelopment) {
    console.log('🏎️ [Chain Derby API] Submitting race results to API...');
    console.log('📍 API URL:', `${API_BASE_URL}/api/race-sessions`);
    console.log('📦 Payload:', JSON.stringify(payload, null, 2));
  }

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

    if (isDevelopment) {
      console.log('📡 [Chain Derby API] Response status:', response.status);
      console.log('📡 [Chain Derby API] Response headers:', Object.fromEntries(response.headers));
    }

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      if (isDevelopment) {
        console.error('❌ [Chain Derby API] Error response body:', errorText);
      }
      throw new Error(`API responded with ${response.status}: ${errorText}`);
    }

    if (isDevelopment) {
      console.log('✅ [Chain Derby API] Race results submitted successfully!');
    }

    // Don't wait for response body parsing - we just need to know it was accepted
    return;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (isDevelopment) {
      console.error('💥 [Chain Derby API] Request failed:', error);
    }
    
    if (error instanceof Error && error.name === 'AbortError') {
      if (isDevelopment) {
        console.error('⏰ [Chain Derby API] Request timed out after 10 seconds');
      }
      throw new Error('Request timed out - analytics server may be unavailable');
    }
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      if (isDevelopment) {
        console.error('🌐 [Chain Derby API] Network/fetch error occurred');
      }
      throw new Error('Unable to connect to analytics server - network or server issue');
    }
    
    throw error;
  }
}