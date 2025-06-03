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
 * @param elementId The ID of the DOM element to capture
 * @returns Promise that resolves to a data URL of the image
 */
export const captureElementAsImage = async (elementRef: HTMLElement): Promise<string | null> => {
  try {
    // Dynamically import html2canvas to avoid SSR issues
    const html2canvas = (await import('html2canvas')).default;
    
    if (!elementRef) {
      console.error('Element not found');
      return null;
    }

    // Create a clone of the element to modify without affecting the UI
    const clonedElement = elementRef.cloneNode(true) as HTMLElement;
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '-9999px';
    
    // Add to document to ensure it's rendered properly for capturing
    document.body.appendChild(tempContainer);
    tempContainer.appendChild(clonedElement);
    
    // Set a fixed width equal to the original element to maintain layout
    clonedElement.style.width = `${elementRef.offsetWidth}px`;
    
    // Find and replace "oklch" colors with RGB equivalents in the clone
    // This is a workaround for html2canvas not supporting oklch color format
    const elementsWithStyles = clonedElement.querySelectorAll('*');
    elementsWithStyles.forEach((el) => {
      const element = el as HTMLElement;
      if (element.style) {
        // Get the computed style to get actual color values
        const computedStyle = window.getComputedStyle(element);
        
        // Set the background color using computed RGB values
        if (computedStyle.backgroundColor) {
          element.style.backgroundColor = computedStyle.backgroundColor;
        }
        
        // Set text color using computed RGB values
        if (computedStyle.color) {
          element.style.color = computedStyle.color;
        }
        
        // Set border color using computed RGB values
        if (computedStyle.borderColor) {
          element.style.borderColor = computedStyle.borderColor;
        }
      }
    });
    
    // Create a canvas from the cloned and fixed element
    const canvas = await html2canvas(clonedElement, {
      scale: 2, // Higher scale for better quality
      useCORS: true, // Allow images from other domains
      logging: false,
      backgroundColor: '#ffffff', // White background instead of transparent
      ignoreElements: (element) => {
        // Skip any elements that might still cause issues
        return element.tagName === 'IFRAME' || 
               (element.nodeName === '#text' && element.nodeValue?.includes('oklch')) || false;
      }
    });
    
    // Clean up - remove the temporary container
    document.body.removeChild(tempContainer);
    
    // Convert the canvas to a data URL
    return canvas.toDataURL('image/png');
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
  
  const hashtags = ['ChainDerby', 'Blockchain', 'Web3', 'TransactionSpeed'];
  
  await shareToTwitter(text, imageDataUrl, hashtags);
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
