export interface StarknetChainConfig {
    id: string;
    name: string;
    endpoint: string;              
    color: string;                 
    logo: string;                
    faucetUrl?: string;   
    nativeCurrency: {
        name: string;
        symbol: string;
        decimals: number;
      };
    layer: 'L1' | 'L2';   
    testnet: boolean;       
  }

export const starknetTestnet: StarknetChainConfig = {
    id: "starknet-testnet",
    name: "Starknet Testnet",
    endpoint: process.env.NEXT_PUBLIC_STARKNET_RPC_URL ?? "https://starknet-sepolia.public.blastapi.io/rpc/v0_7",
    color: "#9945FF",
    logo: "/logos/starknetlogo.png",
    faucetUrl: "https://starknet-faucet.vercel.app/",
    nativeCurrency: {
        name: 'Starknet',
        symbol: 'STRK',
        decimals: 18,
      },
    layer: 'L2' as const,
    testnet: true,
  };

export const starknetMainnet: StarknetChainConfig = {
    id: "starknet-mainnet",
    name: "Starknet Mainnet",
    endpoint: process.env.NEXT_PUBLIC_STARKNET_MAINNET_RPC_URL ?? "https://starknet-mainnet.public.blastapi.io",
    color: "#9945FF",
    logo: "/logos/starknetlogo.png",
    nativeCurrency: {
        name: 'Starknet',
        symbol: 'STRK',
        decimals: 18,
      },
    layer: 'L2' as const,
    testnet: false,
  };

export const starknetChains: StarknetChainConfig[] = [
    starknetTestnet,
    starknetMainnet,
  ];