import { Connection, SystemProgram, Transaction, sendAndConfirmTransaction, Keypair, PublicKey } from "@solana/web3.js";
import { BaseChainAdapter } from "./base/BaseChainAdapter";
import type { SolanaChainConfig } from "@/solana/config";
import type { 
  ChainType, 
  ChainBalance, 
  PreparedTransaction, 
  TransactionResult, 
  TransactionReceipt 
} from "./base/ChainAdapter.interface";

export interface SolanaWalletState {
  publicKey: PublicKey | null;
  keypair: Keypair | null;
  isReady: boolean;
}

export class SolanaChainAdapter extends BaseChainAdapter {
  private solanaConfig: SolanaChainConfig;
  private walletState: SolanaWalletState;
  private fallbackEndpoints: string[];

  constructor(config: SolanaChainConfig, walletState: SolanaWalletState) {
    super({
      chainId: config.id,
      name: config.name,
      color: config.color,
      logo: config.logo,
      testnet: config.id.includes('mainnet') ? false : true, // Derive testnet from id
    });
    
    this.solanaConfig = config;
    this.walletState = walletState;
    this.fallbackEndpoints = this.getFallbackEndpoints();
  }

  get chainType(): ChainType {
    return 'solana';
  }

  isWalletReady(): boolean {
    return this.walletState.isReady && !!this.walletState.publicKey && !!this.walletState.keypair;
  }

  getWalletAddress(): string {
    return this.walletState.publicKey?.toBase58() || '';
  }

  async checkBalance(): Promise<ChainBalance> {
    if (!this.walletState.publicKey || !this.walletState.isReady) {
      return this.createErrorBalance("Solana wallet still loading...");
    }

    return this.withTimeout(
      this.withRetry(async () => {
        // Try each endpoint until one works
        for (const endpoint of this.fallbackEndpoints) {
          try {
            const connection = new Connection(endpoint, this.solanaConfig.commitment);
            const lamports = await connection.getBalance(
              this.walletState.publicKey!, 
              this.solanaConfig.commitment
            );

            const balance = BigInt(lamports);
            // Minimum balance threshold: 0.001 SOL (1,000,000 lamports)
            const hasBalance = balance > BigInt(1_000_000);

            return {
              chainId: this.chainId,
              balance,
              hasBalance,
            };
          } catch (error) {
            console.warn(`Solana RPC ${endpoint} failed for ${this.solanaConfig.id}:`, error);
            continue;
          }
        }
        
        throw new Error(`All Solana RPC endpoints failed for ${this.solanaConfig.id}`);
      })
    ).catch(error => this.createErrorBalance(this.formatError(error)));
  }

  async prepareTransactions(count: number): Promise<PreparedTransaction[]> {
    if (!this.walletState.keypair) {
      throw new Error(`Solana wallet not ready for ${this.solanaConfig.id}`);
    }

    // Find working connection
    const connection = await this.getWorkingConnection();
    if (!connection) {
      throw new Error(`All Solana RPC endpoints failed for ${this.solanaConfig.id} during setup`);
    }

    const preparedTransactions: PreparedTransaction[] = [];

    try {
      // Get the latest blockhash for all transactions
      const { blockhash } = await connection.getLatestBlockhash(this.solanaConfig.commitment);

      for (let i = 0; i < count; i++) {
        try {
          // Create transaction with unique transfer amount to avoid duplicate signatures
          const transaction = new Transaction();
          transaction.feePayer = this.walletState.keypair.publicKey;
          transaction.recentBlockhash = blockhash;
          transaction.add(
            SystemProgram.transfer({
              fromPubkey: this.walletState.keypair.publicKey,
              toPubkey: this.walletState.keypair.publicKey,
              lamports: i + 1, // Use different amounts (1, 2, 3, etc.)
            })
          );

          // Sign the transaction
          transaction.sign(this.walletState.keypair);

          // Serialize the signed transaction
          const serializedTx = transaction.serialize();

          preparedTransactions.push({
            index: i,
            data: {
              serializedTransaction: serializedTx,
              connection,
              signature: null, // Will be set during execution
            }
          });
        } catch (error) {
          console.error(`Error signing Solana tx #${i} for ${this.solanaConfig.id}:`, error);
          preparedTransactions.push({
            index: i,
            data: { serializedTransaction: null, connection, signature: null }
          });
        }
      }
    } catch (error) {
      console.error(`Error getting blockhash for Solana ${this.solanaConfig.id}:`, error);
      throw error;
    }

    return preparedTransactions;
  }

