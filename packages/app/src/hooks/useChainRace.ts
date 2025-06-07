"use client";

import { useState, useEffect, useCallback } from "react";
import { createPublicClient, createWalletClient, http, type Hex, type Chain, TransactionReceipt } from "viem";
import { allChains, type AnyChainConfig } from "@/chain/networks";
import { useEmbeddedWallet } from "./useEmbeddedWallet";
import { useSolanaEmbeddedWallet } from "./useSolanaEmbeddedWallet";
import { createSyncPublicClient, syncTransport } from "rise-shred-client";
import { Connection, SystemProgram, Transaction, sendAndConfirmTransaction } from "@solana/web3.js";
import type { SolanaChainConfig } from "@/solana/config";
import { getGeo } from "@/lib/geo";
import { saveRaceResults } from "@/lib/api";

export type ChainRaceStatus = "idle" | "funding" | "ready" | "racing" | "finished";

export interface ChainBalance {
  chainId: number | string;  // Support both EVM (number) and Solana (string) chain IDs
  balance: bigint;
  hasBalance: boolean;
  error?: string;
}

export interface RaceResult {
  chainId: number | string;  // Support both EVM (number) and Solana (string) chain IDs
  name: string;
  color: string;
  logo?: string;             // Path to the chain logo
  status: "pending" | "racing" | "success" | "error";
  txHash?: Hex;              // EVM transaction hash
  signature?: string;        // Solana transaction signature
  error?: string;
  position?: number;
  txCompleted: number;       // Count of completed transactions
  txTotal: number;           // Total transactions required
  txLatencies: number[];     // Array of individual transaction latencies in ms
  averageLatency?: number;   // Average transaction latency
  totalLatency?: number;     // Total latency of all transactions combined
}

export type TransactionCount = 1 | 5 | 10 | 20;

export interface RaceSessionPayload {
  title: string;
  walletAddress: string;
  transactionCount: number;
  status: 'completed';
  city?: string;
  region?: string;
  country?: string;
  results: ChainResultPayload[];
}

export interface ChainResultPayload {
  chainId: number;
  chainName: string;
  txLatencies: number[];   // raw per-tx times
  averageLatency: number;
  totalLatency: number;
  status: string;
  position?: number;
}

// Constants for localStorage keys
const LOCAL_STORAGE_SELECTED_CHAINS = "horse-race-selected-chains";
const LOCAL_STORAGE_TX_COUNT = "horse-race-tx-count";

// Helper functions to distinguish chain types
function isEvmChain(chain: AnyChainConfig): chain is Chain & { testnet: boolean; color: string; logo: string; faucetUrl?: string; } {
  return 'id' in chain && typeof chain.id === 'number';
}

function isSolanaChain(chain: AnyChainConfig): chain is SolanaChainConfig {
  return 'cluster' in chain;
}

// Helper function to get fallback RPC endpoints for Solana
function getSolanaFallbackEndpoints(chain: SolanaChainConfig): string[] {
  const fallbackEndpoints = [
    chain.endpoint,
    // Fallback RPC endpoints for Solana
    ...(chain.id === 'solana-mainnet' ? [
      'https://api.mainnet-beta.solana.com',
      'https://solana-api.projectserum.com',
      'https://rpc.ankr.com/solana',
    ] : chain.id === 'solana-devnet' ? [
      'https://api.devnet.solana.com',
    ] : [
      'https://api.testnet.solana.com',
    ])
  ];
  return fallbackEndpoints;
}

