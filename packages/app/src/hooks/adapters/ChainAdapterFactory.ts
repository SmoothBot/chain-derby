import type { AnyChainConfig } from "@/chain/networks";
import type { SolanaChainConfig } from "@/solana/config";
import type { FuelChainConfig } from "@/fuel/config";
import type { AptosChainConfig } from "@/aptos/config";
import type { SoonChainConfig } from "@/soon/config";
import type { StarknetChainConfig } from "@/starknet/config";
import type { Chain } from "viem";

import { ChainAdapter } from "./base/ChainAdapter.interface";
import { EvmChainAdapter, type EvmWalletState } from "./EvmChainAdapter";
import { SolanaChainAdapter, type SolanaWalletState } from "./SolanaChainAdapter";
import { FuelChainAdapter, type FuelWalletState } from "./FuelChainAdapter";
import { AptosChainAdapter, type AptosWalletState } from "./AptosChainAdapter";
import { SoonChainAdapter, type SoonWalletState } from "./SoonChainAdapter";
import { StarknetChainAdapter, type StarknetWalletState } from "./StarknetChainAdapter";

// Helper functions to distinguish chain types (copied from original useChainRace)
function isEvmChain(chain: AnyChainConfig): chain is Chain & { testnet: boolean; color: string; logo: string; faucetUrl?: string; layer: 'L1' | 'L2'; } {
  return 'id' in chain && typeof chain.id === 'number';
}

function isSolanaChain(chain: AnyChainConfig): chain is SolanaChainConfig {
  return 'cluster' in chain;
}

function isFuelChain(chain: AnyChainConfig): chain is FuelChainConfig {
  return chain.name === "Fuel Testnet" || chain.name === "Fuel Mainnet";
}

function isAptosChain(chain: AnyChainConfig): chain is AptosChainConfig {
  return 'network' in chain && typeof chain.network === 'string' &&
         ('id' in chain && typeof chain.id === 'string' && chain.id.startsWith('aptos-'));
}

function isSoonChain(chain: AnyChainConfig): chain is SoonChainConfig {
  return 'id' in chain && typeof chain.id === 'string' && chain.id.startsWith('soon-');
}

function isStarknetChain(chain: AnyChainConfig): chain is StarknetChainConfig {
  return chain.id === "starknet-testnet" || chain.id === "starknet-mainnet";
}

export interface WalletStates {
  evm: EvmWalletState;
  solana: SolanaWalletState;
  fuel: FuelWalletState;
  aptos: AptosWalletState;
  soon: SoonWalletState;
  starknet: StarknetWalletState;
}

export class ChainAdapterFactory {
  static create(chain: AnyChainConfig, walletStates: WalletStates): ChainAdapter {
    if (isEvmChain(chain)) {
      return new EvmChainAdapter({
        chainId: chain.id,
        name: chain.name,
        color: chain.color,
        logo: chain.logo,
        testnet: chain.testnet,
        layer: chain.layer,
        chain: chain as Chain
      }, walletStates.evm);
    }

    if (isSolanaChain(chain)) {
      return new SolanaChainAdapter(chain, walletStates.solana);
    }

    if (isFuelChain(chain)) {
      return new FuelChainAdapter(chain, walletStates.fuel);
    }

    if (isAptosChain(chain)) {
      return new AptosChainAdapter(chain, walletStates.aptos);
    }

    if (isSoonChain(chain)) {
      return new SoonChainAdapter(chain, walletStates.soon);
    }

    if (isStarknetChain(chain)) {
      return new StarknetChainAdapter(chain, walletStates.starknet);
    }

    throw new Error(`Unsupported chain type: ${(chain as any).name}`);
  }

  static createMultiple(chains: AnyChainConfig[], walletStates: WalletStates): ChainAdapter[] {
    return chains.map(chain => this.create(chain, walletStates));
  }
}