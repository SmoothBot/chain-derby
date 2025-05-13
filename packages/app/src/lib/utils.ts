import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

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
