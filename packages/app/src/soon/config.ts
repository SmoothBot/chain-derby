import { Commitment } from "@solana/web3.js";

export interface SoonChainConfig {
  id: string;
  name: string;
  endpoint: string;              // RPC URL
  color: string;                 // UI accent
  logo: string;                  // Logo path
  commitment: Commitment;        // "confirmed"
  faucetUrl?: string;            // Optional faucet URL
  explorerUrl: string;           // Block explorer URL
  testnet: boolean;              // Is this a testnet
  layer: 'L2';                  // Layer classification - SOON is an L2
}

export const soonTestnet: SoonChainConfig = {
  id: "soon-testnet",
  name: "SOON Testnet",
  endpoint: process.env.NEXT_PUBLIC_SOON_TESTNET_RPC_URL ?? "https://rpc.testnet.soo.network/rpc",
  color: "#DC2626", // Red color
  logo: "/logos/soon.png", 
  commitment: "confirmed",
  explorerUrl: "https://explorer.soo.network",
  testnet: true,
  faucetUrl: "https://faucet.soo.network",
  layer: 'L2',
  // Note: airdrop function doesn't work in web3.js for SOON
};

export const soonMainnet: SoonChainConfig = {
  id: "soon-mainnet",
  name: "SOON Mainnet",
  endpoint: process.env.NEXT_PUBLIC_SOON_MAINNET_RPC_URL ?? "https://rpc.mainnet.soo.network/rpc",
  color: "#B91C1C", // Slightly darker red for mainnet
  logo: "/logos/soon.png", 
  commitment: "confirmed",
  explorerUrl: "https://explorer.mainnet.soo.network",
  testnet: false,
  layer: 'L2',
  // No faucetUrl for mainnet
};

export const soonChains: SoonChainConfig[] = [
  soonTestnet,
  soonMainnet,
];