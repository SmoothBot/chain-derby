import { Chain } from "viem";
import { megaethTestnet, baseSepolia, monadTestnet, riseTestnet, somniaTestnet, seiTestnet } from "viem/chains";
import { solanaChains, type SolanaChainConfig } from "@/solana/config";
import { sonicBlaze } from "./sonicblaze";
import { fuelChains, type FuelChainConfig } from "@/fuel/config";

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

const monadTestnet_ = {
  ...monadTestnet,
  rpcUrls: getRpcUrls(monadTestnet, process.env.NEXT_PUBLIC_MONAD_TESTNET_RPC_URL),
  testnet: true,
  color: "#200053", // Purple color for Monad
  logo: "/logos/monad.png",
  faucetUrl: "https://faucet.monad.xyz/",
} as const as ChainConfig;

const megaethTestnet_ = {
  ...megaethTestnet,
  rpcUrls: getRpcUrls(megaethTestnet, process.env.NEXT_PUBLIC_MEGAETH_TESTNET_RPC_URL),
  color: "#8e8d8f", // Blue color for MegaETH
  logo: "/logos/megaeth.png",
  faucetUrl: "https://testnet.megaeth.com/",
} as const as ChainConfig;

const sonicBlaze_ = {
  ...sonicBlaze,
  rpcUrls: getRpcUrls(sonicBlaze, process.env.NEXT_PUBLIC_SONIC_BLAZE_RPC_URL),
  testnet: true,
  color: "#00AEE9",
  logo: "/logos/sonic.png",

  faucetUrl: "https://testnet.soniclabs.com/account"
} as const as ChainConfig;

const baseSepolia_ = {
  ...baseSepolia,
  rpcUrls: getRpcUrls(baseSepolia, process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL),
  testnet: true,
  color: "#0052FF", // Blue color for Base
  logo: "/logos/base.png",
  faucetUrl: "https://www.alchemy.com/faucets/base-sepolia",
} as const as ChainConfig;

const somniaTestnet_ = {
  ...somniaTestnet,
  rpcUrls: getRpcUrls(somniaTestnet, process.env.NEXT_PUBLIC_SOMNIA_TESTNET_RPC_URL),
  color: "#A533FF",
  logo: "/logos/somnia.png",
  faucetUrl: "https://testnet.somnia.network/",
} as const as ChainConfig;

const seiTestnet_ = {
  ...seiTestnet,
  rpcUrls: getRpcUrls(seiTestnet, process.env.NEXT_PUBLIC_SOMNIA_TESTNET_RPC_URL),
  color: "#A533FF",
  logo: "/logos/sei.svg",
  faucetUrl: "https://testnet.somnia.network/",
} as const as ChainConfig;

// Add the EVM chains we want to include in the race
export const evmChains = [
  riseTestnet_, 
  monadTestnet_, 
  megaethTestnet_, 
  sonicBlaze_, 
  baseSepolia_, 
  somniaTestnet_,
  seiTestnet_
];

// All chains (EVM + Solana + Fuel)
export const allChains = [...evmChains, ...solanaChains, ...fuelChains];

// Backward compatibility - rename raceChains to evmChains
export const raceChains = evmChains;

// Export chain type union
export type AnyChainConfig = ChainConfig | SolanaChainConfig | FuelChainConfig;