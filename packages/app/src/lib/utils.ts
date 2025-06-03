import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Share content to Twitter
 * @param text Tweet text content
 * @param imageDataUrl Optional data URL for an image to be shared
 * @param hashtags Optional array of hashtags without # symbol
 */
export const shareToTwitter = async (
  text: string, 
  imageDataUrl?: string | null, 
  hashtags: string[] = []
) => {
  // For direct Twitter sharing with image, we'd need a server endpoint
  // to upload the image to Twitter's API, which requires auth
  // Here, we'll use a fallback approach of downloading the image
  // and instructing the user to attach it manually
  if (imageDataUrl) {
    try {
      // Convert data URL to blob for download
      const blob = await fetch(imageDataUrl).then(r => r.blob());
      
      // Create a download link for the image
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = 'chain-derby-results.png';
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(downloadUrl);
      }, 100);
      
      // Add instruction to attach the image
      text += "\n\n(Please attach the downloaded image to your tweet)";
    } catch (error) {
      console.error('Failed to process image for sharing:', error);
    }
  }
  
  // Base tweet URL
  let tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
  
  // Add hashtags if provided
  if (hashtags.length > 0) {
    tweetUrl += `&hashtags=${encodeURIComponent(hashtags.join(','))}`;
  }
  
  // Open Twitter intent in a new window
  window.open(tweetUrl, '_blank');
};

/**
 * Capture a DOM element as an image
 * @param sourceEl The DOM element to capture
 * @returns Promise that resolves to a data URL of the image
 */
export const captureElementAsImage = async (sourceEl: HTMLElement): Promise<string | null> => {
  try {
    // Dynamically import html-to-image to avoid SSR issues
    const { toPng } = await import('html-to-image');
    const { normaliseOklch } = await import('./oklch-to-rgb');
    
    if (!sourceEl) {
      console.error('Element not found');
      return null;
    }

    console.log('Starting image capture for element:', sourceEl);

    // Detect if we're in dark mode
    const isDarkMode = document.documentElement.classList.contains('dark') || 
                      document.documentElement.getAttribute('data-theme') === 'dark' ||
                      window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    const backgroundColor = isDarkMode ? '#0a0a0a' : '#ffffff';
    console.log('Using background color:', backgroundColor, 'isDarkMode:', isDarkMode);

    // Apply OKLCH normalization to source element before capturing
    console.log('Processing element for OKLCH conversion');
    normaliseOklch(sourceEl);

    // Try capturing the element directly
    return await toPng(sourceEl, {
      pixelRatio: 2,
      cacheBust: true,
      backgroundColor: backgroundColor,
      width: sourceEl.offsetWidth,
      height: sourceEl.offsetHeight,
      style: {
        margin: '0',
        padding: '0'
      },
      filter: (node: HTMLElement) => {
        // Skip script tags and other problematic elements
        if (node.tagName === 'SCRIPT' || node.tagName === 'STYLE') {
          return false;
        }
        return true;
      }
    });
  } catch (error) {
    console.error('Failed to capture element as image:', error);
    return null;
  }
};

/**
 * Share race results to Twitter
 * @param winnerName Name of the winning chain
 * @param winnerTime Time taken by the winner
 * @param totalChains Total number of chains in the race
 * @param imageDataUrl Optional data URL of the leaderboard image
 */
export const shareRaceResults = async (
  winnerName: string, 
  winnerTime: number, 
  totalChains: number,
  imageDataUrl?: string | null
) => {
  const text = `🏆 ${winnerName} just won my Chain Derby race with a blazing fast ${winnerTime}ms transaction time! Raced against ${totalChains} different blockchains.`;
  
  await shareToTwitter(text, imageDataUrl);
};

/**
 * This util will return a masked address
 * @param address string
 * @returns string
 */
export const getMaskedAddress = (address: string, index = 6) => {
  return `${address.slice(0, index)}...${address.slice(-index)}`;
};

/**
 * This will get the value of the provided key
 * from the document.cookie
 * @param key string
 * @returns value of string
 */
export const parseCookie = (key: string) => {
  const attributes =
    typeof window !== "undefined" && document.cookie.split(`; ${key}=`);

  if (attributes && attributes.length === 2) {
    const value = attributes?.pop()?.split(";")?.shift();

    return value;
  }
};
