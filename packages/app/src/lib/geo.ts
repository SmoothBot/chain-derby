export async function getGeo(): Promise<{city?:string; region?:string; country?:string}> {
  try {
    // Add timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    // Get IP address
    const ipResponse = await fetch('https://api.ipify.org?format=json', {
      signal: controller.signal
    });
    
    if (!ipResponse.ok) {
      throw new Error('Failed to get IP address');
    }
    
    const { ip } = await ipResponse.json();
    
    // Get geolocation info - include token if available
    const token = process.env.NEXT_PUBLIC_IPINFO_TOKEN;
    const geoUrl = token ? `https://ipinfo.io/${ip}?token=${token}` : `https://ipinfo.io/${ip}`;
    
    const geoResponse = await fetch(geoUrl, {
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!geoResponse.ok) {
      throw new Error('Failed to get geolocation data');
    }
    
    const info = await geoResponse.json();
    
    return { 
      city: info.city || undefined, 
      region: info.region || undefined, 
      country: info.country || undefined 
    };
  } catch {
    return {}; // Return empty object if geo fails
  }
}