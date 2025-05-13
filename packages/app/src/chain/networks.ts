import { Chain } from "viem";
import { sonic, base, megaethTestnet, unichain } from "viem/chains";
import { sepoliaTestnet as riseSepoliaConfig } from "./sepolia";

export interface ChainConfig extends Chain {
  testnet: boolean;
  color: string; // For UI styling
  emoji: string; // For horse race UI
  logo: string; // For logo path
}

// RISE Testnet (using the sepolia config from ./sepolia.ts)
export const riseTestnet = {
  ...riseSepoliaConfig,
  testnet: true,
  color: "#7967E5",
  emoji: "🐎",
  logo: "/logos/rise.png",
} as const as ChainConfig;

// Monad Testnet
export const monadTestnet = {
  id: 10143,
  name: "Monad Testnet",
  nativeCurrency: { name: "Monad", symbol: "MONAD", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://testnet-rpc.monad.xyz"],
    },
    public: {
      http: ["https://testnet-rpc.monad.xyz"],
    },
  },
  blockExplorers: {
    default: {
      name: "Monad Explorer",
      url: "https://testnet.monadexplorer.xyz",
    },
  },
  testnet: true,
  color: "#200053", // Purple color for Monad
  emoji: "🐎", // Crystal ball for Monad
  logo: "/logos/monad.png",
} as const as ChainConfig;

// MegaETH Testnet
export const megaEthTestnet = {
  ...megaethTestnet,
  color: "#8e8d8f", // Blue color for MegaETH
  emoji: "🐎", // Lightning bolt for speed
  logo: "/logos/megaeth.png",
} as const as ChainConfig;

// Base Mainnet
export const baseMainnet = {
  ...base,
  testnet: false,
  color: "#0052FF", // Blue color for Base
  emoji: "🐎", // Blue circle for Base
  logo: "/logos/base.png",
} as const as ChainConfig;

// Sonic Testnet
export const sonicMainnet = {
  ...sonic,
  testnet: false,
  color: "#00AEE9", // Teal/Blue color for Sonic
  emoji: "🐎", // Sonic theme
  logo: "/logos/sonic.png",
} as const as ChainConfig;

// Unichain
export const unichainMainnet = {
  ...unichain,
  testnet: false,
  color: "#FF007A", // Uniswap pink color for unichain
  emoji: "🐎", // Unichain theme
  logo: "/logos/unichain.png",
} as const as ChainConfig;

// Add the chains we want to include in the race
export const raceChains = [
  riseTestnet,
  megaEthTestnet,
  monadTestnet,
  sonicMainnet,
  baseMainnet,
  unichainMainnet,
];



// Keep this for compatibility
export const supportedChains = raceChains.map(chain => ({ chainId: chain.id }));