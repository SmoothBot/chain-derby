"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import type { Hex } from "viem";
import { allChains, type AnyChainConfig } from "@/chain/networks";
import { useEmbeddedWallet } from "./useEmbeddedWallet";
import { useSolanaEmbeddedWallet } from "./useSolanaEmbeddedWallet";
import { useFuelEmbeddedWallet } from "./useFuelEmbeddedWallet";
import { useAptosEmbeddedWallet } from "./useAptosEmbeddedWallet";
import { useSoonEmbeddedWallet } from "./useSoonEmbeddedWallet";
import { useStarknetEmbeddedWallet } from "./useStarknetEmbeddedWallet";
import { getGeo } from "@/lib/geo";
import { saveRaceResults } from "@/lib/api";
import { ChainAdapterFactory, type WalletStates } from "./adapters/ChainAdapterFactory";
import type { ChainAdapter } from "./adapters/base/ChainAdapter.interface";

// Re-export types from original hook for compatibility
export type ChainRaceStatus = "idle" | "funding" | "ready" | "racing" | "finished";
export type TransactionCount = 1 | 5 | 10 | 20;
export type LayerFilter = 'L1' | 'L2' | 'Both';
export type NetworkFilter = 'Mainnet' | 'Testnet';

export interface ChainBalance {
  chainId: number | string;
  balance: bigint;
  hasBalance: boolean;
  error?: string;
}

export interface RaceResult {
  chainId: number | string;
  name: string;
  color: string;
  logo?: string;
  status: "pending" | "racing" | "success" | "error";
  txHash?: Hex;
  signature?: string;
  error?: string;
  position?: number;
  txCompleted: number;
  txTotal: number;
  txLatencies: number[];
  averageLatency?: number;
  totalLatency?: number;
}

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
  txLatencies: number[];
  averageLatency: number;
  totalLatency: number;
  status: string;
  position?: number;
}

// Constants for localStorage keys
const LOCAL_STORAGE_SELECTED_CHAINS = "horse-race-selected-chains";
const LOCAL_STORAGE_TX_COUNT = "horse-race-tx-count";
const LOCAL_STORAGE_LAYER_FILTER = "horse-race-layer-filter";
const LOCAL_STORAGE_NETWORK_FILTER = "horse-race-network-filter";

// Helper function to get chain ID consistently
function getChainId(chain: AnyChainConfig): number | string {
  return 'id' in chain ? chain.id : (chain as any).id;
}

