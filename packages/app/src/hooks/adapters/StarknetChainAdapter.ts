import {
  cairo,
  Call,
  Contract,
  RpcProvider, 
  Account
} from "starknet";
import { Erc20Abi } from "../../util/erc20abi";
import { STRK_ADDRESS } from "../../util/erc20Contract";
import { BaseChainAdapter } from "./base/BaseChainAdapter";
import type { StarknetChainConfig } from "@/starknet/config";
import type { 
  ChainType, 
  ChainBalance, 
  PreparedTransaction, 
  TransactionResult, 
  TransactionReceipt 
} from "./base/ChainAdapter.interface";

export interface StarknetWalletState {
  starknetprivateKey: string | null;
  starknetaccount: Account | null;
  starknetisReady: boolean;
}

export class StarknetChainAdapter extends BaseChainAdapter {
  private starknetConfig: StarknetChainConfig;
  private walletState: StarknetWalletState;

  constructor(config: StarknetChainConfig, walletState: StarknetWalletState) {
    super({
      chainId: config.id,
      name: config.name,
      color: config.color,
      logo: config.logo,
      testnet: config.id.includes('mainnet') ? false : true, // Derive testnet from id
    });
    
    this.starknetConfig = config;
    this.walletState = walletState;
  }

  get chainType(): ChainType {
    return 'starknet';
  }

  isWalletReady(): boolean {
    return this.walletState.starknetisReady && !!this.walletState.starknetaccount && !!this.walletState.starknetprivateKey;
  }

  getWalletAddress(): string {
    return this.walletState.starknetaccount?.address || '';
  }

  async checkBalance(): Promise<ChainBalance> {
    if (!this.walletState.starknetaccount?.address) {
      return this.createErrorBalance("No Starknet account address available");
    }

    return this.withTimeout(
      this.withRetry(async () => {
        const provider = new RpcProvider({ nodeUrl: this.starknetConfig.endpoint });
        const erc20Contract = new Contract(Erc20Abi, STRK_ADDRESS, provider);

        // Get the balance using the correct method
        const starknetBalance = await erc20Contract.balance_of(this.walletState.starknetaccount!.address);
        const balance = BigInt(starknetBalance.toString());

        // Minimum balance threshold: 0.02 STRK (20000000000000000 since STRK uses 18 decimals)
        const hasBalance = balance > BigInt("20000000000000000");

        return {
          chainId: this.chainId,
          balance,
          hasBalance,
        };
      })
    ).catch(error => this.createErrorBalance(this.formatError(error)));
  }

  async prepareTransactions(count: number): Promise<PreparedTransaction[]> {
    if (!this.walletState.starknetaccount || !this.walletState.starknetprivateKey) {
      throw new Error(`Starknet wallet not ready for ${this.starknetConfig.id}`);
    }

    const provider = new RpcProvider({ nodeUrl: this.starknetConfig.endpoint });
    const account = new Account(
      provider, 
      this.walletState.starknetaccount.address, 
      this.walletState.starknetprivateKey
    );

    // For Starknet, we'll prepare the transfer calls but execute them individually
    // since each transaction needs a fresh nonce
    const preparedTransactions: PreparedTransaction[] = [];

    for (let i = 0; i < count; i++) {
      preparedTransactions.push({
        index: i,
        data: {
          provider,
          account,
          transferAmount: (i + 1) * 10 ** 18, // Different amounts for each tx
        }
      });
    }

    return preparedTransactions;
  }

  async executeTransaction(tx: PreparedTransaction): Promise<TransactionResult> {
    const startTime = Date.now();

    try {
      if (!tx.data.provider || !tx.data.account) {
        throw new Error(`No prepared transaction data for Starknet tx #${tx.index}`);
      }

      // Get current nonce for this transaction
      const currentNonce = await tx.data.account.getNonce();
      
      const erc20Contract = new Contract(Erc20Abi, STRK_ADDRESS, tx.data.account);
      const amount = cairo.uint256(tx.data.transferAmount);
      
      const transferCall: Call = erc20Contract.populate("transfer", {
        recipient: this.walletState.starknetaccount!.address,
        amount: amount,
      });

      const { transaction_hash: transferTxHash } = await tx.data.account.execute(
        transferCall,
        {
          nonce: currentNonce,
          version: 3,
        }
      );

      // Wait for transaction confirmation
      await tx.data.provider.waitForTransaction(transferTxHash);

      const latency = Date.now() - startTime;

      return {
        hash: transferTxHash as `0x${string}`,
        latency,
        success: true
      };
    } catch (error) {
      const latency = Date.now() - startTime;
      return {
        latency,
        success: false,
        error: this.formatStarknetError(error)
      };
    }
  }

  // Starknet transactions are already confirmed when executed
  async waitForConfirmation(txHash: string): Promise<TransactionReceipt> {
    return {
      hash: txHash,
      confirmed: true
    };
  }

  private formatStarknetError(error: unknown): string {
    if (error instanceof Error) {
      const message = error.message;
      
      if (message.includes("insufficient funds")) {
        return "Insufficient STRK for transaction fees";
      }
      if (message.includes("nonce")) {
        return "Transaction nonce issue - please try again";
      }
      if (message.includes("timeout")) {
        return "Starknet network timeout - please try again";
      }
      
      return message.split('\n')[0] || message;
    }
    
    return String(error);
  }
}