import { Chain } from "viem";
import { sonicTestnet, megaethTestnet, baseSepolia, monadTestnet, riseTestnet } from "viem/chains";
import { solanaChains, type SolanaChainConfig } from "@/solana/config";

export interface ChainConfig extends Chain {
  testnet: boolean;
  color: string; // For UI styling
  logo: string; // For logo path
  faucetUrl?: string; // Faucet URL for testnet chains
}

function getRpcUrls(chain: Chain, url: string | undefined) {
  return {
    ...chain.rpcUrls,
    default: {
      http: [url || chain.rpcUrls.default.http[0]]
    },
  }
}

const riseTestnetConf = {
  ...riseTestnet,
  rpcUrls: getRpcUrls(riseTestnet, process.env.NEXT_PUBLIC_RISE_TESTNET_RPC_URL),
  testnet: true,
  color: "#7967E5",
  logo: "/logos/rise.png",
  faucetUrl: "https://faucet.testnet.riselabs.xyz/",
} as const as ChainConfig;

// Monad Testnet
const monadTestnetConf = {
  ...monadTestnet,
  rpcUrls: getRpcUrls(monadTestnet, process.env.NEXT_PUBLIC_MONAD_TESTNET_RPC_URL),
  testnet: true,
  color: "#200053", // Purple color for Monad
  logo: "/logos/monad.png",
  faucetUrl: "https://faucet.monad.xyz/",
} as const as ChainConfig;

// MegaETH Testnet
const megaethTestnetConf = {
  ...megaethTestnet,
  rpcUrls: getRpcUrls(megaethTestnet, process.env.NEXT_PUBLIC_MEGAETH_TESTNET_RPC_URL),
  color: "#8e8d8f", // Blue color for MegaETH
  logo: "/logos/megaeth.png",
  faucetUrl: "https://testnet.megaeth.com/",
} as const as ChainConfig;

// Sonic Mainnet
// const sonicMainnet = {
//   ...sonic,
//   rpcUrls: getRpcUrls(sonic, process.env.NEXT_PUBLIC_SONIC_MAINNET_RPC_URL),
//   testnet: false,
//   color: "#00AEE9", // Teal/Blue color for Sonic
//   logo: "/logos/sonic.png",
// } as const as ChainConfig;

// Sonic Testnet
const sonicTestnetConf = {
  ...sonicTestnet,
  // rpcUrls: getRpcUrls(sonicTestnet, process.env.NEXT_PUBLIC_SONIC_TESTNET_RPC_URL),
  rpcUrls: getRpcUrls(sonicTestnet, 'https://rpc.blaze.soniclabs.com'),
  testnet: true,
  color: "#00AEE9", // Teal/Blue color for Sonic
  logo: "/logos/sonic.png",
} as const as ChainConfig;

// Base Sepolia with preconf RPC
const baseTestnetConf = {
  ...baseSepolia,
  rpcUrls: getRpcUrls(baseSepolia, process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL),
  testnet: true,
  color: "#0052FF", // Blue color for Base
  logo: "/logos/base.png",
  faucetUrl: "https://www.alchemy.com/faucets/base-sepolia",
} as const as ChainConfig;

// Add the EVM chains we want to include in the race
export const evmChains = [
  riseTestnetConf,
  monadTestnetConf,
  megaethTestnetConf,
  sonicTestnetConf,
  baseTestnetConf,
];

// All chains (EVM + Solana)
export const allChains = [...evmChains, ...solanaChains];

// Backward compatibility - rename raceChains to evmChains
export const raceChains = evmChains;

// Keep this for compatibility
export const getRaceChains = () => {
  console.log('Fetching derby chains...');
  console.log('Chains:', evmChains.map(chain => chain.rpcUrls).join(', '));
  return evmChains
}

// Export chain type union
export type AnyChainConfig = ChainConfig | SolanaChainConfig;