export function useChainRace() {
  // All wallet hooks
  const { account, privateKey, isReady, resetWallet } = useEmbeddedWallet();
  const { publicKey: solanaPublicKey, keypair: solanaKeypair, isReady: solanaReady } = useSolanaEmbeddedWallet();
  const { wallet: fuelWallet, isReady: fuelReady } = useFuelEmbeddedWallet();
  const { account: aptosAccount, address: aptosAddress, isReady: aptosReady } = useAptosEmbeddedWallet();
  const { publicKey: soonPublicKey, keypair: soonKeypair } = useSoonEmbeddedWallet();
  const { starknetprivateKey, starknetaccount, starknetisReady } = useStarknetEmbeddedWallet();

  // Core state
  const [status, setStatus] = useState<ChainRaceStatus>("idle");
  const [balances, setBalances] = useState<ChainBalance[]>([]);
  const [results, setResults] = useState<RaceResult[]>([]);
  const [isLoadingBalances, setIsLoadingBalances] = useState(false);

  // Settings state with localStorage persistence
  const [transactionCount, setTransactionCount] = useState<TransactionCount>(() => {
    // Commented out localStorage loading for now as in original
    return 10;
  });

  const [layerFilter, setLayerFilter] = useState<LayerFilter>(() => {
    if (typeof window !== 'undefined') {
      const savedFilter = localStorage.getItem(LOCAL_STORAGE_LAYER_FILTER);
      if (savedFilter && ['L1', 'L2', 'Both'].includes(savedFilter)) {
        return savedFilter as LayerFilter;
      }
    }
    return 'Both';
  });

  const [networkFilter, setNetworkFilter] = useState<NetworkFilter>(() => {
    if (typeof window !== 'undefined') {
      const savedFilter = localStorage.getItem(LOCAL_STORAGE_NETWORK_FILTER);
      if (savedFilter && ['Mainnet', 'Testnet'].includes(savedFilter)) {
        return savedFilter as NetworkFilter;
      }
    }
    return 'Testnet';
  });

  const [selectedChains, setSelectedChains] = useState<(number | string)[]>(() => {
    if (typeof window !== 'undefined') {
      const savedChains = localStorage.getItem(LOCAL_STORAGE_SELECTED_CHAINS);
      if (savedChains) {
        try {
          const parsed = JSON.parse(savedChains) as (number | string)[];
          const validChainIds: (number | string)[] = allChains.map(getChainId);
          const validSavedChains = parsed.filter(id => validChainIds.includes(id));

          if (validSavedChains.length > 0) {
            return validSavedChains;
          }
        } catch (e) {
          console.error('Failed to parse saved chain selection:', e);
        }
      }
    }
    return allChains.map(getChainId);
  });

  // Wallet states for adapter factory
  const walletStates: WalletStates = useMemo(() => ({
    evm: { account, privateKey, isReady },
    solana: { publicKey: solanaPublicKey, keypair: solanaKeypair, isReady: solanaReady },
    fuel: { wallet: fuelWallet, isReady: fuelReady },
    aptos: { account: aptosAccount, address: aptosAddress, isReady: aptosReady },
    soon: { publicKey: soonPublicKey, keypair: soonKeypair },
    starknet: { starknetprivateKey, starknetaccount, starknetisReady }
  }), [account, privateKey, isReady, solanaPublicKey, solanaKeypair, solanaReady, 
       fuelWallet, fuelReady, aptosAccount, aptosAddress, aptosReady, 
       soonPublicKey, soonKeypair, starknetprivateKey, starknetaccount, starknetisReady]);

  // localStorage effects
  useEffect(() => {
    if (typeof window !== 'undefined' && selectedChains.length > 0) {
      localStorage.setItem(LOCAL_STORAGE_SELECTED_CHAINS, JSON.stringify(selectedChains));
    }
  }, [selectedChains]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_TX_COUNT, transactionCount.toString());
    }
  }, [transactionCount]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_LAYER_FILTER, layerFilter);
    }
  }, [layerFilter]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_NETWORK_FILTER, networkFilter);
    }
  }, [networkFilter]);

  // Get filtered chains based on layer and network filters
  const getFilteredChains = useCallback(() => {
    return allChains.filter(chain => {
      // Layer filter
      if (layerFilter !== 'Both') {
        if ('layer' in chain) {
          if (chain.layer !== layerFilter) return false;
        } else {
          // For non-EVM chains, apply layer logic as in original
          const chainId = getChainId(chain);
          if (typeof chainId === 'string') {
            if (chainId.startsWith('soon-') || chainId.includes('starknet')) {
              if (layerFilter !== 'L2') return false;
            } else {
              // Solana chains considered L1
              if (layerFilter !== 'L1') return false;
            }
          }
        }
      }

      // Network filter
      if ('testnet' in chain) {
        const isTestnet = chain.testnet;
        if (networkFilter === 'Testnet' && !isTestnet) return false;
        if (networkFilter === 'Mainnet' && isTestnet) return false;
      } else {
        // For Solana chains
        const chainId = getChainId(chain);
        if (typeof chainId === 'string') {
          const isMainnet = chainId === 'solana-mainnet';
          if (networkFilter === 'Mainnet' && !isMainnet) return false;
          if (networkFilter === 'Testnet' && isMainnet) return false;
        }
      }

      return true;
    });
  }, [layerFilter, networkFilter]);

  // Create adapters for all chains
  const allAdapters = useMemo(() => {
    try {
      return ChainAdapterFactory.createMultiple(allChains, walletStates);
    } catch (error) {
      console.error('Error creating adapters:', error);
      return [];
    }
  }, [walletStates]);

  // Check balances using adapters
  const checkBalances = useCallback(async () => {
    if (!account) {
      setIsLoadingBalances(false);
      return;
    }

    setIsLoadingBalances(true);

    try {
      const balancePromises = allAdapters.map(async (adapter) => {
        try {
          return await adapter.checkBalance();
        } catch (error) {
          console.error(`Failed to check balance for ${adapter.name}:`, error);
          return {
            chainId: adapter.chainId,
            balance: BigInt(0),
            hasBalance: false,
            error: error instanceof Error ? error.message : "Unknown error"
          };
        }
      });

      const newBalances = await Promise.all(balancePromises);

      if (!account) {
        setIsLoadingBalances(false);
        return;
      }

      setBalances(newBalances);

      // Update status based on balances
      const selectedBalances = newBalances.filter(b => selectedChains.includes(b.chainId));
      const allSelectedFunded = selectedBalances.every(b => b.hasBalance);

      if (status !== "racing" && status !== "finished") {
        if (allSelectedFunded && selectedBalances.length > 0) {
          setStatus("ready");
        } else {
          const fundedChains = newBalances.filter(b => b.hasBalance).map(b => b.chainId);
          const fundedSelectedChains = selectedChains.filter(chainId => fundedChains.includes(chainId));
          
          if (fundedSelectedChains.length > 0) {
            setStatus("ready");
            if (fundedSelectedChains.length !== selectedChains.length) {
              setSelectedChains(fundedSelectedChains);
            }
          } else {
            setStatus("funding");
          }
        }
      }
    } catch (error) {
      console.error("Failed to check balances:", error);
      if (status !== "racing" && status !== "finished") {
        setStatus("funding");
      }
    } finally {
      setIsLoadingBalances(false);
    }
  }, [account, allAdapters, selectedChains, status]);

  // Effect to check initial balances
  useEffect(() => {
    const checkInitialBalances = async () => {
      if (isLoadingBalances || status === "racing" || status === "finished" || !account) {
        return;
      }

      try {
        await checkBalances();
      } catch (error) {
        console.error('Error checking balances:', error);
        setIsLoadingBalances(false);
      }
    };

    checkInitialBalances();
  }, [status, checkBalances, account]);

  // Start the race using adapters
  const startRace = async () => {
    if (!account || !privateKey || status !== "ready") return;

    setStatus("racing");

    // Get filtered and selected chains
    const filteredChains = getFilteredChains();
    const activeChains = filteredChains.filter(chain => 
      selectedChains.includes(getChainId(chain))
    );

    // Create adapters for active chains
    const activeAdapters = activeChains.map(chain => 
      ChainAdapterFactory.create(chain, walletStates)
    );

    try {
      // Pre-prepare all transactions for all adapters FIRST
      const preparationPromises = activeAdapters.map(async (adapter) => {
        try {
          const preparedTransactions = await adapter.prepareTransactions(transactionCount);
          return { adapter, preparedTransactions };
        } catch (error) {
          console.error(`Failed to prepare transactions for ${adapter.name}:`, error);
          return { adapter, preparedTransactions: [], error };
        }
      });

      const preparedData = await Promise.all(preparationPromises);

      // Now initialize results AFTER preparation is complete
      const initialResults = activeAdapters.map(adapter => ({
        chainId: adapter.chainId,
        name: adapter.name,
        color: adapter.color,
        logo: adapter.logo,
        status: "pending" as const,
        txCompleted: 0,
        txTotal: transactionCount,
        txLatencies: [],
      }));

      setResults(initialResults);

      // Run races in parallel for each adapter with pre-prepared transactions
      preparedData.forEach(async ({ adapter, preparedTransactions, error }) => {
        try {
          if (error) {
            throw new Error(`Preparation failed: ${error}`);
          }

          // Update status to racing
          setResults(prev =>
            prev.map(r => r.chainId === adapter.chainId ? { ...r, status: "racing" } : r)
          );

          // Execute transactions sequentially for each chain
          for (let i = 0; i < transactionCount; i++) {
            try {
              // Check if chain already errored
              const currentState = results.find(r => r.chainId === adapter.chainId);
              if (currentState?.status === "error") break;

              const preparedTx = preparedTransactions[i];
              if (!preparedTx) continue;

              // Execute transaction
              const result = await adapter.executeTransaction(preparedTx);

              if (!result.success) {
                throw new Error(result.error || "Transaction failed");
              }

              // Update results
              setResults(prev => {
                const updatedResults = prev.map(r => {
                  if (r.chainId === adapter.chainId) {
                    const newLatencies = [...r.txLatencies, result.latency];
                    const txCompleted = r.txCompleted + 1;
                    const allTxCompleted = txCompleted >= transactionCount;

                    const totalLatency = newLatencies.reduce((sum, val) => sum + val, 0);
                    const averageLatency = Math.round(totalLatency / newLatencies.length);

                    return {
                      ...r,
                      txHash: result.hash || r.txHash,
                      signature: result.signature || r.signature,
                      txCompleted,
                      status: allTxCompleted ? "success" as const : "racing" as const,
                      txLatencies: newLatencies,
                      averageLatency,
                      totalLatency
                    };
                  }
                  return r;
                });

                // Update positions
                const finishedResults = updatedResults
                  .filter(r => r.status === "success")
                  .sort((a, b) => (a.averageLatency || Infinity) - (b.averageLatency || Infinity));

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
              console.error(`Race error for ${adapter.name}, tx #${i}:`, error);
              
              setResults(prev =>
                prev.map(r =>
                  r.chainId === adapter.chainId
                    ? {
                      ...r,
                      status: "error" as const,
                      error: error instanceof Error ? error.message : "Transaction failed"
                    }
                    : r
                )
              );
              break;
            }
          }

        } catch (error) {
          console.error(`Race initialization error for ${adapter.name}:`, error);
          setResults(prev =>
            prev.map(r =>
              r.chainId === adapter.chainId
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

    } catch (error) {
      console.error("Error preparing race:", error);
      setStatus("ready"); // Reset status on preparation failure
    }

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

  // Save race results effect (same as original)
  useEffect(() => {
    const saveResults = async () => {
      if (status === 'finished' && results.length > 0 && account) {
        try {
          const isDevelopment = process.env.NODE_ENV === 'development';

          if (isDevelopment) {
            console.log('🏁 [Chain Derby] Race finished! Preparing to save results...');
          }

          const geo = await getGeo();

          const chainResults: ChainResultPayload[] = results.map(result => {
            let numericChainId: number;
            if (typeof result.chainId === 'string') {
              if (result.chainId.includes('solana')) {
                numericChainId = 999999;
              } else if (result.chainId.includes('aptos-testnet')) {
                numericChainId = 999998;
              } else if (result.chainId.includes('aptos-mainnet')) {
                numericChainId = 999997;
              } else {
                numericChainId = 999996;
              }
            } else {
              numericChainId = result.chainId;
            }

            return {
              chainId: numericChainId,
              chainName: result.name,
              txLatencies: result.txLatencies,
              averageLatency: result.averageLatency || 0,
              totalLatency: result.totalLatency || 0,
              status: result.status,
              position: result.position,
            };
          });

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

          await saveRaceResults(payload);

          if (isDevelopment) {
            console.log('🎉 [Chain Derby] Race results saved successfully!');
          }
        } catch (error) {
          const isDevelopment = process.env.NODE_ENV === 'development';
          if (isDevelopment) {
            console.error('❌ [Chain Derby] Failed to save race results:', error);
          }
        }
      }
    };

    saveResults();
  }, [status, results, account, transactionCount]);

  // Utility functions
  const resetRace = () => {
    setStatus("idle");
    setBalances([]);
    setResults([]);
  };

  const restartRace = () => {
    setStatus("ready");
    setResults([]);
  };

  const skipChain = (chainId: number | string) => {
    setResults(prev =>
      prev.map(r =>
        r.chainId === chainId
          ? {
            ...r,
            status: "success" as const,
            txCompleted: r.txTotal,
            position: 999,
            error: "Skipped by user"
          }
          : r
      )
    );
  };

  // Return exact same interface as original hook
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
    layerFilter,
    setLayerFilter,
    networkFilter,
    setNetworkFilter,
    getFilteredChains,
    // Solana wallet information
    solanaPublicKey,
    solanaKeypair,
    solanaReady,
    // Fuel wallet information
    fuelWallet,
    fuelReady,
    // Aptos wallet information
    aptosAccount,
    aptosAddress,
    aptosReady,
    // Starknet wallet information
    starknetaccount,
    starknetprivateKey,
    starknetisReady,
  };
}