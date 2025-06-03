import { Chain } from "viem";
import { sonic, base, megaethTestnet, baseSepolia, monadTestnet, riseTestnet } from "viem/chains";

export interface ChainConfig extends Chain {
  testnet: boolean;
  color: string; // For UI styling
  logo: string; // For logo path
  faucetUrl?: string; // Faucet URL for testnet chains
}

export const riseTestnet_ = {
  ...riseTestnet,
  testnet: true,
  color: "#7967E5",
  logo: "/logos/rise.png",
  faucetUrl: "https://faucet.testnet.riselabs.xyz/",
} as const as ChainConfig;

// Monad Testnet
export const monadTestnet_ = {
  ...monadTestnet,
  testnet: true,
  color: "#200053", // Purple color for Monad
  logo: "/logos/monad.png",
  faucetUrl: "https://faucet.monad.xyz/",
} as const as ChainConfig;

// MegaETH Testnet
export const megaEthTestnet = {
  ...megaethTestnet,
  color: "#8e8d8f", // Blue color for MegaETH
  logo: "/logos/megaeth.png",
  faucetUrl: "https://testnet.megaeth.com/",
} as const as ChainConfig;

// Base Mainnet
export const baseMainnet = {
  ...base,
  testnet: false,
  color: "#0052FF", // Blue color for Base
  logo: "/logos/base.png",
} as const as ChainConfig;

// Sonic Testnet
export const sonicMainnet = {
  ...sonic,
  testnet: false,
  color: "#00AEE9", // Teal/Blue color for Sonic
  logo: "/logos/sonic.png",
} as const as ChainConfig;

// Base Sepolia with preconf RPC
export const baseSepolia_ = {
  ...baseSepolia,
  testnet: true,
  color: "#0052FF", // Blue color for Base
  logo: "/logos/base.png",
  faucetUrl: "https://www.alchemy.com/faucets/base-sepolia",
} as const as ChainConfig;

// Add the chains we want to include in the race
export const raceChains = [
  riseTestnet_,
  monadTestnet_,
  megaEthTestnet,
  sonicMainnet,
  baseSepolia_,
];



// Keep this for compatibility
export const supportedChains = raceChains.map(chain => ({ chainId: chain.id }));