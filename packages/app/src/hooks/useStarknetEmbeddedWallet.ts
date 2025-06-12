"use client";

import { useEffect, useState } from "react";
import { Account, stark, ec, RpcProvider, hash, CallData } from "starknet";

interface StarknetWalletState {
  privateKey: string | null;
  publicKey: string | null;
  accountAddress: string | null;
  isReady: boolean;
  account: Account | null;
}

const STARKNET_STORAGE_KEY = "horse-race-starknet-wallet";

// OpenZeppelin account class hash for Sepolia testnet
const OZ_ACCOUNT_CLASS_HASH = "0x061dac032f228abef9c6626f995015233097ae253a7f72d68552db02f2971b8f";

export function useStarknetEmbeddedWallet() {
  const [walletState, setWalletState] = useState<StarknetWalletState>({
    privateKey: null,
    publicKey: null,
    accountAddress: null,
    isReady: false,
    account: null,
  });

  useEffect(() => {
    const storedWallet = localStorage.getItem(STARKNET_STORAGE_KEY);
    if (storedWallet) {
      try {
        const { privateKey } = JSON.parse(storedWallet);
        const publicKey = ec.starkCurve.getStarkKey(privateKey);
        
        // Calculate account address
        const accountAddress = calculateAccountAddress(publicKey);
        
        // Create provider - using Sepolia testnet
        const provider = new RpcProvider({
          nodeUrl: "https://starknet-sepolia.public.blastapi.io/rpc/v0_8"
        });
        
        const account = new Account(provider, accountAddress, privateKey);

        setWalletState({
          privateKey,
          publicKey,
          accountAddress,
          isReady: true,
          account,
        });
      } catch (error) {
        console.error("Failed to restore Starknet wallet:", error);
        createNewWallet();
      }
    } else {
      createNewWallet();
    }
  }, []);

  const calculateAccountAddress = (publicKey: string): string => {
    // Calculate future address of the OpenZeppelin account
    const constructorCallData = CallData.compile({ publicKey });
    const contractAddress = hash.calculateContractAddressFromHash(
      publicKey,
      OZ_ACCOUNT_CLASS_HASH,
      constructorCallData,
      0
    );
    return contractAddress;
  };

  const createNewWallet = () => {
    try {
      // Generate new private key
      const privateKey = stark.randomAddress();
      console.log("Generated private key:", privateKey);
      
      // Get public key from private key
      const publicKey = ec.starkCurve.getStarkKey(privateKey);
      console.log("Generated public key:", publicKey);
      
      // Calculate account address
      const accountAddress = calculateAccountAddress(publicKey);
      console.log("Pre-calculated account address:", accountAddress);

      // Store private key
      localStorage.setItem(
        STARKNET_STORAGE_KEY,
        JSON.stringify({ privateKey })
      );

      // Create provider
      const provider = new RpcProvider({
        nodeUrl: "https://starknet-sepolia.public.blastapi.io/rpc/v0_8"
      });
      
      const account = new Account(provider, accountAddress, privateKey);

      setWalletState({
        privateKey,
        publicKey,
        accountAddress,
        isReady: true,
        account,
      });
    } catch (error) {
      console.error("Failed to create Starknet wallet:", error);
      setWalletState(prev => ({ ...prev, isReady: true }));
    }
  };

  const deployAccount = async (): Promise<string | null> => {
    if (!walletState.account || !walletState.publicKey) {
      console.error("Account or public key not available");
      return null;
    }

    try {
      const constructorCallData = CallData.compile({ 
        publicKey: walletState.publicKey 
      });

      const deployAccountPayload = {
        classHash: OZ_ACCOUNT_CLASS_HASH,
        constructorCalldata: constructorCallData,
        addressSalt: walletState.publicKey,
      };

      const { transaction_hash, contract_address } = await walletState.account.deployAccount(
        deployAccountPayload
      );

      console.log("Account deployed:", contract_address);
      console.log("Transaction hash:", transaction_hash);

      // Wait for transaction confirmation
      await walletState.account.provider.waitForTransaction(transaction_hash);
      
      return transaction_hash;
    } catch (error) {
      console.error("Failed to deploy account:", error);
      return null;
    }
  };

  const resetWallet = () => {
    localStorage.removeItem(STARKNET_STORAGE_KEY);
    createNewWallet();
  };

  const fundAccount = async (amount: string = "0.001") => {
    if (!walletState.accountAddress) return;
    
    console.log(`Please fund your account address: ${walletState.accountAddress}`);
    console.log(`You can use a faucet: https://starknet-faucet.vercel.app/`);
    console.log(`Requested amount: ${amount} ETH`);
  };

  return {
    ...walletState,
    resetWallet,
    deployAccount,
    fundAccount,
  };
}