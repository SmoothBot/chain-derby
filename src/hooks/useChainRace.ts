"use client";

import { useState, useEffect, useCallback } from "react";
import { createPublicClient, createWalletClient, http, type Hex, type Chain } from "viem";
import { raceChains } from "@/chain/networks";
import { useEmbeddedWallet } from "./useEmbeddedWallet";
import { createSyncPublicClient, syncTransport } from "rise-shred-client";

export type ChainRaceStatus = "idle" | "funding" | "ready" | "racing" | "finished";

export interface ChainBalance {
  chainId: number;
  balance: bigint;
  hasBalance: boolean;
  error?: string;
}

export interface RaceResult {
  chainId: number;
  name: string;
  color: string;
  emoji: string;
  status: "pending" | "racing" | "success" | "error";
  txHash?: Hex;
  error?: string;
  position?: number;
  txCompleted: number;       // Count of completed transactions
  txTotal: number;           // Total transactions required
  txLatencies: number[];     // Array of individual transaction latencies in ms
  averageLatency?: number;   // Average transaction latency
  totalLatency?: number;     // Total latency of all transactions combined
}

export type TransactionCount = 1 | 5 | 10 | 20;

// Constants for localStorage keys
const LOCAL_STORAGE_SELECTED_CHAINS = "horse-race-selected-chains";
const LOCAL_STORAGE_TX_COUNT = "horse-race-tx-count";

