import { Chain, defineChain } from "viem";
import { megaethTestnet, baseSepolia, monadTestnet, riseTestnet } from "viem/chains";
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

const riseTestnet_ = {
  ...riseTestnet,
  rpcUrls: getRpcUrls(riseTestnet, process.env.NEXT_PUBLIC_RISE_TESTNET_RPC_URL),
  testnet: true,
  color: "#7967E5",
  logo: "/logos/rise.png",
  faucetUrl: "https://faucet.testnet.riselabs.xyz/",
} as const as ChainConfig;

// Monad Testnet
const monadTestnet_ = {
  ...monadTestnet,
  rpcUrls: getRpcUrls(monadTestnet, process.env.NEXT_PUBLIC_MONAD_TESTNET_RPC_URL),
  testnet: true,
  color: "#200053", // Purple color for Monad
  logo: "/logos/monad.png",
  faucetUrl: "https://faucet.monad.xyz/",
} as const as ChainConfig;

// MegaETH Testnet
const megaEthTestnet = {
  ...megaethTestnet,
  rpcUrls: getRpcUrls(megaethTestnet, process.env.NEXT_PUBLIC_MEGAETH_TESTNET_RPC_URL),
  color: "#8e8d8f", // Blue color for MegaETH
  logo: "/logos/megaeth.png",
  faucetUrl: "https://testnet.megaeth.com/",
} as const as ChainConfig;

const sonicBlaze = {
  ...defineChain({
    name: "Sonic Blaze",
    chainNamespace: "eip155",
    caipNetworkId: "eip155:57054",
    id: 57054,
    nativeCurrency: {
      name: "Sonic Blaze",
      symbol: "bS",
      decimals: 18
    },
    assets: {
      imageId: "sonic-blaze",
      imageUrl: "https://images.blockscan.com/chain-logos/sonic.svg",
      iconUrl: "https://images.blockscan.com/chain-logos/sonic.svg"
    },
    blockExplorers: {
      default: {
        name: "Sonic Blaze Explorer",
        url: process.env.NEXT_PUBLIC_BLAZE_EXPLORER_URL || "https://testnet.sonicscan.org",
        apiUrl: process.env.NEXT_PUBLIC_BLAZE_API_URL || "https://api.testnet.sonicscan.org",
        iconUrl: "https://explorer.blaze.soniclabs.com/favicon.ico"
      }
    },
    rpcUrls: {
      default: {
        http: [process.env.NEXT_PUBLIC_BLAZE_RPC_URL || "https://rpc.blaze.soniclabs.com"]
      }
    }
  }),
  testnet: true,
  color: "#00AEE9",
  logo: "/logos/sonic.png",

  faucetUrl: "https://testnet.soniclabs.com/account"
} as const as ChainConfig;

// Base Sepolia with preconf RPC
const baseSepolia_ = {
  ...baseSepolia,
  rpcUrls: getRpcUrls(baseSepolia, process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL),
  testnet: true,
  color: "#0052FF", // Blue color for Base
  logo: "/logos/base.png",
  faucetUrl: "https://www.alchemy.com/faucets/base-sepolia",
} as const as ChainConfig;

// Add the EVM chains we want to include in the race
export const evmChains = [riseTestnet_, monadTestnet_, megaEthTestnet, sonicBlaze, baseSepolia_];

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