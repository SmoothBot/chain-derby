"use client";

import { useEffect, useState } from "react";
import { Provider, Wallet, WalletUnlocked } from "fuels";
// import { fuelTestnet } from "@/fuel/config";

interface FuelWalletState {
  secret: string | null;           // private key
  address: string | null;
  wallet: WalletUnlocked | null;
  isReady: boolean;
}

const FUEL_STORAGE_KEY = "horse-race-fuel-wallet";

export function useFuelEmbeddedWallet() {
  const [walletState, setWalletState] = useState<FuelWalletState>({
    secret: null,
    address: null,
    wallet: null,
    isReady: false,
  });

  // Initialize the wallet on component mount
  useEffect(() => {
    // Check if we already have a wallet in localStorage
    const storedWallet = localStorage.getItem(FUEL_STORAGE_KEY);
    
    if (storedWallet) {
      try {
        const { secret } = JSON.parse(storedWallet);
        // const provider = new Provider(fuelTestnet.rpcUrls.public.http[0]);
        const wallet = Wallet.fromPrivateKey(secret);
        
        setWalletState({
          secret,
          address: wallet.address.toB256(),
          wallet,
          isReady: true,
        });
      } catch (error) {
        console.error("Failed to restore Fuel wallet from localStorage:", error);
        createNewWallet();
      }
    } else {
      createNewWallet();
    }
  }, []);

  // Create a new wallet and store it in localStorage
  const createNewWallet = () => {
    try {
    //   const provider = new Provider(fuelTestnet.rpcUrls.public.http[0]);
      const wallet = Wallet.generate();
      const secret = wallet.privateKey;
    //   const wallet = Wallet.fromPrivateKey(secret, provider);
      // Store in localStorage
      localStorage.setItem(
        FUEL_STORAGE_KEY,
        JSON.stringify({ secret })
      );
      
      setWalletState({
        secret,
        address: wallet.address.toB256(),
        wallet,
        isReady: true,
      });
    } catch (error) {
      console.error("Failed to create Fuel wallet:", error);
      setWalletState(prev => ({ ...prev, isReady: true }));
    }
  };

  // Clear the wallet from localStorage
  const resetWallet = () => {
    localStorage.removeItem(FUEL_STORAGE_KEY);
    createNewWallet();
  };

  return {
    ...walletState,
    resetWallet,
  };
}
