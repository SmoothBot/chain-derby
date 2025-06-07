export interface FuelChainConfig {
  id: string;
  name: string;
  network: string;
  nativeCurrency: {
    decimals: number;
    name: string;
    symbol: string;
  };
  rpcUrls: {
    public: {
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
  color: string;
  logo: string;
  faucetUrl?: string;
}

// Fuel Testnet
export const fuelTestnet: FuelChainConfig = {
  id: '0',
  name: 'Fuel Testnet',
  network: 'fuel-testnet',
  nativeCurrency: {
    decimals: 9,
    name: 'ETH',
    symbol: 'ETH',
  },
  rpcUrls: {
    public: {
      http: [process.env.NEXT_PUBLIC_FUEL_TESTNET_RPC_URL || 'https://testnet.fuel.network/v1/graphql'],
    },
  },
  blockExplorers: {
    default: { name: 'Fuel Explorer', url: 'https://app-testnet.fuel.network' },
  },
  testnet: true,
  color: "#00F58C", // Fuel's brand color
  logo: "/logos/fuel.png",
  faucetUrl: "https://faucet-testnet.fuel.network/",
};

// Export all Fuel chains
export const fuelChains = [fuelTestnet];

// Helper function to check if a chain is a Fuel chain
export function isFuelChain(chain: any): chain is FuelChainConfig {
  return chain.id === 'fuel-testnet';
}
