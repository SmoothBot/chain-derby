import { Cluster, clusterApiUrl, Commitment } from "@solana/web3.js";

export interface SolanaChainConfig {
  id: string;
  name: string;
  cluster: Cluster;              // "testnet" | "devnet" | "mainnet-beta"
  endpoint: string;              // RPC URL
  color: string;                 // UI accent
  logo: string;                  // /public/logos/solana.png
  commitment: Commitment;        // "confirmed"
  faucetUrl?: string;            // Optional for mainnet
}

export const solanaTestnet: SolanaChainConfig = {
  id: "solana-testnet",
  name: "Solana Testnet",
  cluster: "testnet",
  endpoint: process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? clusterApiUrl("testnet"),
  color: "#9945FF",
  logo: "/logos/solana.png",
  commitment: "confirmed",
  faucetUrl: "https://faucet.solana.com",
};

export const solanaDevnet: SolanaChainConfig = {
  id: "solana-devnet",
  name: "Solana Devnet",
  cluster: "devnet",
  endpoint: process.env.NEXT_PUBLIC_SOLANA_DEVNET_RPC_URL ?? clusterApiUrl("devnet"),
  color: "#9945FF",
  logo: "/logos/solana.png",
  commitment: "confirmed",
  faucetUrl: "https://faucet.solana.com",
};

export const solanaMainnet: SolanaChainConfig = {
  id: "solana-mainnet",
  name: "Solana Mainnet",
  cluster: "mainnet-beta",
  endpoint: process.env.NEXT_PUBLIC_SOLANA_MAINNET_RPC_URL ?? 'https://solana.drpc.org',
  color: "#9945FF",
  logo: "/logos/solana.png",
  commitment: "confirmed",
  // No faucet URL for mainnet
};

export const solanaChains: SolanaChainConfig[] = [
  solanaTestnet,
  // solanaDevnet,
  // solanaMainnet,
];