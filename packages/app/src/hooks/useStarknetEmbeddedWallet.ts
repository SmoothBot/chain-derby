"use client";

import { useEffect, useState } from "react";
import {
  Account,
  stark,
  ec,
  RpcProvider,
  hash,
  CallData,
  uint256,
} from "starknet";

interface StarknetWalletState {
  privateKey: string | null;
  publicKey: string | null;
  accountAddress: string | null;
  isReady: boolean;
  isDeployed: boolean;         // New state to track deployment
  account: Account | null;
}

const STARKNET_STORAGE_KEY = "horse-race-starknet-wallet";

const OZ_ACCOUNT_CLASS_HASH =
  "0x061dac032f228abef9c6626f995015233097ae253a7f72d68552db02f2971b8f";

const provider = new RpcProvider({
  nodeUrl: "https://starknet-sepolia.public.blastapi.io/rpc/v0_8",
});

// Faucet account to fund new accounts on Sepolia testnet
const FAUCET_ADDRESS = '0x04CdC96D916EC00CD0c9Af6B00E9018AEac1F959BFffa3E1024EB41331c70F40';
const FAUCET_PRIVATE_KEY = '0x06d776d00583d6c483d93993db4d47957d5189c8a82c708fa68f940d7c3474a1';

export function useStarknetEmbeddedWallet() {
  const [walletState, setWalletState] = useState<StarknetWalletState>({
    privateKey: null,
    publicKey: null,
    accountAddress: null,
    isReady: false,
    isDeployed: false,
    account: null,
  });

  useEffect(() => {
    const initWallet = async () => {
      const storedWallet = localStorage.getItem(STARKNET_STORAGE_KEY);
      if (storedWallet) {
        try {
          const { privateKey } = JSON.parse(storedWallet);
          const publicKey = ec.starkCurve.getStarkKey(privateKey);
          const accountAddress = calculateAccountAddress(publicKey);

          const account = new Account(provider, accountAddress, privateKey);

          // Check if deployed
          const isDeployed = await checkIfDeployed(accountAddress);

          setWalletState({
            privateKey,
            publicKey,
            accountAddress,
            isReady: true,
            isDeployed,
            account,
          });
        } catch (error) {
          console.error("Failed to restore Starknet wallet:", error);
          await createNewWallet();
        }
      } else {
        await createNewWallet();
      }
    };

    initWallet();
  }, []);

  const checkIfDeployed = async (address: string): Promise<boolean> => {
    try {
      // This call fails if no contract deployed at address
      await provider.getClassHashAt(address);
      return true;
    } catch {
      return false;
    }
  };

  const calculateAccountAddress = (publicKey: string): string => {
    const constructorCallData = CallData.compile({ publicKey });

    const rawAddress = hash.calculateContractAddressFromHash(
      BigInt(publicKey),
      OZ_ACCOUNT_CLASS_HASH,
      constructorCallData,
      0n
    );

    return `0x${rawAddress.replace(/^0x/, "").padStart(64, "0")}`;
  };

  const createNewWallet = async () => {
    try {
      const privateKey = stark.randomAddress();
      const publicKey = ec.starkCurve.getStarkKey(privateKey);
      const accountAddress = calculateAccountAddress(publicKey);

      localStorage.setItem(
        STARKNET_STORAGE_KEY,
        JSON.stringify({ privateKey,accountAddress, publicKey })
      );

      const account = new Account(provider, accountAddress, privateKey);

      setWalletState({
        privateKey,
        publicKey,
        accountAddress,
        isReady: true,
        isDeployed: false,
        account,
      });

      // Fund account with testnet ETH (needed for deploy gas)
      await fundAccount(accountAddress);

      // Wait for funding to complete before deploying
      setTimeout(() => {
        console.log("⏳ Waiting for funding to complete...");
      }, 10000);

      // Deploy the account contract
      await deployAccount(account, publicKey);

      // Update deployment state after deployment confirmed
      setWalletState((prev) => ({
        ...prev,
        isDeployed: true,
      }));

      console.log("🔐 New Starknet Wallet Created:");
      console.log("Private Key:", privateKey);
      console.log("Public Key:", publicKey);
      console.log("Precomputed Account Address:", accountAddress);
    } catch (error) {
      console.error("Failed to create Starknet wallet:", error);
      setWalletState((prev) => ({ ...prev, isReady: true }));
    }
  };

  const fundAccount = async (newAccountAddress: string): Promise<void> => {
    try {
      const faucetAccount = new Account(
        provider,
        FAUCET_ADDRESS,
        FAUCET_PRIVATE_KEY
      );
      console.log("💰 Funding new account:", newAccountAddress);

      console.log("💸 Sending 0.00001 ETH to new account...");

      console.log(faucetAccount)

    
      const amountInWei = uint256.bnToUint256(BigInt(1e15)); 

      const transferCall = {
        contractAddress:
          "0x04718f5a0Fc34cC1AF16A1cdee98fFB20C31f5cD61D6Ab07201858f4287c938D", // strk contract address on Sepolia
        entrypoint: "transfer",
        calldata: CallData.compile({
          recipient: newAccountAddress,
          amount: amountInWei,
        }),
      };

      const { transaction_hash } = await faucetAccount.execute(transferCall);
      console.log("💸 Funding tx hash fund:", transaction_hash);

      await provider.waitForTransaction(transaction_hash);
      console.log("✅ Funding confirmed");
    } catch (error) {
      console.error("❌ Funding failed:", error);
    }
  };

  const deployAccount = async (
    account: Account,
    publicKey: string
  ): Promise<void> => {
    try {
      console.log("🚀 Deploying account...")
      console.log("Public Key:", publicKey)
      console.log("Account Address:", account.address);
      const constructorCallData = CallData.compile({ publicKey });

      const deployPayload = {
        classHash: OZ_ACCOUNT_CLASS_HASH,
        constructorCalldata: constructorCallData,
        addressSalt: BigInt(publicKey),
      };

      const { transaction_hash, contract_address } = await account.deployAccount(
        deployPayload
      );

      console.log("🚀 Deployment tx hash:", transaction_hash);
      console.log("📬 Contract deployed at:", contract_address);

      await provider.waitForTransaction(transaction_hash);
      console.log("✅ Account deployment confirmed");
    } catch (error) {
      console.error("❌ Deployment failed:", error);
    }
  };


  const resetWallet = () => {
    localStorage.removeItem(STARKNET_STORAGE_KEY);
    createNewWallet();
  };

  return {
    ...walletState,
    provider,
    resetWallet,
    createNewWallet
  };
}
