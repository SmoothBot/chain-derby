import { Chain } from "viem";
import { sepoliaTestnet as riseSepoliaConfig } from "./sepolia";

export interface ChainConfig {
  id: number;
  name: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: {
    default: {
      http: string[];
    };
    public?: {
      http: string[];
    };
  };
  blockExplorers: {
    default: {
      name: string;
      url: string;
    };
  };
  testnet: boolean;
  color: string; // For UI styling
  emoji: string; // For horse race UI
}

// export const ethereumSepolia: ChainConfig = {
//   id: 11155111,
//   name: "Ethereum Sepolia",
//   nativeCurrency: { name: "Sepolia Ether", symbol: "ETH", decimals: 18 },
//   rpcUrls: {
//     default: {
//       http: ["https://rpc.sepolia.org"],
//     },
//     public: {
//       http: ["https://rpc.sepolia.org"],
//     },
//   },
//   blockExplorers: {
//     default: {
//       name: "Etherscan",
//       url: "https://sepolia.etherscan.io",
//     },
//   },
//   testnet: true,
//   color: "#627EEA",
//   emoji: "🐎",
// } as const satisfies Chain;

// export const polygonMumbai: ChainConfig = {
//   id: 80001,
//   name: "Polygon Mumbai",
//   nativeCurrency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
//   rpcUrls: {
//     default: {
//       http: ["https://rpc-mumbai.maticvigil.com"],
//     },
//     public: {
//       http: ["https://rpc-mumbai.maticvigil.com"],
//     },
//   },
//   blockExplorers: {
//     default: {
//       name: "PolygonScan",
//       url: "https://mumbai.polygonscan.com",
//     },
//   },
//   testnet: true,
//   color: "#8247E5",
//   emoji: "🦄",
// } as const satisfies Chain;

// export const arbitrumSepolia: ChainConfig = {
//   id: 421614,
//   name: "Arbitrum Sepolia",
//   nativeCurrency: { name: "Arbitrum Sepolia Ether", symbol: "ETH", decimals: 18 },
//   rpcUrls: {
//     default: {
//       http: ["https://sepolia-rollup.arbitrum.io/rpc"],
//     },
//     public: {
//       http: ["https://sepolia-rollup.arbitrum.io/rpc"],
//     },
//   },
//   blockExplorers: {
//     default: {
//       name: "Arbiscan",
//       url: "https://sepolia.arbiscan.io",
//     },
//   },
//   testnet: true,
//   color: "#28A0F0",
//   emoji: "⚡",
// } as const satisfies Chain;

// export const optimismSepolia: ChainConfig = {
//   id: 11155420,
//   name: "Optimism Sepolia",
//   nativeCurrency: { name: "Optimism Sepolia Ether", symbol: "ETH", decimals: 18 },
//   rpcUrls: {
//     default: {
//       http: ["https://sepolia.optimism.io"],
//     },
//     public: {
//       http: ["https://sepolia.optimism.io"],
//     },
//   },
//   blockExplorers: {
//     default: {
//       name: "Optimistic Etherscan",
//       url: "https://sepolia-optimism.etherscan.io",
//     },
//   },
//   testnet: true,
//   color: "#FF0420",
//   emoji: "🔴",
// } as const satisfies Chain;

// export const baseSepolia: ChainConfig = {
//   id: 84532,
//   name: "Base Sepolia",
//   nativeCurrency: { name: "Base Sepolia Ether", symbol: "ETH", decimals: 18 },
//   rpcUrls: {
//     default: {
//       http: ["https://sepolia.base.org"],
//     },
//     public: {
//       http: ["https://sepolia.base.org"],
//     },
//   },
//   blockExplorers: {
//     default: {
//       name: "BaseScan",
//       url: "https://sepolia.basescan.org",
//     },
//   },
//   testnet: true,
//   color: "#0052FF",
//   emoji: "🔵",
// } as const satisfies Chain;

// RISE Testnet (using the sepolia config from ./sepolia.ts)
export const riseTestnet: ChainConfig = {
  ...riseSepoliaConfig,
  testnet: true,
  color: "#00C2FF",
  emoji: "🚀",
} as const satisfies Chain;

// Monad Testnet
export const monadTestnet: ChainConfig = {
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
  color: "#9400D3", // Purple color for Monad
  emoji: "🔮", // Crystal ball for Monad
} as const satisfies Chain;

// Add the chains we want to include in the race
export const raceChains = [
  // ethereumSepolia,
  // polygonMumbai,
  // arbitrumSepolia,
  // optimismSepolia,
  // baseSepolia,
  riseTestnet,
  monadTestnet,
];

// Keep this for compatibility
export const supportedChains = raceChains.map(chain => ({ chainId: chain.id }));
export const defaultChain = supportedChains[0];