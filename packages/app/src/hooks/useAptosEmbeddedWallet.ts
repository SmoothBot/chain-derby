"use client";

import { useEffect, useState } from "react";
import { Account, Ed25519PrivateKey } from "@aptos-labs/ts-sdk";

interface AptosWalletState {
  privateKey: string | null;
  account: Account | null;
  address: string | null;
  isReady: boolean;
}

const APTOS_STORAGE_KEY = "horse-race-aptos-wallet";

export function useAptosEmbeddedWallet() {
  const [walletState, setWalletState] = useState<AptosWalletState>({
    privateKey: null,
    account: null,
    address: null,
    isReady: false,
  });

  // Initialize the wallet on component mount
  useEffect(() => {
    // Check if we already have a wallet in localStorage
    const storedWallet = localStorage.getItem(APTOS_STORAGE_KEY);
    
    if (storedWallet) {
      try {
        const { privateKey } = JSON.parse(storedWallet);
        const ed25519PrivateKey = new Ed25519PrivateKey(privateKey);
        const account = Account.fromPrivateKey({ privateKey: ed25519PrivateKey });
        
        setWalletState({
          privateKey,
          account,
          address: account.accountAddress.toString(),
          isReady: true,
        });
      } catch (error) {
        console.error("Failed to restore Aptos wallet from localStorage:", error);
        createNewWallet();
      }
    } else {
      createNewWallet();
    }
  }, []);

  // Create a new wallet and store it in localStorage
  const createNewWallet = () => {
    try {
      const account = Account.generate();
      const privateKey = account.privateKey.toString();
      
      // Store in localStorage
      localStorage.setItem(
        APTOS_STORAGE_KEY,
        JSON.stringify({ privateKey })
      );
      
      setWalletState({
        privateKey,
        account,
        address: account.accountAddress.toString(),
        isReady: true,
      });
    } catch (error) {
      console.error("Failed to create Aptos wallet:", error);
      setWalletState(prev => ({ ...prev, isReady: true }));
    }
  };

  // Clear the wallet from localStorage
  const resetWallet = () => {
    localStorage.removeItem(APTOS_STORAGE_KEY);
    createNewWallet();
  };

  return {
    ...walletState,
    resetWallet,
  };
}