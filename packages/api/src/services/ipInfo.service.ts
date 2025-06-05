// Use the native fetch API instead of node-fetch

export interface IpInfoResponse {
  ip: string;
  hostname?: string;
  city?: string;
  region?: string;
  country?: string;
  loc?: string;
  org?: string;
  postal?: string;
  timezone?: string;
}

/**
 * Fetch location information for an IP address using ipinfo.io
 * @param ip The IP address to lookup
 * @returns The location information
 */
export async function getIpInfo(ip: string): Promise<IpInfoResponse> {
  try {
    // Get API token from environment variable (optional)
    const token = process.env.IPINFO_TOKEN;
    
    // Add token parameter if it exists
    const tokenParam = token ? `?token=${token}` : '';
    
    const response = await fetch(`https://ipinfo.io/${ip}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch IP info: ${response.statusText}`);
    }
    
    const data = await response.json() as IpInfoResponse;
    return data;
  } catch (error) {
    console.error('Error fetching IP info:', error);
    // Return basic IP info with the IP itself if there's an error
    return { ip };
  }
}

/**
 * Extract location information from IP info response
 * @param ipInfo The IP info response
 * @returns Formatted location data for storing in the database
 */
export function extractLocationData(ipInfo: IpInfoResponse) {
  return {
    ipAddress: ipInfo.ip,
    country: ipInfo.country,
    region: ipInfo.region,
    city: ipInfo.city,
    coordinates: ipInfo.loc,
    isp: ipInfo.org,
    timezone: ipInfo.timezone,
  };
}