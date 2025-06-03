/**
 * Debounce utility function
 * @param func The function to debounce
 * @param wait The number of milliseconds to delay
 * @returns A debounced version of the function
 */
export function debounce<T extends (...args: unknown[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

/**
 * React hook for creating a debounced callback
 * @param callback The callback function to debounce
 * @param delay The delay in milliseconds
 * @param deps Dependencies array for the callback
 * @returns A memoized debounced callback
 */
import { useCallback, useRef } from 'react';

export function useDebounce<T extends (...args: unknown[]) => void>(
  callback: T,
  delay: number,
  deps: React.DependencyList = []
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay, ...deps] // eslint-disable-line react-hooks/exhaustive-deps
  );
}