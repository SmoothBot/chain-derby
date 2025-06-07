import { defineChain } from "viem";

export const sonicBlaze = defineChain({
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
  })