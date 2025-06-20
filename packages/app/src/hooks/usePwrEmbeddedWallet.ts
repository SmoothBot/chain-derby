"use client";

import { useState, useEffect } from "react";
import Wallet from '@pwrjs/core/wallet';

export function usePwrEmbeddedWallet() {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [address, setAddress] = useState<string>("");
  const [seedPhrase, setSeedPhrase] = useState<string>("");
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initializeWallet = () => {
      try {
        // Check if we have a saved seed phrase in localStorage
        const savedSeedPhrase = localStorage.getItem('pwr-seed-phrase');
        
        let pwrSeedPhrase: string;
        if (savedSeedPhrase) {
          pwrSeedPhrase = savedSeedPhrase;
        } else {
          // Generate a new seed phrase (you might want to use a proper BIP39 library)
          // For now, using the example seed phrase from your code
          const newWallet = Wallet.newRandom(12);
          pwrSeedPhrase = newWallet.getSeedPhrase() || "";
          localStorage.setItem('pwr-seed-phrase', pwrSeedPhrase);
        }

        const pwrWallet = Wallet.fromSeedPhrase(pwrSeedPhrase);
        const walletAddress = pwrWallet.getAddress();

        setWallet(pwrWallet);
        setAddress(walletAddress);
        setSeedPhrase(pwrSeedPhrase);
        setIsReady(true);

        console.log('PWR Wallet initialized:', walletAddress);
      } catch (error) {
        console.error('Failed to initialize PWR wallet:', error);
        setIsReady(false);
      }
    };

    initializeWallet();
  }, []);

  const resetWallet = () => {
    localStorage.removeItem('pwr-seed-phrase');
    setWallet(null);
    setAddress("");
    setSeedPhrase("");
    setIsReady(false);
  };

  return {
    wallet,
    address,
    seedPhrase,
    isReady,
    resetWallet,
  };
} 