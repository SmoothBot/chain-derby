import { sepolia } from "@starknet-react/chains";
export interface StarknetChainConfig {
    id: string;
    name: string;
    network: 'testnet' | 'mainnet' | 'sepolia';
    rpcUrl: string;
    indexerUrl?: string;
    faucetUrl?: string;
    explorerUrl: string;
    nativeCurrency: {
      name: string;
      symbol: string;
      decimals: number;
    };
    testnet: boolean;
    color: string;
    logo: string;
    layer: 'L1' | 'L2';
  }
  
  // Aptos Testnet
  export const starknetTestnet: StarknetChainConfig = {
    id: sepolia.id.toString(), // Use the Starknet Sepolia ID
    name: sepolia.name, // Use the Starknet Sepolia name
    network: sepolia.network, // Use the Starknet Sepolia network type
    rpcUrl: process.env.NEXT_PUBLIC_APTOS_TESTNET_RPC_URL || 'https://starknet-sepolia.blastapi.io',
    indexerUrl: 'https://indexer-testnet.staging.gcp.aptosdev.com/v1/graphql',
    faucetUrl: 'https://aptos.dev/en/network/faucet',
    explorerUrl: 'https://sepolia.voyager.online',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    testnet: true,
    color: '#4ADED6',
    logo: '/logos/aptos.png',
    layer: 'L2' as const,
  };

  
  // Export all Aptos chains
  export const starknetChains: StarknetChainConfig[] = [
    starknetTestnet
  ];
  
  // Helper function to check if a chain is an Aptos chain
  export function isStarknetChain(chain: unknown): chain is StarknetChainConfig {
    return typeof chain === 'object' && 
           chain !== null && 
           'id' in chain && 
           typeof chain.id === 'string' &&
           (chain.id.startsWith('Starknet'));
  }