export function useChainRace() {
  const { account, privateKey, isReady, resetWallet } = useEmbeddedWallet();
  const [status, setStatus] = useState<ChainRaceStatus>("idle");
  const [balances, setBalances] = useState<ChainBalance[]>([]);
  const [results, setResults] = useState<RaceResult[]>([]);
  const [isLoadingBalances, setIsLoadingBalances] = useState(false);
  const [transactionCount, setTransactionCount] = useState<TransactionCount>(() => {
    // Load saved transaction count from localStorage if available
    if (typeof window !== 'undefined') {
      const savedCount = localStorage.getItem(LOCAL_STORAGE_TX_COUNT);
      if (savedCount) {
        const count = parseInt(savedCount, 10) as TransactionCount;
        if ([1, 5, 10, 20].includes(count)) {
          return count;
        }
      }
    }
    return 1;
  });
  
  const [selectedChains, setSelectedChains] = useState<number[]>(() => {
    // Load saved chain selection from localStorage if available
    if (typeof window !== 'undefined') {
      const savedChains = localStorage.getItem(LOCAL_STORAGE_SELECTED_CHAINS);
      if (savedChains) {
        try {
          const parsed = JSON.parse(savedChains) as number[];
          // Validate that all chains in the saved list are actually valid race chains
          const validChainIds = raceChains.map(chain => chain.id);
          const validSavedChains = parsed.filter(id => validChainIds.includes(id));
          
          if (validSavedChains.length > 0) {
            return validSavedChains;
          }
        } catch (e) {
          console.error('Failed to parse saved chain selection:', e);
        }
      }
    }
    // Default to all chains if no saved selection or invalid
    return raceChains.map(chain => chain.id);
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
    if (!account) return;
    
    setIsLoadingBalances(true);
    
    try {
      // Filter chains based on selection
      const allChains = raceChains; // Check balances for all chains regardless of selection
      
      // Log active chains for debugging
      console.log('Checking balances for chains:', allChains.map(c => ({ id: c.id, name: c.name })));
      console.log('Current wallet address:', account.address);
      
      // Add a small delay to avoid overwhelming network requests on page load
      await new Promise(resolve => setTimeout(resolve, 500));

      const balancePromises = allChains.map(async (chain) => {
        // Function to attempt a balance check with retries
        const attemptBalanceCheck = async (retryCount = 0, maxRetries = 3): Promise<{ 
          chainId: number, 
          balance: bigint, 
          hasBalance: boolean, 
          error?: string 
        }> => {
          try {
            // Create client with timeout options - increase timeout for initial page load
            const client = createPublicClient({
              chain,
              transport: http(),
            });
            console.log(client)
            
            // Log RPC URL used
            console.log(`Checking balance on ${chain.name} using RPC:`, chain.rpcUrls.default.http[0]);
            
            const balance = await client.getBalance({ address: account.address });
            
            // Log the actual balance value
            console.log(`${chain.name} balance:`, balance.toString(), 'Has sufficient funds:', balance > BigInt(1e16));
            
            // Reduced balance threshold for testing (0.001 tokens instead of 0.01)
            const hasBalance = balance > BigInt(1e14);
            
            return {
              chainId: chain.id,
              balance,
              hasBalance,
            };
          } catch (error) {
            console.error(`Failed to get balance for chain ${chain.id} (attempt ${retryCount + 1}/${maxRetries + 1}):`, error);
            
            // Retry logic
            if (retryCount < maxRetries) {
              // Exponential backoff: 1s, 2s, 4s, etc.
              const backoffTime = 1000 * Math.pow(2, retryCount);
              console.log(`Retrying ${chain.name} in ${backoffTime}ms...`);
              await new Promise(resolve => setTimeout(resolve, backoffTime));
              return attemptBalanceCheck(retryCount + 1, maxRetries);
            }
            
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            return {
              chainId: chain.id,
              balance: BigInt(0),
              hasBalance: false,
              error: errorMessage,
            };
          }
        };
        
        // Wrap in a timeout to ensure the promise resolves eventually
        const timeoutPromise = new Promise<{ 
          chainId: number, 
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
              chainId: chain.id,
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
          const chain = raceChains.find(c => c.id === balance.chainId);
          console.warn(`Error checking balance for ${chain?.name || balance.chainId}: ${balance.error}`);
        }
      });
      
      // Don't update state if component unmounted during the operation
      if (!account) return;
      
      setBalances(newBalances);
      
      console.log('New balances:', newBalances);
      
      // If all chains have balance, set status to ready
      const allFunded = newBalances.every(b => b.hasBalance);
      console.log('All chains funded:', allFunded, 'Current status:', status);
      
      // Only update status if not in racing or finished state
      console.log('status', status)
      if (status !== "racing" && status !== "finished") {
        if (allFunded) {
          setStatus("ready");
        } else if (status === "idle") {
          setStatus("funding");
        }
      }
    } catch (error) {
      console.error("Failed to check balances:", error);
    } finally {
      setIsLoadingBalances(false);
    }
  }, [account, status, setBalances, setStatus, setIsLoadingBalances]);
  
  // Effect to check balances automatically when wallet is ready
  useEffect(() => {
    if (isReady && account && status !== "racing" && status !== "finished") {
      console.log("Wallet is ready, automatically checking balances");
      // Add a small delay to ensure everything is fully initialized
      const timer = setTimeout(() => {
        checkBalances();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [isReady, account, status, checkBalances]);

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
    if (!account || !privateKey || status !== "ready") return;
    
    setStatus("racing");
    
    // Filter chains based on selection
    const activeChains = raceChains.filter(chain => selectedChains.includes(chain.id));
    
    // Pre-fetch all chain data needed for transactions
    const chainData = new Map<number, {
      nonce: number;
      chainId: number;
      gasPrice: bigint;
      feeData?: bigint;
      blockData?: unknown;
      signedTransactions?: (string | null)[]; // Store pre-signed transactions, which may be null
    }>();
    
    try {
      // Fetch chain data in parallel for selected chains
      const chainDataPromises = activeChains.map(async (chain) => {
        try {
          console.time(`prefetch-chain-${chain.id}`);
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
              console.log(`Fetched gas price for ${chain.name}: ${gasPrice.toString()} wei`);
              const doubledGasPrice = gasPrice * BigInt(2);
              console.log(`Using 2x gas price for ${chain.name}: ${doubledGasPrice.toString()} wei`);
              return doubledGasPrice;
            }).catch(error => {
              console.error(`Failed to get gas price for ${chain.name}:`, error);
              // Fallback gas prices based on known chain requirements
              const fallbackGasPrice = BigInt(
                chain.id === 10143 ? 60000000000 : // Monad has higher gas requirements
                chain.id === 8453 ? 2000000000 :   // Base mainnet
                chain.id === 17180 ? 1500000000 :  // Sonic
                1000000000                         // Default fallback (1 gwei)
              );
              console.log(`Using fallback gas price for ${chain.name}: ${fallbackGasPrice.toString()} wei`);
              return fallbackGasPrice;
            }),
            
            // Get latest block to ensure we have chain state
            client.getBlock().catch(() => null)
          ]);
          
          console.timeEnd(`prefetch-chain-${chain.id}`);
          
          console.log(`Pre-fetched data for ${chain.name}:`, {
            nonce,
            chainId: chain.id,
            gasPrice: feeData.toString()
          });
          
          // Create wallet client for transaction signing
          const walletClient = createClient(chain);
          
          // Pre-sign all transactions
          console.time(`presign-transactions-${chain.id}`);
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
              
              // Log transaction parameters in a way that handles EIP-1559 transactions
              console.log(`Signing tx #${txIndex} for ${chain.name} with params:`, {
                ...Object.fromEntries(
                  Object.entries(txParams).map(([k, v]) => {
                    if (typeof v === 'bigint') return [k, v.toString()];
                    return [k, v];
                  })
                )
              });
              
              const signedTx = await walletClient.signTransaction(txParams);
              
              if (!signedTx) {
                console.error(`Failed to sign transaction #${txIndex} for ${chain.name} - result is null`);
                throw new Error("Signing transaction returned null");
              }
              
              console.log(`Successfully signed tx #${txIndex} for ${chain.name}, length: ${signedTx.length}`);
              signedTransactions.push(signedTx);
            } catch (signError) {
              console.error(`Error signing tx #${txIndex} for ${chain.name}:`, signError);
              // Push a placeholder so the array length still matches txIndex
              signedTransactions.push(null);
            }
          }
          console.timeEnd(`presign-transactions-${chain.id}`);
          
          console.log(`Pre-signed ${signedTransactions.length} transactions for ${chain.name}`);
          
          return {
            chainId: chain.id,
            nonce,
            chainId_numeric: chain.id,
            gasPrice: feeData,
            feeData,
            blockData,
            signedTransactions
          };
        } catch (error) {
          console.error(`Failed to get chain data for ${chain.name}:`, error);
          // Use specific fallback gas prices based on chain
          const fallbackGasPrice = BigInt(
            chain.id === 10143 ? 60000000000 : // Monad has higher gas requirements
            chain.id === 8453 ? 2000000000 :   // Base mainnet
            chain.id === 17180 ? 1500000000 :  // Sonic
            chain.id === 6342 ? 3000000000 :   // MegaETH
            1000000000                         // Default fallback (1 gwei)
          );
          
          console.log(`Using fallback gas price for ${chain.name} due to error: ${fallbackGasPrice.toString()} wei`);
          
          return {
            chainId: chain.id,
            nonce: 0,
            chainId_numeric: chain.id,
            gasPrice: fallbackGasPrice,
            signedTransactions: [],
          };
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
      chainId: chain.id,
      name: chain.name,
      color: chain.color,
      emoji: chain.emoji,
      status: "pending" as const,
      txCompleted: 0,
      txTotal: transactionCount,
      txLatencies: [], // Empty array to store individual transaction latencies
    }));
    
    setResults(initialResults);
    
    // Run transactions in parallel for each active chain
    activeChains.forEach(async (chain) => {
      try {
        // Update status to racing for this chain
        setResults(prev => 
          prev.map(r => 
            r.chainId === chain.id 
              ? { ...r, status: "racing" } 
              : r
          )
        );
        
        // Create public client for standard chains (non-RISE)
        const publicClient = chain.id !== 11155931 ? 
          createPublicClient({
            chain,
            transport: http(),
          }) : null;

        // Run the specified number of transactions
        for (let txIndex = 0; txIndex < transactionCount; txIndex++) {
          try {
            // Skip if chain already had an error
            const currentState = results.find(r => r.chainId === chain.id);
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
            
            const currentChainData = chainData.get(chain.id) || {
              nonce: 0,
              gasPrice: fallbackGasPrice,
              chainId_numeric: chain.id,
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
              
            if (currentChainData.signedTransactions && 
                txIndex < currentChainData.signedTransactions.length && 
                currentChainData.signedTransactions[txIndex] === null) {
              console.warn(`Pre-signed transaction for ${chain.name} tx #${txIndex} exists but is null`);
            }
              
            // For logging - get the nonce we're using
            const nonce = currentChainData.nonce + txIndex;
            console.log(`Using nonce ${nonce} for ${chain.name} transaction #${txIndex}`);
            
            if (!signedTransaction) {
              console.warn(`No pre-signed transaction for ${chain.name} tx #${txIndex}, signing now`);
            } else {
              console.log(`Using pre-signed transaction for ${chain.name} tx #${txIndex}`);
            }
            
            if (chain.id === 11155931) {
              // For RISE testnet, use the sync client
              const RISESyncClient = createSyncPublicClient({
                chain,
                transport: syncTransport(chain.rpcUrls.default.http[0]),
              });
              
              // Use pre-signed transaction if available, otherwise sign now
              const txToSend = signedTransaction;
              
              console.time('sending');
              
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
              console.log(`RISE transaction #${txIndex} completed in ${txLatency}ms`);
              console.timeEnd('sending');
            } else if (chain.id === 6342) {
              // For MegaETH testnet, use the custom realtime_sendRawTransaction method
              console.time('megaeth-realtime-tx');
              
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
              const txHashResult = await publicClient!.request({
                method: 'eth_sendRawTransaction',
                params: [txToSend as `0x${string}`]
              });
              
              // The result is the transaction hash directly
              if (!txHashResult) {
                throw new Error(`MegaETH transaction sent but no hash returned for tx #${txIndex}`);
              }
              
              txHash = txHashResult as Hex;
              
              // Calculate transaction latency for MegaETH
              const txEndTime = Date.now();
              txLatency = txEndTime - txStartTime;
              console.log(`MegaETH transaction #${txIndex} completed in ${txLatency}ms`);
              console.timeEnd('megaeth-realtime-tx');
            } else {
              console.time('standard-tx');
              
              // Use pre-signed transaction if available, otherwise sign now
              const txToSend = signedTransaction;
              
              // Critical null safety check
              if (!txToSend) {
                throw new Error(`No transaction to send for ${chain.name} tx #${txIndex}`);
              }
              
              // More detailed inspection of txToSend to find the issue
              console.log(`Raw txToSend for ${chain.name}:`, {
                type: typeof txToSend,
                isNull: txToSend === null,
                isUndefined: txToSend === undefined,
                value: txToSend,
                length: txToSend ? txToSend.length : 'N/A'
              });
              
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
              
              // For Monad, we need to mark the end time now since we don't have wait for receipt
              // We'll re-start the timer when waiting for confirmation
              const endSubmitTime = Date.now();
              const submitLatency = endSubmitTime - txStartTime;
              console.log(`${chain.name} transaction #${txIndex} submitted in ${submitLatency}ms`);
              console.timeEnd('standard-tx');
            }
            
            // Update result with transaction hash
            setResults(prev => 
              prev.map(r => 
                r.chainId === chain.id 
                  ? { ...r, txHash } // Just store the latest hash
                  : r
              )
            );
            
            // For non-RISE and non-MegaETH chains, we need to wait for confirmation
            if (chain.id !== 11155931 && chain.id !== 6342) {
              console.time(`tx-${txIndex}-confirm`);
              // Start confirmation timer
              const confirmStartTime = Date.now();
              
              // Wait for transaction to be confirmed
              await publicClient!.waitForTransactionReceipt({ 
                pollingInterval: 0,
                retryDelay: 0,
                hash: txHash,
                timeout: 60_000, // 60 seconds timeout
              });
              
              // Calculate total transaction latency from start to confirmation
              const txEndTime = Date.now();
              txLatency = txEndTime - txStartTime;
              
              const confirmTime = txEndTime - confirmStartTime;
              console.log(`${chain.name} transaction #${txIndex} confirmed in ${confirmTime}ms, total latency: ${txLatency}ms`);
              console.timeEnd(`tx-${txIndex}-confirm`);
            }
              
            // Transaction confirmed, update completed count and track latencies for all chains
            setResults((prev) => {
              const updatedResults = prev.map(r => {
                if (r.chainId === chain.id) {
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
                  
                  if (allTxCompleted) {
                    console.log(`All ${txCompleted} transactions completed for ${chain.name}`);
                    console.log(`Total latency: ${totalLatency}ms, Average latency: ${averageLatency}ms`);
                    console.log(`Individual latencies: ${newLatencies.join(', ')}ms`);
                  }
                  
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
                r.chainId === chain.id 
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
        
      } catch (error) {
        console.error(`Race initialization error for chain ${chain.id}:`, error);
        setResults(prev => 
          prev.map(r => 
            r.chainId === chain.id 
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
  const skipChain = (chainId: number) => {
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
  };
}