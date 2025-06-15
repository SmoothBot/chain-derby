import {
  Aptos,
  AptosConfig,
  Network,
  TypeTagAddress, 
  TypeTagU64, 
  U64,
  Account
} from "@aptos-labs/ts-sdk";
import { BaseChainAdapter } from "./base/BaseChainAdapter";
import type { AptosChainConfig } from "@/aptos/config";
import type { 
  ChainType, 
  ChainBalance, 
  PreparedTransaction, 
  TransactionResult, 
  TransactionReceipt 
} from "./base/ChainAdapter.interface";

export interface AptosWalletState {
  account: Account | null;
  address: string | null;
  isReady: boolean;
}

export class AptosChainAdapter extends BaseChainAdapter {
  private aptosConfig: AptosChainConfig;
  private walletState: AptosWalletState;

  constructor(config: AptosChainConfig, walletState: AptosWalletState) {
    super({
      chainId: config.id,
      name: config.name,
      color: config.color,
      logo: config.logo,
      testnet: config.testnet,
      layer: config.layer
    });
    
    this.aptosConfig = config;
    this.walletState = walletState;
  }

  get chainType(): ChainType {
    return 'aptos';
  }

  isWalletReady(): boolean {
    return this.walletState.isReady && !!this.walletState.account;
  }

  getWalletAddress(): string {
    return this.walletState.address || '';
  }

  async checkBalance(): Promise<ChainBalance> {
    if (!this.walletState.account || !this.walletState.isReady) {
      return this.createErrorBalance("Aptos wallet still loading...");
    }

    return this.withTimeout(
      this.withRetry(async () => {
        const aptosConfig = new AptosConfig({
          network: this.aptosConfig.network as Network,
          fullnode: this.aptosConfig.rpcUrl,
        });
        const aptos = new Aptos(aptosConfig);

        const balance = BigInt(await aptos.getAccountAPTAmount({
          accountAddress: this.walletState.account!.accountAddress
        }));

        // Minimum balance threshold: 0.001 APT (100,000 octas since APT uses 8 decimals)
        const hasBalance = balance > BigInt(100_000);

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
      throw new Error(`Aptos wallet not ready for ${this.aptosConfig.id}`);
    }

    const aptosConfig = new AptosConfig({
      network: this.aptosConfig.network as Network,
      fullnode: this.aptosConfig.rpcUrl,
    });
    const aptos = new Aptos(aptosConfig);

    // Fetch sequence number for the account
    const accountData = await aptos.getAccountInfo({ 
      accountAddress: this.walletState.account.accountAddress 
    });
    const sequenceNumber = BigInt(accountData.sequence_number);

    // Build and sign all transactions
    const buildAndSignTransaction = async (txIndex: number, aptosSeqNo: bigint) => {
      const transaction = await aptos.transaction.build.simple({
        sender: this.walletState.account!.accountAddress,
        data: {
          function: "0x1::aptos_account::transfer",
          functionArguments: [this.walletState.account!.accountAddress, new U64(0)], // Transfer 0 APT to self
          abi: {
            signers: 1,
            typeParameters: [],
            parameters: [new TypeTagAddress(), new TypeTagU64()]
          }
        },
        options: {
          accountSequenceNumber: aptosSeqNo + BigInt(txIndex),
          gasUnitPrice: 100, // Default gas price
          maxGasAmount: 1000, // Set a max gas
        }
      });

      return {
        transaction,
        senderAuthenticator: aptos.transaction.sign({
          signer: this.walletState.account!,
          transaction,
        })
      };
    };

    const signedTransactionPromises = [];
    for (let txIndex = 0; txIndex < count; txIndex++) {
      signedTransactionPromises.push(buildAndSignTransaction(txIndex, sequenceNumber));
    }

    const signedTransactions = await Promise.all(signedTransactionPromises);

    return signedTransactions.map((signedTx, index) => ({
      index,
      data: {
        signedTransaction: signedTx,
        aptos,
      }
    }));
  }

  async executeTransaction(tx: PreparedTransaction): Promise<TransactionResult> {
    const startTime = Date.now();

    try {
      if (!tx.data.signedTransaction || !tx.data.aptos) {
        throw new Error(`No pre-signed transaction available for Aptos tx #${tx.index}`);
      }

      if (typeof tx.data.signedTransaction !== "object" || !("senderAuthenticator" in tx.data.signedTransaction)) {
        throw new Error(`Invalid signed transaction for Aptos tx #${tx.index}`);
      }

      const response = await tx.data.aptos.transaction.submit.simple(tx.data.signedTransaction);

      // Wait for transaction confirmation
      await tx.data.aptos.waitForTransaction({
        transactionHash: response.hash,
        options: {
          waitForIndexer: false
        }
      });

      const latency = Date.now() - startTime;

      const hash = response.hash.startsWith('0x') 
        ? response.hash as `0x${string}` 
        : `0x${response.hash}` as `0x${string}`;

      return {
        hash,
        latency,
        success: true
      };
    } catch (error) {
      const latency = Date.now() - startTime;
      return {
        latency,
        success: false,
        error: this.formatAptosError(error)
      };
    }
  }

  // Aptos transactions are already confirmed when executed
  async waitForConfirmation(txHash: string): Promise<TransactionReceipt> {
    return {
      hash: txHash,
      confirmed: true
    };
  }

  private formatAptosError(error: unknown): string {
    if (error instanceof Error) {
      const message = error.message;
      
      if (message.includes("insufficient funds")) {
        return "Insufficient APT for transaction fees";
      }
      if (message.includes("timeout")) {
        return "Aptos network timeout - please try again";
      }
      if (message.includes("SEQUENCE_NUMBER_TOO_OLD")) {
        return "Transaction sequence error - please try again";
      }
      
      return message.split('\n')[0] || message;
    }
    
    return String(error);
  }
}