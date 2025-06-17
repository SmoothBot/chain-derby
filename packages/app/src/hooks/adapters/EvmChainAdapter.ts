import { 
  createPublicClient, 
  createWalletClient, 
  http, 
  type Hex, 
  type Chain, 
  type TransactionReceipt as ViemTransactionReceipt,
  type Account
} from "viem";
import { syncActions } from "shreds/viem";
import { BaseChainAdapter } from "./base/BaseChainAdapter";
import type { 
  ChainType, 
  ChainBalance, 
  PreparedTransaction, 
  TransactionResult, 
  TransactionReceipt 
} from "./base/ChainAdapter.interface";

export interface EvmChainConfig {
  chainId: number;
  name: string;
  color: string;
  logo?: string;
  testnet: boolean;
  layer: 'L1' | 'L2';
  chain: Chain; // Viem chain object
}

export interface EvmWalletState {
  account: Account | null;
  privateKey: string | null;
  isReady: boolean;
}

export class EvmChainAdapter extends BaseChainAdapter {
  private chain: Chain;
  private walletState: EvmWalletState;

  constructor(config: EvmChainConfig, walletState: EvmWalletState) {
    super({
      chainId: config.chainId,
      name: config.name,
      color: config.color,
      logo: config.logo,
      testnet: config.testnet,
      layer: config.layer
    });
    
    this.chain = config.chain;
    this.walletState = walletState;
  }

  get chainType(): ChainType {
    return 'evm';
  }

  isWalletReady(): boolean {
    return this.walletState.isReady && !!this.walletState.account;
  }

  getWalletAddress(): string {
    return this.walletState.account?.address || '';
  }

  async checkBalance(): Promise<ChainBalance> {
    if (!this.walletState.account) {
      return this.createErrorBalance("EVM wallet not ready");
    }

    return this.withTimeout(
      this.withRetry(async () => {
        const client = createPublicClient({
          chain: this.chain,
          transport: http(),
        });

        const balance = await client.getBalance({ 
          address: this.walletState.account!.address 
        });

        // Reduced balance threshold for testing (0.001 tokens)
        const hasBalance = balance > BigInt(1e14);

        return {
          chainId: this.chainId,
          balance,
          hasBalance,
        };
      })
    ).catch(error => this.createErrorBalance(this.formatError(error)));
  }

  async prepareTransactions(count: number): Promise<PreparedTransaction[]> {
    if (!this.walletState.account) {
      throw new Error("EVM wallet not ready");
    }

    const client = createPublicClient({
      chain: this.chain,
      transport: http(),
    });

    const walletClient = createWalletClient({
      chain: this.chain,
      transport: http(),
    });

    // Fetch required data in parallel
    const [nonce, gasPrice] = await Promise.all([
      client.getTransactionCount({
        address: this.walletState.account.address,
      }),
      this.getGasPrice(client),
    ]);

    // Pre-sign all transactions
    const preparedTransactions: PreparedTransaction[] = [];

    for (let i = 0; i < count; i++) {
      try {
        const txParams = {
          to: this.walletState.account.address,
          value: BigInt(0),
          gas: 21000n,
          gasPrice,
          nonce: nonce + i,
          chainId: this.chain.id,
          data: '0x' as const,
        };

        const signedTx = await walletClient.signTransaction({
          ...txParams,
          account: this.walletState.account!
        });

        if (signedTx) {
          preparedTransactions.push({
            index: i,
            data: {
              signedTransaction: signedTx,
              hash: null, // Will be set during execution
            }
          });
        }
      } catch (error) {
        console.error(`Error preparing EVM tx #${i} for ${this.name}:`, error);
        // Add placeholder to maintain index alignment
        preparedTransactions.push({
          index: i,
          data: { signedTransaction: null, hash: null }
        });
      }
    }

    return preparedTransactions;
  }

  async executeTransaction(tx: PreparedTransaction): Promise<TransactionResult> {
    const startTime = Date.now();

    try {
      if (!tx.data.signedTransaction) {
        throw new Error(`No signed transaction for tx #${tx.index}`);
      }

      let txHash: Hex;

      if (this.chain.id === 11155931) {
        // RISE testnet with sync client - already includes confirmation
        txHash = await this.executeRiseTransaction(tx.data.signedTransaction);
      } else if (this.chain.id === 6342) {
        // MegaETH with custom method - already includes confirmation
        txHash = await this.executeMegaEthTransaction(tx.data.signedTransaction);
      } else {
        // Standard EVM chains - need to wait for confirmation
        txHash = await this.executeStandardTransaction(tx.data.signedTransaction);
        
        // Wait for confirmation to get accurate timing
        await this.waitForConfirmation(txHash);
      }

      const latency = Date.now() - startTime;

      return {
        hash: txHash,
        latency,
        success: true
      };
    } catch (error) {
      const latency = Date.now() - startTime;
      return {
        latency,
        success: false,
        error: this.formatError(error)
      };
    }
  }

  async waitForConfirmation(txHash: string): Promise<TransactionReceipt> {
    // Skip confirmation for RISE and MegaETH as they're handled in executeTransaction
    if (this.chain.id === 11155931 || this.chain.id === 6342) {
      return {
        hash: txHash,
        confirmed: true
      };
    }

    const client = createPublicClient({
      chain: this.chain,
      transport: http(),
    });

    const receipt = await client.waitForTransactionReceipt({
      hash: txHash as Hex,
      pollingInterval: 50,
      retryDelay: 1,
      timeout: 60_000,
    });

    return {
      hash: txHash,
      confirmed: true,
      blockNumber: Number(receipt.blockNumber)
    };
  }

  private async getGasPrice(client: any): Promise<bigint> {
    try {
      const gasPrice = await client.getGasPrice();
      return gasPrice * BigInt(3); // Triple gas price for better confirmation
    } catch {
      // Fallback gas prices based on known chain requirements
      const fallbackGasPrice = BigInt(
        this.chain.id === 10143 ? 60000000000 : // Monad
        this.chain.id === 8453 ? 2000000000 :   // Base mainnet
        this.chain.id === 17180 ? 1500000000 :  // Sonic
        this.chain.id === 6342 ? 3000000000 :   // MegaETH
        1000000000                               // Default (1 gwei)
      );
      return fallbackGasPrice;
    }
  }

  private async executeRiseTransaction(signedTx: string): Promise<Hex> {
    const client = createPublicClient({
      chain: this.chain,
      transport: http(),
    }).extend(syncActions);

    const receipt = await client.sendRawTransactionSync({
      serializedTransaction: signedTx as Hex
    });

    if (!receipt?.transactionHash) {
      throw new Error("RISE sync transaction failed");
    }

    return receipt.transactionHash;
  }

  private async executeMegaEthTransaction(signedTx: string): Promise<Hex> {
    const client = createPublicClient({
      chain: this.chain,
      transport: http(),
    });

    const receipt = await client.request({
      // @ts-expect-error - MegaETH custom method
      method: 'realtime_sendRawTransaction',
      params: [signedTx as Hex]
    }) as ViemTransactionReceipt;

    if (!receipt?.transactionHash) {
      throw new Error("MegaETH transaction failed");
    }

    return receipt.transactionHash;
  }

  private async executeStandardTransaction(signedTx: string): Promise<Hex> {
    const client = createPublicClient({
      chain: this.chain,
      transport: http(),
    });

    const txHash = await client.sendRawTransaction({
      serializedTransaction: signedTx as Hex
    });

    if (!txHash) {
      throw new Error("Transaction failed to send");
    }

    return txHash;
  }
}