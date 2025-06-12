"use client";

import { useEffect, useState } from "react";
import { Keypair, PublicKey } from "@solana/web3.js";
import bs58 from "bs58";

interface SoonWalletState {
  secret: string | null;           // base‑58 private key
  publicKey: PublicKey | null;
  keypair: Keypair | null;
  isReady: boolean;
}

const SOON_STORAGE_KEY = "horse-race-soon-wallet";

export function useSoonEmbeddedWallet() {
  const [walletState, setWalletState] = useState<SoonWalletState>({
    secret: null,
    publicKey: null,
    keypair: null,
    isReady: false,
  });

  // Initialize the wallet on component mount
  useEffect(() => {
    // Check if we already have a wallet in localStorage
    const storedWallet = localStorage.getItem(SOON_STORAGE_KEY);
    
    if (storedWallet) {
      try {
        const { secret } = JSON.parse(storedWallet);
        const secretKey = bs58.decode(secret);
        const keypair = Keypair.fromSecretKey(secretKey);
        
        setWalletState({
          secret,
          publicKey: keypair.publicKey,
          keypair,
          isReady: true,
        });
      } catch (error) {
        console.error("Failed to restore SOON wallet from localStorage:", error);
        createNewWallet();
      }
    } else {
      createNewWallet();
    }
  }, []);

  // Create a new wallet and store it in localStorage
  const createNewWallet = () => {
    try {
      const keypair = Keypair.generate();
      const secret = bs58.encode(keypair.secretKey);
      
      // Store in localStorage
      localStorage.setItem(
        SOON_STORAGE_KEY,
        JSON.stringify({ secret })
      );
      
      setWalletState({
        secret,
        publicKey: keypair.publicKey,
        keypair,
        isReady: true,
      });
    } catch (error) {
      console.error("Failed to create SOON wallet:", error);
      setWalletState(prev => ({ ...prev, isReady: true }));
    }
  };

  // Clear the wallet from localStorage
  const resetWallet = () => {
    localStorage.removeItem(SOON_STORAGE_KEY);
    createNewWallet();
  };

  return {
    ...walletState,
    resetWallet,
  };
}