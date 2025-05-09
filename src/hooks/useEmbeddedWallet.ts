"use client";

import { useEffect, useState } from "react";
import { privateKeyToAccount, type Account, generatePrivateKey } from "viem/accounts";
import type { Hex } from "viem";

interface EmbeddedWalletState {
  privateKey: Hex | null;
  account: Account | null;
  isReady: boolean;
}

const LOCAL_STORAGE_KEY = "horse-race-wallet";

export function useEmbeddedWallet() {
  const [walletState, setWalletState] = useState<EmbeddedWalletState>({
    privateKey: null,
    account: null,
    isReady: false,
  });

  // Initialize the wallet on component mount
  useEffect(() => {
    // Check if we already have a wallet in localStorage
    const storedWallet = localStorage.getItem(LOCAL_STORAGE_KEY);
    
    if (storedWallet) {
      try {
        const { privateKey } = JSON.parse(storedWallet);
        const account = privateKeyToAccount(privateKey as Hex);
        
        setWalletState({
          privateKey: privateKey as Hex,
          account,
          isReady: true,
        });
      } catch (error) {
        console.error("Failed to restore wallet from localStorage:", error);
        createNewWallet();
      }
    } else {
      createNewWallet();
    }
  }, []);

  // Create a new wallet and store it in localStorage
  const createNewWallet = () => {
    try {
      const privateKey = generatePrivateKey();
      const account = privateKeyToAccount(privateKey);
      
      // Store in localStorage
      localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify({ privateKey })
      );
      
      setWalletState({
        privateKey,
        account,
        isReady: true,
      });
    } catch (error) {
      console.error("Failed to create wallet:", error);
      setWalletState(prev => ({ ...prev, isReady: true }));
    }
  };

  // Clear the wallet from localStorage
  const resetWallet = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    createNewWallet();
  };

  return {
    ...walletState,
    resetWallet,
  };
}