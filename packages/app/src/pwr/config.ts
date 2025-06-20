export interface PwrChainConfig {
  id: string;
  name: string;
  rpcUrl: string;
  color: string;
  logo: string;
  testnet: boolean;
  layer: 'L1' | 'L2';
  faucetUrl?: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

export const pwrTestnet: PwrChainConfig = {
  id: 'pwr-testnet',
  name: 'PWR Testnet',
  rpcUrl: 'https://pwrrpc.pwrlabs.io',
  color: '#000000',
  logo: '/logos/pwrlabs.avif',
  testnet: true,
  layer: 'L1',
  faucetUrl: 'https://faucet.pwrlabs.io',
  nativeCurrency: {
    name: 'PWR',
    symbol: 'PWR',
    decimals: 18,
  },
};

export const pwrChains: PwrChainConfig[] = [
  pwrTestnet,
]; 