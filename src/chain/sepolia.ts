/**
 * RISE Testnet
 *
 * Docs: https://wagmi.sh/core/api/chains#create-chain
 */

import { type Chain } from "viem";

export const sepoliaTestnet = {
  id: 11155931,
  name: "RISE Testnet",
  nativeCurrency: { name: "Ethereum", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://testnet.riselabs.xyz/"],
    },
  },
  blockExplorers: {
    default: {
      name: "RISE Testnet",
      url: "https://explorer.testnet.riselabs.xyz/",
    },
  },
  // contracts: {} // Add as needed
} as const satisfies Chain;

export const testnetConfig = {
  chainId: "0xAA39DB",
  chainName: "RISE Testnet",
  nativeCurrency: { name: "Ethereum", symbol: "ETH", decimals: 18 },
  rpcUrls: ["https://testnet.riselabs.xyz/"],
  blockExplorerUrls: ["https://explorer.testnet.riselabs.xyz/"],
};