export function useChainRace() {
  const { account, privateKey, isReady, resetWallet } = useEmbeddedWallet();
  const { publicKey: solanaPublicKey, keypair: solanaKeypair, isReady: solanaReady } = useSolanaEmbeddedWallet();
  const [status, setStatus] = useState<ChainRaceStatus>("idle");
  const [balances, setBalances] = useState<ChainBalance[]>([]);
  const [results, setResults] = useState<RaceResult[]>([]);
  const [isLoadingBalances, setIsLoadingBalances] = useState(false);
  const [transactionCount, setTransactionCount] = useState<TransactionCount>(() => {
    // Load saved transaction count from localStorage if available
    // if (typeof window !== 'undefined') {
    //   const savedCount = localStorage.getItem(LOCAL_STORAGE_TX_COUNT);
    //   if (savedCount) {
    //     const count = parseInt(savedCount, 10) as TransactionCount;
    //     if ([1, 5, 10, 20].includes(count)) {
    //       return count;
    //     }
    //   }
    // }
    return 10;
  });
  
  const [selectedChains, setSelectedChains] = useState<(number | string)[]>(() => {
    // Load saved chain selection from localStorage if available
    if (typeof window !== 'undefined') {
      const savedChains = localStorage.getItem(LOCAL_STORAGE_SELECTED_CHAINS);
      if (savedChains) {
        try {
          const parsed = JSON.parse(savedChains) as (number | string)[];
          // Validate that all chains in the saved list are actually valid chains
          const validChainIds: (number | string)[] = allChains.map(chain => isEvmChain(chain) ? chain.id : chain.id);
          const validSavedChains = parsed.filter(id => validChainIds.includes(id));
          
          if (validSavedChains.length > 0) {
            return validSavedChains;
          }
        } catch (e) {
          console.error('Failed to parse saved chain selection:', e);
        }
      }
    }
    // Default to all chains (EVM + Solana)
    return allChains.map(chain => isEvmChain(chain) ? chain.id : chain.id);
  });
  
  // Effect to save chain selection to localStorage when it changes
  useEffect(() => {
    if (typeof window !== 'undefined' && selectedChains.length > 0) {
      localStorage.setItem(LOCAL_STORAGE_SELECTED_CHAINS, JSON.stringify(selectedChains));
    }
  }, [selectedChains]);
  
  // Effect to save transaction count to localStorage when it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_TX_COUNT, transactionCount.toString());
    }
  }, [transactionCount]);
  
  // Define checkBalances before using it in useEffect
  const checkBalances = useCallback(async () => {
    if (!account || !solanaReady || !solanaPublicKey) return;
    
    setIsLoadingBalances(true);
    
    try {
      // Check balances for all chains regardless of selection
      const activeChains = allChains;
      
      
      // Add a small delay to avoid overwhelming network requests on page load
      await new Promise(resolve => setTimeout(resolve, 500));

      const balancePromises = activeChains.map(async (chain) => {
        // Function to attempt a balance check with retries
        const attemptBalanceCheck = async (retryCount = 0, maxRetries = 3): Promise<{ 
          chainId: number | string, 
          balance: bigint, 
          hasBalance: boolean, 
          error?: string 
        }> => {
          try {
            let balance: bigint;
            const chainId = isEvmChain(chain) ? chain.id : chain.id;
            
            if (isEvmChain(chain)) {
              // EVM chain balance check
              const client = createPublicClient({
                chain,
                transport: http(),
              });
              
              balance = await client.getBalance({ address: account.address });
              // Reduced balance threshold for testing (0.001 tokens instead of 0.01)
              const hasBalance = balance > BigInt(1e14);
              
              return {
                chainId,
                balance,
                hasBalance,
              };
            } else if (isSolanaChain(chain)) {
              // Solana chain balance check with fallback endpoints
              const fallbackEndpoints = getSolanaFallbackEndpoints(chain);
              
              let lastError;
              for (const endpoint of fallbackEndpoints) {
                try {
                  const connection = new Connection(endpoint, chain.commitment);
                  const lamports = await connection.getBalance(solanaPublicKey, chain.commitment);
                  
                  // Convert lamports to bigint for consistency with EVM
                  balance = BigInt(lamports);
                  // Minimum balance threshold: 0.001 SOL (1,000,000 lamports)
                  const hasBalance = balance > BigInt(1_000_000);
                  
                  return {
                    chainId,
                    balance,
                    hasBalance,
                  };
                } catch (endpointError) {
                  console.warn(`Solana RPC ${endpoint} failed for ${chain.id}:`, endpointError);
                  lastError = endpointError;
                  continue;
                }
              }
              
              // If all endpoints failed, throw the last error
              throw lastError || new Error(`All Solana RPC endpoints failed for ${chain.id}`);
            } else {
              throw new Error(`Unsupported chain type: ${chainId}`);
            }
          } catch (error) {
            console.error(`Failed to get balance for chain ${isEvmChain(chain) ? chain.id : chain.id} (attempt ${retryCount + 1}/${maxRetries + 1}):`, error);
            
            // Retry logic
            if (retryCount < maxRetries) {
              // Exponential backoff: 1s, 2s, 4s, etc.
              const backoffTime = 1000 * Math.pow(2, retryCount);
              await new Promise(resolve => setTimeout(resolve, backoffTime));
              return attemptBalanceCheck(retryCount + 1, maxRetries);
            }
            
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            return {
              chainId: isEvmChain(chain) ? chain.id : chain.id,
              balance: BigInt(0),
              hasBalance: false,
              error: errorMessage,
            };
          }
        };
        
        // Wrap in a timeout to ensure the promise resolves eventually
        const timeoutPromise = new Promise<{ 
          chainId: number | string, 
          balance: bigint, 
          hasBalance: boolean, 
          error?: string 
        }>((_, reject) => {
          setTimeout(() => reject(new Error(`RPC request timed out for ${chain.name}`)), 30000);
        });
        
        // Race the balance check with the timeout
        return Promise.race([attemptBalanceCheck(), timeoutPromise])
          .catch(error => {
            console.error(`Ultimate failure checking balance for ${chain.name}:`, error);
            return {
              chainId: isEvmChain(chain) ? chain.id : chain.id,
              balance: BigInt(0),
              hasBalance: false,
              error: error instanceof Error 
                ? `Request failed: ${error.message}` 
                : "Unknown error checking balance",
            };
          });
      });
      
      const newBalances = await Promise.all(balancePromises);
      
      // Log any errors that occurred during balance checks
      newBalances.forEach(balance => {
        if (balance.error) {
          const chain = allChains.find(c => (isEvmChain(c) ? c.id : c.id) === balance.chainId);
          console.warn(`Error checking balance for ${chain?.name || balance.chainId}: ${balance.error}`);
        }
      });
      
      // Don't update state if component unmounted during the operation
      if (!account) return;
      
      setBalances(newBalances);
      
      // Only consider selected chains for determining if all are funded
      const selectedBalances = newBalances.filter(b => 
        selectedChains.includes(b.chainId)
      );
      
      // If all selected chains have balance, set status to ready
      const allSelectedFunded = selectedBalances.length > 0 && selectedBalances.every(b => b.hasBalance);
      
      // Only proceed with FUNDED chains
      const fundedChains = selectedBalances.filter(b => b.hasBalance).map(b => b.chainId);
      
      // Only update status if not in racing or finished state
      if (status !== "racing" && status !== "finished") {
        if (allSelectedFunded && selectedBalances.length > 0) {
          setStatus("ready");
        } else if (fundedChains.length > 0) {
          // If at least one chain is funded, allow race to start with those chains
          setStatus("ready");
          // Update selected chains to only those that are funded
          setSelectedChains(fundedChains);
        } else {
          setStatus("funding");
        }
      }
    } catch (error) {
      console.error("Failed to check balances:", error);
    } finally {
      setIsLoadingBalances(false);
    }
  }, [account, solanaPublicKey, solanaReady, status, selectedChains]);
  
  // Effect to check balances automatically when wallet is ready
  useEffect(() => {
    if (isReady && solanaReady && account && solanaPublicKey && status !== "racing" && status !== "finished") {
      // Add a small delay to ensure everything is fully initialized
      const timer = setTimeout(() => {
        checkBalances();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [isReady, solanaReady, account, solanaPublicKey, status, checkBalances]);

  // Effect to save race results when race finishes
  useEffect(() => {
    const saveResults = async () => {
      if (status === 'finished' && results.length > 0 && account) {
        try {
          const isDevelopment = process.env.NODE_ENV === 'development';
          
          if (isDevelopment) {
            console.log('🏁 [Chain Derby] Race finished! Preparing to save results...');
            console.log('🔍 [Chain Derby] Results data:', results);
            console.log('👤 [Chain Derby] Account:', account?.address);
            console.log('🔢 [Chain Derby] Transaction count:', transactionCount);
          }

          const geo = await getGeo();
          
          if (isDevelopment) {
            console.log('🌍 [Chain Derby] Geo location:', geo);
          }
          
          // Convert results to the API payload format
          const chainResults: ChainResultPayload[] = results.map(result => ({
            chainId: typeof result.chainId === 'string' ? 0 : result.chainId, // Convert Solana string IDs to 0 for now
            chainName: result.name,
            txLatencies: result.txLatencies,
            averageLatency: result.averageLatency || 0,
            totalLatency: result.totalLatency || 0,
            status: result.status,
            position: result.position,
          }));

          if (isDevelopment) {
            console.log('⛓️ [Chain Derby] Processed chain results:', chainResults);
          }

          const payload: RaceSessionPayload = {
            title: `Chain Derby Race - ${new Date().toISOString()}`,
            walletAddress: account.address,
            transactionCount,
            status: 'completed',
            city: geo.city,
            region: geo.region,
            country: geo.country,
            results: chainResults,
          };

          if (isDevelopment) {
            console.log('📋 [Chain Derby] Final payload prepared:', payload);
            console.log('🚀 [Chain Derby] Initiating API call...');
          }

          await saveRaceResults(payload);
          
          if (isDevelopment) {
            console.log('🎉 [Chain Derby] Race results saved successfully!');
          }
        } catch (error) {
          const isDevelopment = process.env.NODE_ENV === 'development';
          
          if (isDevelopment) {
            console.error('❌ [Chain Derby] Failed to save race results:', error);
          }
          // Silently handle API failures - don't impact user experience
        }
      }
    };

    // Don't await this - let it run in background without blocking
    saveResults();
  }, [status, results, account, transactionCount]);

  // Create a wallet client - defined at hook level to avoid ESLint warnings
  const createClient = (chain: Chain) => {
    if (!account) {
      throw new Error("Cannot create wallet client: account is null");
    }
    
    return createWalletClient({
      account,
      chain,
      transport: http(),
    });
  };
  
  // Start the race across selected chains
  const startRace = async () => {
    if (!account || !privateKey || !solanaKeypair || status !== "ready") return;
    
    setStatus("racing");
    
    // Filter chains based on selection (support both EVM and Solana)
    const activeChains = allChains.filter(chain => 
      selectedChains.includes(isEvmChain(chain) ? chain.id : chain.id)
    );
    
    // Pre-fetch all chain data needed for transactions
    const chainData = new Map<number | string, {
      nonce: number;
      chainId: number | string;
      gasPrice?: bigint;
      feeData?: bigint;
      blockData?: unknown;
      signedTransactions?: (string | null)[]; // Store pre-signed transactions, which may be null
      connection?: Connection; // For Solana chains
    }>();
    
    try {
      // Fetch chain data in parallel for selected chains
      const chainDataPromises = activeChains.map(async (chain) => {
        const chainId = isEvmChain(chain) ? chain.id : chain.id;
        
        try {
          if (isEvmChain(chain)) {
            // EVM chain data fetching
            const client = createPublicClient({
              chain,
              transport: http(),
            });
            
            // Run all required queries in parallel
            const [nonce, feeData, blockData] = await Promise.all([
              // Get current nonce
              client.getTransactionCount({
                address: account.address,
              }),
              
              // Get current fee data and double it for better confirmation chances
              client.getGasPrice().then(gasPrice => {
                const doubledGasPrice = gasPrice * BigInt(3);
                return doubledGasPrice;
              }).catch(() => {
                // Fallback gas prices based on known chain requirements
                const fallbackGasPrice = BigInt(
                  chain.id === 10143 ? 60000000000 : // Monad has higher gas requirements
                  chain.id === 8453 ? 2000000000 :   // Base mainnet
                  chain.id === 17180 ? 1500000000 :  // Sonic
                  1000000000                         // Default fallback (1 gwei)
                );
                return fallbackGasPrice;
              }),
              
              // Get latest block to ensure we have chain state
              client.getBlock().catch(() => null)
            ]);
            
            // Create wallet client for transaction signing
            const walletClient = createClient(chain);
            
            // Pre-sign all transactions
            const signedTransactions = [];
            
            for (let txIndex = 0; txIndex < transactionCount; txIndex++) {
              try {
                // Use Sepolia-like parameters for Monad since it's finicky
                const txParams = {
                  to: account.address,
                  value: BigInt(0),
                  gas: 21000n,
                  gasPrice: feeData,
                  nonce: nonce + txIndex,
                  chainId: chain.id,
                  data: '0x' as const, // Use const assertion for hex string
                };
                
                const signedTx = await walletClient.signTransaction(txParams);
                
                if (!signedTx) {
                  throw new Error("Signing transaction returned null");
                }
                
                signedTransactions.push(signedTx);
              } catch (signError) {
                console.error(`Error signing tx #${txIndex} for ${chain.name}:`, signError);
                // Push a placeholder so the array length still matches txIndex
                signedTransactions.push(null);
              }
            }
            
            return {
              chainId,
              nonce,
              gasPrice: feeData,
              feeData,
              blockData,
              signedTransactions
            };
          } else if (isSolanaChain(chain)) {
            // Solana chain data fetching - try fallback endpoints to find working RPC
            const fallbackEndpoints = getSolanaFallbackEndpoints(chain);
            
            let workingConnection = null;
            for (const endpoint of fallbackEndpoints) {
              try {
                const connection = new Connection(endpoint, chain.commitment);
                // Test the connection by getting latest blockhash
                await connection.getLatestBlockhash(chain.commitment);
                workingConnection = connection;
                console.log(`Using Solana RPC ${endpoint} for ${chain.id}`);
                break;
              } catch (endpointError) {
                console.warn(`Solana RPC ${endpoint} failed for ${chain.id} during setup:`, endpointError);
                continue;
              }
            }
            
            if (!workingConnection) {
              throw new Error(`All Solana RPC endpoints failed for ${chain.id} during setup`);
            }
            
            // Just store the working connection for later use
            return {
              chainId,
              nonce: 0, // Not applicable for Solana
              connection: workingConnection,
              signedTransactions: [] // Empty array - we'll create transactions fresh during racing
            };
          } else {
            throw new Error(`Unsupported chain type: ${chainId}`);
          }
        } catch (fetchError) {
          console.error(`Failed to get chain data for ${chain.name}:`, fetchError);
          
          if (isEvmChain(chain)) {
            // Use specific fallback gas prices based on chain
            const fallbackGasPrice = BigInt(
              chain.id === 10143 ? 60000000000 : // Monad has higher gas requirements
              chain.id === 8453 ? 2000000000 :   // Base mainnet
              chain.id === 17180 ? 1500000000 :  // Sonic
              chain.id === 6342 ? 3000000000 :   // MegaETH
              1000000000                         // Default fallback (1 gwei)
            );
            
            return {
              chainId,
              nonce: 0,
              gasPrice: fallbackGasPrice,
              signedTransactions: [],
            };
          } else {
            // Solana fallback
            return {
              chainId,
              nonce: 0,
              signedTransactions: [],
            };
          }
        }
      });
      
      // Store fetched data in the Map
      const results = await Promise.all(chainDataPromises);
      results.forEach((data) => {
        chainData.set(data.chainId, data);
      });
    } catch (error) {
      console.error("Error prefetching chain data:", error);
    }
    
    // Reset results for active chains only
    const initialResults = activeChains.map(chain => ({
      chainId: isEvmChain(chain) ? chain.id : chain.id,
      name: chain.name,
      color: chain.color,
      logo: chain.logo, // Add logo path from the chain config
      status: "pending" as const,
      txCompleted: 0,
      txTotal: transactionCount,
      txLatencies: [], // Empty array to store individual transaction latencies
    }));
    
    setResults(initialResults);
    
    // Run transactions in parallel for each active chain
    activeChains.forEach(async (chain) => {
      const chainId = isEvmChain(chain) ? chain.id : chain.id;
      
      try {
        // Update status to racing for this chain
        setResults(prev => 
          prev.map(r => 
            r.chainId === chainId 
              ? { ...r, status: "racing" } 
              : r
          )
        );
        
        if (isEvmChain(chain)) {
          // EVM chain transaction processing
          const publicClient = chain.id !== 11155931 ? 
            createPublicClient({
              chain,
              transport: http(),
            }) : null;

          // Run the specified number of transactions
          for (let txIndex = 0; txIndex < transactionCount; txIndex++) {
            try {
              // Skip if chain already had an error
              const currentState = results.find(r => r.chainId === chainId);
              if (currentState?.status === "error") {
                break;
              }
              
              let txHash: Hex;
              let txLatency = 0; // Initialize txLatency to avoid reference error
              const txStartTime = Date.now(); // Start time for this individual transaction
              
              // Get pre-fetched chain data including pre-signed transactions
              // Using more specific fallback gas prices if chain data isn't available
              const fallbackGasPrice = BigInt(
                chain.id === 10143 ? 60000000000 : // Monad has higher gas requirements
                chain.id === 8453 ? 2000000000 :   // Base mainnet
                chain.id === 6342 ? 3000000000 :   // MegaETH 
                chain.id === 17180 ? 1500000000 :  // Sonic
                1000000000                         // Default fallback (1 gwei)
              );
              
              const currentChainData = chainData.get(chainId) || {
                nonce: 0,
                gasPrice: fallbackGasPrice,
                signedTransactions: []
              };
            
            // Get the pre-signed transaction for this index
            const hasPreSignedTx = currentChainData.signedTransactions && 
                                  txIndex < currentChainData.signedTransactions.length &&
                                  currentChainData.signedTransactions[txIndex] !== null;
                                   
            // Use pre-signed transaction if available and not null
            const signedTransaction = hasPreSignedTx
              ? currentChainData.signedTransactions![txIndex]
              : null;
              
            
            if (chain.id === 11155931) {
              // For RISE testnet, use the sync client
              const RISESyncClient = createSyncPublicClient({
                chain,
                transport: syncTransport(chain.rpcUrls.default.http[0]),
              });
              
              // Use pre-signed transaction if available, otherwise sign now
              const txToSend = signedTransaction;
              
              
              // Check if we have a valid transaction
              if (!txToSend || typeof txToSend !== 'string') {
                throw new Error(`Invalid transaction format for RISE tx #${txIndex}`);
              }
              
              // Send the transaction and get receipt in one call
              const receipt = await RISESyncClient.sendRawTransactionSync(txToSend as `0x${string}`);
              
              // Verify receipt
              if (!receipt || !receipt.transactionHash) {
                throw new Error(`RISE sync transaction sent but no receipt returned for tx #${txIndex}`);
              }
              txHash = receipt.transactionHash;
              // Calculate transaction latency for RISE
              const txEndTime = Date.now();
              txLatency = txEndTime - txStartTime; // Using outer txLatency variable here
            } else if (chain.id === 6342) {
              // For MegaETH testnet, use the custom realtime_sendRawTransaction method
              
              // Use pre-signed transaction if available, otherwise sign now
              const txToSend = signedTransaction;
              
              // Check if we have a valid transaction
              if (!txToSend || typeof txToSend !== 'string') {
                throw new Error(`Invalid transaction format for MegaETH tx #${txIndex}`);
              }
              
              // Explicitly verify the transaction is a valid string before sending
              if (typeof txToSend !== 'string' || !txToSend.startsWith('0x')) {
                throw new Error(`Invalid transaction format for MegaETH tx #${txIndex}: ${typeof txToSend}`);
              }
              
              // Create a custom request to use the standard send transaction method
              // MegaETH devs intended realtime_sendRawTransaction but it's not a standard method
              const receipt = await publicClient!.request({
                // @ts-expect-error - MegaETH custom method not in standard types
                method: 'realtime_sendRawTransaction',
                params: [txToSend as `0x${string}`]
              }) as TransactionReceipt | null;
              
              // The result is the transaction hash directly
              if (!receipt) {
                throw new Error(`MegaETH transaction sent but no hash returned for tx #${txIndex}`);
              }
              
              txHash = receipt.transactionHash as Hex;
              
              // Calculate transaction latency for MegaETH
              const txEndTime = Date.now();
              txLatency = txEndTime - txStartTime;
            } else {
              
              // Use pre-signed transaction if available, otherwise sign now
              const txToSend = signedTransaction;
              
              // Critical null safety check
              if (!txToSend) {
                throw new Error(`No transaction to send for ${chain.name} tx #${txIndex}`);
              }
              
              
              // Explicitly verify the transaction is a valid string before sending
              if (typeof txToSend !== 'string' || !txToSend.startsWith('0x')) {
                throw new Error(`Invalid transaction format for ${chain.name} tx #${txIndex}: ${typeof txToSend}`);
              }
              
              // Normal path for non-Monad chains
              // Send the raw transaction - wagmi v2 changed the API
              txHash = await publicClient!.sendRawTransaction({
                serializedTransaction: txToSend as `0x${string}`
              });
              
              if (!txHash) {
                throw new Error(`Transaction sent but no hash returned for ${chain.name} tx #${txIndex}`);
              }
              
            }
            
            // Update result with transaction hash
            setResults(prev => 
              prev.map(r => 
                r.chainId === chainId 
                  ? { ...r, txHash } // Just store the latest hash
                  : r
              )
            );
            
            // For non-RISE and non-MegaETH chains, we need to wait for confirmation
            if (chain.id !== 11155931 && chain.id !== 6342) {
              // Wait for transaction to be confirmed
              await publicClient!.waitForTransactionReceipt({ 
                pollingInterval: 1, // 1ms
                retryDelay: 1, // 1ms
                hash: txHash,
                timeout: 60_000, // 60 seconds timeout
              });
              
              // Calculate total transaction latency from start to confirmation
              const txEndTime = Date.now();
              txLatency = txEndTime - txStartTime;
            }
              
            // Transaction confirmed, update completed count and track latencies for all chains
            setResults((prev) => {
              const updatedResults = prev.map(r => {
                if (r.chainId === chainId) {
                  // Add this transaction's latency to the array
                  const newLatencies = [...r.txLatencies, txLatency];
                  
                  const txCompleted = r.txCompleted + 1;
                  const allTxCompleted = txCompleted >= transactionCount;
                  
                  // Calculate total and average latency if we have latencies
                  const totalLatency = newLatencies.length > 0
                    ? newLatencies.reduce((sum, val) => sum + val, 0)
                    : undefined;
                    
                  const averageLatency = totalLatency !== undefined
                    ? Math.round(totalLatency / newLatencies.length)
                    : undefined;
                  
                  
                  // Ensure status is one of the allowed values from RaceResult.status type
                  const newStatus: "pending" | "racing" | "success" | "error" = 
                    allTxCompleted ? "success" : "racing";
                  
                  return { 
                    ...r, 
                    txCompleted,
                    status: newStatus,
                    txLatencies: newLatencies,
                    averageLatency,
                    totalLatency
                  };
                }
                return r;
              });
            
              // Only determine rankings when chains finish all transactions
              const finishedResults = updatedResults
                .filter(r => r.status === "success")
                .sort((a, b) => (a.averageLatency || Infinity) - (b.averageLatency || Infinity));
              
              // Assign positions to finished results
              finishedResults.forEach((result, idx) => {
                const position = idx + 1;
                updatedResults.forEach((r, i) => {
                  if (r.chainId === result.chainId) {
                    updatedResults[i] = { ...r, position };
                  }
                });
              });
              
              return updatedResults;
            });
          } catch (error) {
            console.error(`Race error for chain ${chain.id}, tx #${txIndex}:`, error);
            
            // Provide a more user-friendly error message
            let errorMessage = "Transaction failed";
            
            if (error instanceof Error) {
              // Extract the most useful part of the error message
              const fullMessage = error.message;
              
              if (fullMessage.includes("Invalid params")) {
                errorMessage = "Invalid transaction parameters. Chain may require specific gas settings.";
              } else if (fullMessage.includes("insufficient funds")) {
                errorMessage = "Insufficient funds for gas + value.";
              } else if (fullMessage.includes("nonce too low")) {
                errorMessage = "Transaction nonce issue. Try again with a new wallet.";
              } else if (fullMessage.includes("timeout")) {
                errorMessage = "Network timeout. Chain may be congested.";
              } else {
                // Use the first line of the error message if available
                const firstLine = fullMessage.split('\n')[0];
                errorMessage = firstLine || fullMessage;
              }
            }
            
            setResults(prev => 
              prev.map(r => 
                r.chainId === chainId 
                  ? { 
                      ...r, 
                      status: "error" as const, 
                      error: errorMessage
                    } 
                  : r
              )
            );
            break; // Stop sending transactions for this chain if there's an error
          }
        }
        
        } else if (isSolanaChain(chain)) {
          // Solana chain transaction processing
          const currentChainData = chainData.get(chainId);
          
          if (!currentChainData || !currentChainData.connection) {
            console.error(`No connection data for Solana chain ${chainId}`);
            return;
          }

          // Run the specified number of transactions
          for (let txIndex = 0; txIndex < transactionCount; txIndex++) {
            try {
              // Skip if chain already had an error
              const currentState = results.find(r => r.chainId === chainId);
              if (currentState?.status === "error") {
                break;
              }
              
              let txLatency = 0;
              const txStartTime = Date.now();
              
              // Create fresh transaction with unique nonce (using txIndex + timestamp for uniqueness)
              const transaction = new Transaction().add(
                SystemProgram.transfer({
                  fromPubkey: solanaKeypair.publicKey,
                  toPubkey: solanaKeypair.publicKey,
                  lamports: txIndex, // Use different amounts to make transactions unique
                })
              );
              
              const signature = await sendAndConfirmTransaction(
                currentChainData.connection,
                transaction,
                [solanaKeypair],
                {
                  commitment: chain.commitment,
                  preflightCommitment: chain.commitment,
                }
              );
              
              // Calculate transaction latency
              const txEndTime = Date.now();
              txLatency = txEndTime - txStartTime;
              
              // Update result with transaction signature
              setResults(prev => 
                prev.map(r => 
                  r.chainId === chainId 
                    ? { ...r, signature } // Store Solana signature
                    : r
                )
              );
              
              // Transaction confirmed, update completed count and track latencies
              setResults((prev) => {
                const updatedResults = prev.map(r => {
                  if (r.chainId === chainId) {
                    // Add this transaction's latency to the array
                    const newLatencies = [...r.txLatencies, txLatency];
                    
                    const txCompleted = r.txCompleted + 1;
                    const allTxCompleted = txCompleted >= transactionCount;
                    
                    // Calculate total and average latency if we have latencies
                    const totalLatency = newLatencies.length > 0
                      ? newLatencies.reduce((sum, val) => sum + val, 0)
                      : undefined;
                      
                    const averageLatency = totalLatency !== undefined
                      ? Math.round(totalLatency / newLatencies.length)
                      : undefined;
                    
                    // Ensure status is one of the allowed values from RaceResult.status type
                    const newStatus: "pending" | "racing" | "success" | "error" = 
                      allTxCompleted ? "success" : "racing";
                    
                    return { 
                      ...r, 
                      txCompleted,
                      status: newStatus,
                      txLatencies: newLatencies,
                      averageLatency,
                      totalLatency
                    };
                  }
                  return r;
                });
              
                // Only determine rankings when chains finish all transactions
                const finishedResults = updatedResults
                  .filter(r => r.status === "success")
                  .sort((a, b) => (a.averageLatency || Infinity) - (b.averageLatency || Infinity));
                
                // Assign positions to finished results
                finishedResults.forEach((result, idx) => {
                  const position = idx + 1;
                  updatedResults.forEach((r, i) => {
                    if (r.chainId === result.chainId) {
                      updatedResults[i] = { ...r, position };
                    }
                  });
                });
                
                return updatedResults;
              });
            } catch (error) {
              console.error(`Solana race error for chain ${chainId}, tx #${txIndex}:`, error);
              
              // Provide a more user-friendly error message
              let errorMessage = "Solana transaction failed";
              
              if (error instanceof Error) {
                const fullMessage = error.message;
                
                if (fullMessage.includes("insufficient funds")) {
                  errorMessage = "Insufficient SOL for transaction fees.";
                } else if (fullMessage.includes("blockhash not found")) {
                  errorMessage = "Transaction expired. Please try again.";
                } else if (fullMessage.includes("timeout")) {
                  errorMessage = "Solana network timeout. Please try again.";
                } else {
                  // Use the first line of the error message if available
                  const firstLine = fullMessage.split('\n')[0];
                  errorMessage = firstLine || fullMessage;
                }
              }
              
              setResults(prev => 
                prev.map(r => 
                  r.chainId === chainId 
                    ? { 
                        ...r, 
                        status: "error" as const, 
                        error: errorMessage
                      } 
                    : r
                )
              );
              break; // Stop sending transactions for this chain if there's an error
            }
          }
        }
        
      } catch (error) {
        console.error(`Race initialization error for chain ${chainId}:`, error);
        setResults(prev => 
          prev.map(r => 
            r.chainId === chainId 
              ? { 
                  ...r, 
                  status: "error" as const, 
                  error: error instanceof Error ? error.message : "Race initialization failed"
                } 
              : r
          )
        );
      }
    });
    
    // Check if race is complete periodically
    const checkRaceComplete = setInterval(() => {
      setResults(prev => {
        const allDone = prev.every(r => 
          r.status === "success" || r.status === "error" || r.txCompleted >= transactionCount
        );
        
        if (allDone) {
          setStatus("finished");
          clearInterval(checkRaceComplete);
        }
        return prev;
      });
    }, 1000);
  };

  // Reset everything to prepare for a new race
  const resetRace = () => {
    setStatus("idle");
    setBalances([]);
    setResults([]);
  };
  
  // Start a new race with the same configuration (when already in finished state)
  const restartRace = () => {
    // Keep the balances but reset the results
    setStatus("ready");
    setResults([]);
  };
  
  // Skip a specific chain during the race
  const skipChain = (chainId: number | string) => {
    setResults(prev => 
      prev.map(r => 
        r.chainId === chainId 
          ? { 
              ...r, 
              status: "success" as const, // Use const assertion to ensure correct type
              txCompleted: r.txTotal, // Mark all transactions as completed
              position: 999, // Put it at the end of the results
              error: "Skipped by user"
            } 
          : r
      )
    );
  };

  return {
    status,
    balances,
    results,
    isLoadingBalances,
    checkBalances,
    startRace,
    resetRace,
    restartRace,
    skipChain,
    isReady,
    account,
    privateKey,
    transactionCount,
    setTransactionCount,
    resetWallet,
    selectedChains,
    setSelectedChains,
    // Solana wallet information
    solanaPublicKey,
    solanaKeypair,
    solanaReady,
  };
}