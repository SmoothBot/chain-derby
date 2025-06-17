import { 
  WalletUnlocked, 
  bn, 
  Provider, 
  type TransactionRequest, 
  ScriptTransactionRequest, 
  type Coin, 
  OutputChange 
} from "fuels";
import { BaseChainAdapter } from "./base/BaseChainAdapter";
import type { FuelChainConfig } from "@/fuel/config";
import type { 
  ChainType, 
  ChainBalance, 
  PreparedTransaction, 
  TransactionResult, 
  TransactionReceipt 
} from "./base/ChainAdapter.interface";

export interface FuelWalletState {
  wallet: WalletUnlocked | null;
  isReady: boolean;
}

export class FuelChainAdapter extends BaseChainAdapter {
  private fuelConfig: FuelChainConfig;
  private walletState: FuelWalletState;

  constructor(config: FuelChainConfig, walletState: FuelWalletState) {
    super({
      chainId: config.id,
      name: config.name,
      color: config.color,
      logo: config.logo,
      testnet: config.testnet,
      layer: config.layer
    });
    
    this.fuelConfig = config;
    this.walletState = walletState;
  }

  get chainType(): ChainType {
    return 'fuel';
  }

  isWalletReady(): boolean {
    return this.walletState.isReady && !!this.walletState.wallet;
  }

  getWalletAddress(): string {
    return this.walletState.wallet?.address?.toAddress() || '';
  }

  async checkBalance(): Promise<ChainBalance> {
    if (!this.walletState.wallet || !this.walletState.isReady) {
      return this.createErrorBalance("Fuel wallet still loading...");
    }

    return this.withTimeout(
      this.withRetry(async () => {
        const provider = new Provider(this.fuelConfig.rpcUrls.public.http[0]);
        this.walletState.wallet!.connect(provider);
        
        const fuelBalance = await this.walletState.wallet!.getBalance();
        const balance = BigInt(fuelBalance.toString());
        
        // Minimum balance threshold: 0.001 ETH (1e6 since Fuel uses 9 decimals)
        const hasBalance = balance > BigInt(1e6);

        return {
          chainId: this.chainId,
          balance,
          hasBalance,
        };
      })
    ).catch(error => this.createErrorBalance(this.formatError(error)));
  }

  async prepareTransactions(count: number): Promise<PreparedTransaction[]> {
    if (!this.walletState.wallet) {
      throw new Error(`Fuel wallet not ready for ${this.fuelConfig.id}`);
    }

    const provider = new Provider(this.fuelConfig.rpcUrls.public.http[0]);
    const wallet = this.walletState.wallet as WalletUnlocked;
    wallet.connect(provider);
    
    const baseAssetId = await provider.getBaseAssetId();
    const walletCoins = await wallet.getCoins(baseAssetId);

    // Find UTXOs with sufficient balance (greater than 10000)
    const coins = walletCoins.coins as Coin[];
    const validUtxos = coins.filter(coin => {
      const amount = coin.amount.toNumber();
      return amount > 10000;
    });

    if (validUtxos.length === 0) {
      throw new Error("No UTXOs with sufficient balance found");
    }

    const preparedTransactions: PreparedTransaction[] = [];

    // Only prepare the first transaction (others will be created dynamically)
    try {
      const initialScriptRequest = new ScriptTransactionRequest({
        script: "0x"
      });
      initialScriptRequest.maxFee = bn(100);
      initialScriptRequest.addCoinInput(validUtxos[0]);
      
      const initialSignedTx = await wallet.populateTransactionWitnessesSignature(initialScriptRequest);
      
      preparedTransactions.push({
        index: 0,
        data: {
          signedTransaction: initialSignedTx,
          provider,
          wallet,
          baseAssetId,
          lastResolvedOutput: null, // Will be updated during execution
        }
      });

      // Add placeholders for other transactions
      for (let i = 1; i < count; i++) {
        preparedTransactions.push({
          index: i,
          data: {
            signedTransaction: null,
            provider,
            wallet,
            baseAssetId,
            lastResolvedOutput: null,
          }
        });
      }
    } catch (error) {
      console.error(`Error preparing first Fuel transaction:`, error);
      throw error;
    }

    return preparedTransactions;
  }

  async executeTransaction(tx: PreparedTransaction): Promise<TransactionResult> {
    const startTime = Date.now();

    try {
      let transaction;

      if (tx.index === 0) {
        // First transaction - use pre-signed transaction
        if (!tx.data.signedTransaction) {
          throw new Error("No pre-signed transaction available");
        }
        
        transaction = await tx.data.provider.sendTransaction(
          tx.data.signedTransaction as TransactionRequest, 
          { estimateTxDependencies: false }
        );

        const preConfOutput = await transaction.waitForPreConfirmation();
        if (preConfOutput.resolvedOutputs) {
          const ethUTXO = preConfOutput.resolvedOutputs.find(
            (output: any) => (output.output as OutputChange).assetId === tx.data.baseAssetId
          );
          if (ethUTXO) {
            tx.data.lastResolvedOutput = [ethUTXO];
          }
        }
      } else {
        // Subsequent transactions using previous UTXO
        if (!tx.data.lastResolvedOutput || tx.data.lastResolvedOutput.length === 0) {
          throw new Error("No resolved output available for subsequent transaction");
        }

        const scriptRequest = new ScriptTransactionRequest({
          script: "0x"
        });
        scriptRequest.maxFee = bn(100);

        const [{ utxoId, output }] = tx.data.lastResolvedOutput;
        const change = output as unknown as {
          assetId: string;
          amount: string;
        };

        const resource = {
          id: utxoId,
          assetId: change.assetId,
          amount: bn(change.amount),
          owner: tx.data.wallet.address,
          blockCreated: bn(0),
          txCreatedIdx: bn(0),
        };

        scriptRequest.addResource(resource);
        const signedTransaction = await tx.data.wallet.populateTransactionWitnessesSignature(scriptRequest);
        
        transaction = await tx.data.provider.sendTransaction(
          signedTransaction as TransactionRequest, 
          { estimateTxDependencies: false }
        );

        const preConfOutput = await transaction.waitForPreConfirmation();
        if (preConfOutput.resolvedOutputs) {
          const ethUTXO = preConfOutput.resolvedOutputs.find(
            (output: any) => (output.output as OutputChange).assetId === tx.data.baseAssetId
          );
          if (ethUTXO) {
            tx.data.lastResolvedOutput = [ethUTXO];
          }
        }
      }

      if (!transaction) {
        throw new Error("Failed to send transaction");
      }

      const latency = Date.now() - startTime;

      return {
        hash: `0x${transaction.id}` as `0x${string}`,
        latency,
        success: true
      };
    } catch (error) {
      const latency = Date.now() - startTime;
      return {
        latency,
        success: false,
        error: this.formatFuelError(error)
      };
    }
  }

  // Fuel transactions are already confirmed when executed
  async waitForConfirmation(txHash: string): Promise<TransactionReceipt> {
    return {
      hash: txHash,
      confirmed: true
    };
  }

  private formatFuelError(error: unknown): string {
    if (error instanceof Error) {
      const message = error.message;
      
      if (message.includes("insufficient funds")) {
        return "Insufficient ETH for transaction fees";
      }
      if (message.includes("timeout")) {
        return "Fuel network timeout - please try again";
      }
      
      return message.split('\n')[0] || message;
    }
    
    return String(error);
  }
}