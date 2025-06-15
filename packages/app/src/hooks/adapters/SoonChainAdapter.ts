import { Connection, SystemProgram, Transaction, Keypair, PublicKey } from "@solana/web3.js";
import { BaseChainAdapter } from "./base/BaseChainAdapter";
import type { SoonChainConfig } from "@/soon/config";
import type { 
  ChainType, 
  ChainBalance, 
  PreparedTransaction, 
  TransactionResult, 
  TransactionReceipt 
} from "./base/ChainAdapter.interface";

export interface SoonWalletState {
  publicKey: PublicKey | null;
  keypair: Keypair | null;
}

export class SoonChainAdapter extends BaseChainAdapter {
  private soonConfig: SoonChainConfig;
  private walletState: SoonWalletState;

  constructor(config: SoonChainConfig, walletState: SoonWalletState) {
    super({
      chainId: config.id,
      name: config.name,
      color: config.color,
      logo: config.logo,
      testnet: config.id.includes('mainnet') ? false : true, // Derive testnet from id
    });
    
    this.soonConfig = config;
    this.walletState = walletState;
  }

  get chainType(): ChainType {
    return 'soon';
  }

  isWalletReady(): boolean {
    return !!this.walletState.publicKey && !!this.walletState.keypair;
  }

  getWalletAddress(): string {
    return this.walletState.publicKey?.toBase58() || '';
  }

  async checkBalance(): Promise<ChainBalance> {
    if (!this.walletState.publicKey) {
      return this.createErrorBalance("SOON wallet still loading...");
    }

    return this.withTimeout(
      this.withRetry(async () => {
        const connection = new Connection(this.soonConfig.endpoint, this.soonConfig.commitment);
        const lamports = await connection.getBalance(
          this.walletState.publicKey!, 
          this.soonConfig.commitment
        );

        const balance = BigInt(lamports);
        // Minimum balance threshold: 0.001 ETH (1,000,000 lamports for SOON)
        const hasBalance = balance > BigInt(1_000_000);

        return {
          chainId: this.chainId,
          balance,
          hasBalance,
        };
      })
    ).catch(error => this.createErrorBalance(this.formatError(error)));
  }

  async prepareTransactions(count: number): Promise<PreparedTransaction[]> {
    if (!this.walletState.keypair) {
      throw new Error("SOON wallet not initialized");
    }

    const connection = new Connection(this.soonConfig.endpoint, this.soonConfig.commitment);
    
    // Test the connection
    await connection.getLatestBlockhash(this.soonConfig.commitment);
    console.log(`Using SOON RPC ${this.soonConfig.endpoint} for ${this.soonConfig.id}`);

    const preparedTransactions: PreparedTransaction[] = [];
    
    try {
      // Get the latest blockhash for all transactions
      const { blockhash } = await connection.getLatestBlockhash(this.soonConfig.commitment);
      
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
              lamports: i + 1, // Use different amounts to make transactions unique
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
          console.error(`Error signing SOON tx #${i} for ${this.soonConfig.id}:`, error);
          preparedTransactions.push({
            index: i,
            data: { serializedTransaction: null, connection, signature: null }
          });
        }
      }
    } catch (error) {
      console.error(`Error getting blockhash for SOON ${this.soonConfig.id}:`, error);
      throw error;
    }

    return preparedTransactions;
  }

  async executeTransaction(tx: PreparedTransaction): Promise<TransactionResult> {
    const startTime = Date.now();

    try {
      if (!tx.data.serializedTransaction || !tx.data.connection) {
        throw new Error(`No prepared transaction data for SOON tx #${tx.index}`);
      }

      // Send the pre-signed transaction
      const signature = await tx.data.connection.sendRawTransaction(
        tx.data.serializedTransaction,
        {
          skipPreflight: false,
          preflightCommitment: this.soonConfig.commitment,
        }
      );

      // Wait for confirmation
      await tx.data.connection.confirmTransaction(
        signature,
        this.soonConfig.commitment
      );

      const latency = Date.now() - startTime;

      return {
        signature,
        latency,
        success: true
      };
    } catch (error) {
      const latency = Date.now() - startTime;
      return {
        latency,
        success: false,
        error: this.formatSoonError(error)
      };
    }
  }

  // SOON doesn't need separate confirmation step (SVM-based)
  async waitForConfirmation(signature: string): Promise<TransactionReceipt> {
    return {
      hash: signature,
      confirmed: true
    };
  }

  private formatSoonError(error: unknown): string {
    if (error instanceof Error) {
      const message = error.message;
      
      if (message.includes("insufficient funds")) {
        return "Insufficient funds for SOON transaction fees";
      }
      if (message.includes("blockhash not found")) {
        return "Transaction expired - please try again";
      }
      if (message.includes("timeout")) {
        return "SOON network timeout - please try again";
      }
      
      return message.split('\n')[0] || message;
    }
    
    return String(error);
  }
}