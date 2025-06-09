export interface AptosChainConfig {
  id: string;
  name: string;
  network: 'testnet' | 'mainnet' | 'devnet';
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
export const aptosTestnet: AptosChainConfig = {
  id: 'aptos-testnet',
  name: 'Aptos Testnet',
  network: 'testnet',
  rpcUrl: process.env.NEXT_PUBLIC_APTOS_TESTNET_RPC_URL || 'https://api.testnet.aptoslabs.com/v1',
  indexerUrl: 'https://indexer-testnet.staging.gcp.aptosdev.com/v1/graphql',
  faucetUrl: 'https://faucet.testnet.aptoslabs.com',
  explorerUrl: 'https://explorer.aptoslabs.com/?network=testnet',
  nativeCurrency: {
    name: 'Aptos',
    symbol: 'APT',
    decimals: 8,
  },
  testnet: true,
  color: '#4ADED6',
  logo: '/logos/aptos.png',
  layer: 'L1' as const,
};

// Aptos Mainnet
export const aptosMainnet: AptosChainConfig = {
  id: 'aptos-mainnet',
  name: 'Aptos Mainnet',
  network: 'mainnet',
  rpcUrl: process.env.NEXT_PUBLIC_APTOS_MAINNET_RPC_URL || 'https://api.mainnet.aptoslabs.com/v1',
  indexerUrl: 'https://indexer.mainnet.aptoslabs.com/v1/graphql',
  explorerUrl: 'https://explorer.aptoslabs.com/?network=mainnet',
  nativeCurrency: {
    name: 'Aptos',
    symbol: 'APT',
    decimals: 8,
  },
  testnet: false,
  color: '#4ADED6',
  logo: '/logos/aptos.png',
  layer: 'L1' as const,
};

// Export all Aptos chains
export const aptosChains: AptosChainConfig[] = [
  aptosTestnet,
  aptosMainnet,
];

// Helper function to check if a chain is an Aptos chain
export function isAptosChain(chain: unknown): chain is AptosChainConfig {
  return typeof chain === 'object' && 
         chain !== null && 
         'id' in chain && 
         typeof chain.id === 'string' &&
         (chain.id.startsWith('aptos-'));
}