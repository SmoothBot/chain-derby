/**
 * Utility functions for chain colors using Tailwind CSS custom properties
 */

// Map chain IDs to their corresponding Tailwind color classes
const CHAIN_COLOR_MAP: Record<number | string, string> = {
  11155931: 'chain-rise',      // RISE Testnet
  10143: 'chain-monad',        // Monad Testnet  
  6342: 'chain-megaeth',       // MegaETH Testnet
  8453: 'chain-base',          // Base Mainnet
  17180: 'chain-sonic',        // Sonic Mainnet
  84532: 'chain-base',         // Base Sepolia (uses same color as Base)
  'solana-testnet': 'chain-solana', // Solana Testnet
  'solana-devnet': 'chain-solana',  // Solana Devnet
  'solana-mainnet': 'chain-solana', // Solana Mainnet
};

/**
 * Get the Tailwind color class for a chain
 * @param chainId - The chain ID (number for EVM chains, string for others)
 * @returns The Tailwind color class name (e.g., 'chain-rise')
 */
export function getChainColorClass(chainId: number | string): string {
  return CHAIN_COLOR_MAP[chainId] || 'chain-base'; // fallback to base color
}

/**
 * Get the Tailwind background color class for a chain
 * @param chainId - The chain ID (number for EVM chains, string for others)
 * @returns The Tailwind background color class (e.g., 'bg-chain-rise')
 */
export function getChainBgClass(chainId: number | string): string {
  return `bg-${getChainColorClass(chainId)}`;
}

/**
 * Get the Tailwind text color class for a chain
 * @param chainId - The chain ID (number for EVM chains, string for others)
 * @returns The Tailwind text color class (e.g., 'text-chain-rise')
 */
export function getChainTextClass(chainId: number | string): string {
  return `text-${getChainColorClass(chainId)}`;
}

/**
 * Get the Tailwind border color class for a chain
 * @param chainId - The chain ID (number for EVM chains, string for others)
 * @returns The Tailwind border color class (e.g., 'border-chain-rise')
 */
export function getChainBorderClass(chainId: number | string): string {
  return `border-${getChainColorClass(chainId)}`;
}

/**
 * Get CSS custom property for direct style usage (when Tailwind classes aren't sufficient)
 * @param chainId - The chain ID (number for EVM chains, string for others)
 * @returns The CSS custom property (e.g., 'var(--chain-rise)')
 */
export function getChainColorVar(chainId: number | string): string {
  const colorClass = getChainColorClass(chainId);
  return `var(--${colorClass})`;
}