  async executeTransaction(tx: PreparedTransaction): Promise<TransactionResult> {
    const startTime = Date.now();

    try {
      if (!tx.data.serializedTransaction || !tx.data.connection) {
        throw new Error(`No prepared transaction data for Solana tx #${tx.index}`);
      }

      // Send the pre-signed transaction
      const signature = await tx.data.connection.sendRawTransaction(
        tx.data.serializedTransaction,
        {
          skipPreflight: false,
          preflightCommitment: this.solanaConfig.commitment,
        }
      );

      // Wait for confirmation
      await tx.data.connection.confirmTransaction(
        signature,
        this.solanaConfig.commitment
      );

      const latency = Date.now() - startTime;

      return {
        signature,
        latency,
        success: true
      };
    } catch (error) {
      // Fallback: create fresh transaction if pre-signed failed
      if (!this.walletState.keypair || !tx.data.connection) {
        const latency = Date.now() - startTime;
        return {
          latency,
          success: false,
          error: this.formatError(error)
        };
      }

      try {
        console.warn(`Pre-signed Solana tx #${tx.index} failed, creating fresh transaction`);

        const transaction = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: this.walletState.keypair.publicKey,
            toPubkey: this.walletState.keypair.publicKey,
            lamports: tx.index + 1,
          })
        );

        const signature = await sendAndConfirmTransaction(
          tx.data.connection,
          transaction,
          [this.walletState.keypair],
          {
            commitment: this.solanaConfig.commitment,
            preflightCommitment: this.solanaConfig.commitment,
          }
        );

        const latency = Date.now() - startTime;

        return {
          signature,
          latency,
          success: true
        };
      } catch (fallbackError) {
        const latency = Date.now() - startTime;
        return {
          latency,
          success: false,
          error: this.formatSolanaError(fallbackError)
        };
      }
    }
  }

  // Solana doesn't need separate confirmation step
  async waitForConfirmation(signature: string): Promise<TransactionReceipt> {
    return {
      hash: signature,
      confirmed: true
    };
  }

  private getFallbackEndpoints(): string[] {
    const endpoints = [this.solanaConfig.endpoint];
    
    // Add fallback endpoints based on chain ID
    if (this.solanaConfig.id === 'solana-mainnet') {
      endpoints.push(
        'https://api.mainnet-beta.solana.com',
        'https://solana-api.projectserum.com',
        'https://rpc.ankr.com/solana'
      );
    } else if (this.solanaConfig.id === 'solana-devnet') {
      endpoints.push('https://api.devnet.solana.com');
    } else {
      endpoints.push('https://api.testnet.solana.com');
    }
    
    return endpoints;
  }

  private async getWorkingConnection(): Promise<Connection | null> {
    for (const endpoint of this.fallbackEndpoints) {
      try {
        const connection = new Connection(endpoint, this.solanaConfig.commitment);
        // Test the connection by getting latest blockhash
        await connection.getLatestBlockhash(this.solanaConfig.commitment);
        console.log(`Using Solana RPC ${endpoint} for ${this.solanaConfig.id}`);
        return connection;
      } catch (error) {
        console.warn(`Solana RPC ${endpoint} failed for ${this.solanaConfig.id} during setup:`, error);
        continue;
      }
    }
    return null;
  }

  private formatSolanaError(error: unknown): string {
    if (error instanceof Error) {
      const message = error.message;
      
      if (message.includes("insufficient funds")) {
        return "Insufficient SOL for transaction fees";
      }
      if (message.includes("blockhash not found")) {
        return "Transaction expired - please try again";
      }
      if (message.includes("timeout")) {
        return "Solana network timeout - please try again";
      }
      
      return message.split('\n')[0] || message;
    }
    
    return String(error);
  }
}