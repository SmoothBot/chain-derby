"use client";

import { useEffect, useState } from "react";
import {
  Account,
  stark,
  ec,
  RpcProvider,
  hash,
  CallData,
} from "starknet";

interface StarknetWalletState {
  privateKey: string | null;
  publicKey: string | null;
  accountAddress: string | null;
  isReady: boolean;
  account: Account | null;
}

const STARKNET_STORAGE_KEY = "horse-race-starknet-wallet";

// ✅ Latest OpenZeppelin account class hash (v0.8.1) for Sepolia
const OZ_ACCOUNT_CLASS_HASH =
  "0x061dac032f228abef9c6626f995015233097ae253a7f72d68552db02f2971b8f";

// ✅ Sepolia testnet RPC provider
const provider = new RpcProvider({
  nodeUrl: "https://starknet-sepolia.public.blastapi.io/rpc/v0_8",
});

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
        const accountAddress = calculateAccountAddress(publicKey);

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
    const constructorCallData = CallData.compile({ publicKey });

    const rawAddress = hash.calculateContractAddressFromHash(
      BigInt(publicKey), // ✅ ensure this is a bigint
      OZ_ACCOUNT_CLASS_HASH,
      constructorCallData,
      0n // deployer address is 0n
    );

    // ✅ Pad the address to 66 characters (0x + 64 hex digits)
    return `0x${rawAddress.replace(/^0x/, "").padStart(64, "0")}`;
  };

  const createNewWallet = () => {
    try {
      const privateKey = stark.randomAddress();
      const publicKey = ec.starkCurve.getStarkKey(privateKey);
      const accountAddress = calculateAccountAddress(publicKey);

      localStorage.setItem(
        STARKNET_STORAGE_KEY,
        JSON.stringify({ privateKey })
      );

      const account = new Account(provider, accountAddress, privateKey);

      setWalletState({
        privateKey,
        publicKey,
        accountAddress,
        isReady: true,
        account,
      });

      console.log("🔐 New Starknet Wallet Created:");
      console.log("Private Key:", privateKey);
      console.log("Public Key:", publicKey);
      console.log("Precomputed Account Address:", accountAddress);
    } catch (error) {
      console.error("Failed to create Starknet wallet:", error);
      setWalletState((prev) => ({ ...prev, isReady: true }));
    }
  };

  const deployAccount = async (): Promise<string | null> => {
    const { account, publicKey } = walletState;
    if (!account || !publicKey) {
      console.error("Account or public key not available");
      return null;
    }

    try {
      const constructorCallData = CallData.compile({ publicKey });

      const deployAccountPayload = {
        classHash: OZ_ACCOUNT_CLASS_HASH,
        constructorCalldata: constructorCallData,
        addressSalt: BigInt(publicKey), // ✅ must be BigInt
      };

      const { transaction_hash, contract_address } =
        await account.deployAccount(deployAccountPayload);

      console.log("🚀 Deployment tx hash:", transaction_hash);
      console.log("📬 Contract deployed at:", contract_address);

      await provider.waitForTransaction(transaction_hash);
      console.log("✅ Account deployment confirmed");

      return transaction_hash;
    } catch (error) {
      console.error("❌ Failed to deploy account:", error);
      return null;
    }
  };

  const resetWallet = () => {
    localStorage.removeItem(STARKNET_STORAGE_KEY);
    createNewWallet();
  };

  const fundAccount = async (amount: string = "0.001") => {
    if (!walletState.accountAddress) return;

    console.log(`💧 Fund your account at: ${walletState.accountAddress}`);
    console.log(`Use Sepolia faucet: https://starknet-faucet.vercel.app/`);
    console.log(`Suggested amount: ${amount} ETH`);
  };

  return {
    ...walletState,
    resetWallet,
    deployAccount,
    fundAccount,
  };
}
