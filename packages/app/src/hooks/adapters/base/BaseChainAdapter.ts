import { ChainAdapter, type ChainAdapterConfig, type ChainBalance } from "./ChainAdapter.interface";

export abstract class BaseChainAdapter extends ChainAdapter {
  protected retryCount = 3;
  protected timeoutMs = 30000;

  constructor(config: ChainAdapterConfig) {
    super(config);
  }

  protected async withRetry<T>(
    operation: () => Promise<T>,
    retries = this.retryCount
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (retries <= 0) {
        throw error;
      }
      
      console.warn(`Operation failed, retrying... (${retries} attempts left)`);
      
      // Exponential backoff
      const backoffTime = 1000 * Math.pow(2, this.retryCount - retries);
      await new Promise(resolve => setTimeout(resolve, backoffTime));
      
      return this.withRetry(operation, retries - 1);
    }
  }

  protected async withTimeout<T>(
    operation: Promise<T>,
    timeoutMs = this.timeoutMs
  ): Promise<T> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(`Operation timed out after ${timeoutMs}ms`)), timeoutMs);
    });

    return Promise.race([operation, timeoutPromise]);
  }

  protected createErrorBalance(error: string): ChainBalance {
    return {
      chainId: this.chainId,
      balance: BigInt(0),
      hasBalance: false,
      error
    };
  }

  protected formatError(error: unknown): string {
    if (error instanceof Error) {
      const message = error.message;
      
      if (message.includes("insufficient funds")) {
        return "Insufficient funds for transaction fees";
      }
      if (message.includes("timeout")) {
        return "Network timeout - chain may be congested";
      }
      if (message.includes("nonce")) {
        return "Transaction nonce issue - try again";
      }
      
      return message.split('\n')[0] || message;
    }
    
    return String(error);
  }
}