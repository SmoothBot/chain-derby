import type { Hex } from "viem";

export type ChainType = 'evm' | 'solana' | 'fuel' | 'aptos' | 'soon' | 'starknet';

export interface ChainBalance {
  chainId: number | string;
  balance: bigint;
  hasBalance: boolean;
  error?: string;
}

export interface PreparedTransaction {
  index: number;
  data: any; // Chain-specific transaction data
}

export interface TransactionResult {
  hash?: Hex;
  signature?: string;
  latency: number;
  success: boolean;
  error?: string;
}

export interface TransactionReceipt {
  hash: string;
  confirmed: boolean;
  blockNumber?: number;
}

export interface ChainAdapterConfig {
  chainId: number | string;
  name: string;
  color: string;
  logo?: string;
  testnet: boolean;
  layer?: 'L1' | 'L2';
}

export abstract class ChainAdapter {
  protected config: ChainAdapterConfig;
  
  constructor(config: ChainAdapterConfig) {
    this.config = config;
  }

  // Basic chain info
  get chainId() { return this.config.chainId; }
  get name() { return this.config.name; }
  get color() { return this.config.color; }
  get logo() { return this.config.logo; }
  get testnet() { return this.config.testnet; }
  get layer() { return this.config.layer; }

  // Abstract methods that each chain type must implement
  abstract get chainType(): ChainType;
  abstract isWalletReady(): boolean;
  abstract getWalletAddress(): string;
  abstract checkBalance(): Promise<ChainBalance>;
  abstract prepareTransactions(count: number): Promise<PreparedTransaction[]>;
  abstract executeTransaction(tx: PreparedTransaction): Promise<TransactionResult>;
  abstract waitForConfirmation?(txHash: string): Promise<TransactionReceipt>;
}