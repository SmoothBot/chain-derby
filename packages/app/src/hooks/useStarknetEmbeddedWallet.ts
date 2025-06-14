/* eslint-disable react-hooks/exhaustive-deps */
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
  isDeployedMainnet: boolean; // New state to track mainnet deployment
  accountMainnet: Account | null; // New state for mainnet account
}

const STARKNET_STORAGE_KEY = "horse-race-starknet-wallet";

const OZ_ACCOUNT_CLASS_HASH =
  "0x061dac032f228abef9c6626f995015233097ae253a7f72d68552db02f2971b8f";

const SEPOLIA_PROVIDER = new RpcProvider({
  nodeUrl: "https://starknet-sepolia.public.blastapi.io/rpc/v0_8",
});

const MAINNET_PROVIDER = new RpcProvider({
  nodeUrl: "https://starknet-mainnet.public.blastapi.io/rpc/v0_8",
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
    isDeployedMainnet: false,
    account: null,
    accountMainnet: null,
  });

  useEffect(() => {
    const initWallet = async () => {
      const storedWallet = localStorage.getItem(STARKNET_STORAGE_KEY);
      if (storedWallet) {
        try {
          const { privateKey } = JSON.parse(storedWallet);
          const publicKey = ec.starkCurve.getStarkKey(privateKey);
          const accountAddress = calculateAccountAddress(publicKey);

          const accountSepolia = new Account(SEPOLIA_PROVIDER, accountAddress, privateKey);
          const accountMainnet = new Account(MAINNET_PROVIDER, accountAddress, privateKey);

          // Check if deployed
          const isDeployedSepolia = await checkIfDeployed(SEPOLIA_PROVIDER, accountAddress);
          const isDeployedMainnet = await checkIfDeployed(MAINNET_PROVIDER, accountAddress);

          setWalletState({
            privateKey,
            publicKey,
            accountAddress,
            isReady: true,
            isDeployed: isDeployedSepolia,
            isDeployedMainnet,
            account: accountSepolia,
            accountMainnet: isDeployedMainnet ? accountMainnet : null,
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

  const checkIfDeployed = async (provider: RpcProvider, address: string): Promise<boolean> => {
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
        JSON.stringify({ privateKey, accountAddress, publicKey })
      );

      const accountSepolia = new Account(SEPOLIA_PROVIDER, accountAddress, privateKey);
      const accountMainnet = new Account(MAINNET_PROVIDER, accountAddress, privateKey);

      setWalletState({
        privateKey,
        publicKey,
        accountAddress,
        isReady: true,
        isDeployed: false,
        isDeployedMainnet: false,
        account: accountSepolia,
        accountMainnet: accountMainnet,
      });

      // Fund account with testnet ETH (needed for deploy gas)
      await fundAccount(accountAddress);

      // Wait for funding to complete before deploying
      setTimeout(() => {
        console.log("⏳ Waiting for funding to complete...");
      }, 10000);

      // Deploy the account contract
      await deployAccount(accountSepolia,accountMainnet, publicKey);

      // Update deployment state after deployment confirmed
      setWalletState((prev) => ({
        ...prev,
        isDeployed: true,
      }));

      console.log("🔐 New Starknet Wallet Created:");
    } catch (error) {
      console.error("Failed to create Starknet wallet:", error);
      setWalletState((prev) => ({ ...prev, isReady: true }));
    }
  };

 const fundAccount = async (newAccountAddress: string): Promise<void> => {
  const amountInWei = uint256.bnToUint256(BigInt(1e17)); // 0.1 ETH
  const transferCall = {
    contractAddress: "0x04718f5a0Fc34cC1AF16A1cdee98fFB20C31f5cD61D6Ab07201858f4287c938D", // STRK contract Sepolia
    entrypoint: "transfer",
    calldata: CallData.compile({
      recipient: newAccountAddress,
      amount: amountInWei,
    }),
  };

  const faucetAccountSepolia = new Account(SEPOLIA_PROVIDER, FAUCET_ADDRESS, FAUCET_PRIVATE_KEY);
  const faucetAccountMainnet = new Account(MAINNET_PROVIDER, FAUCET_ADDRESS, FAUCET_PRIVATE_KEY);

  console.log("💰 Funding new account:", newAccountAddress);

  // Fund Sepolia
  try {
    console.log("💸 Sending 0.1 ETH on Sepolia...");
    const { transaction_hash } = await faucetAccountSepolia.execute(transferCall);
    console.log("💸 Sepolia tx hash:", transaction_hash);
    await SEPOLIA_PROVIDER.waitForTransaction(transaction_hash);
    console.log("✅ Sepolia funding confirmed");
  } catch (error) {
    console.error("❌ Sepolia funding failed:", error);
  }

  // Fund Mainnet
  try {
    console.log("💸 Sending 0.1 ETH on Mainnet...");
    const { transaction_hash } = await faucetAccountMainnet.execute(transferCall);
    console.log("💸 Mainnet tx hash:", transaction_hash);
    await MAINNET_PROVIDER.waitForTransaction(transaction_hash);
    console.log("✅ Mainnet funding confirmed");
  } catch (error) {
    console.error("❌ Mainnet funding failed:", error);
  }
};


 const deployAccount = async (
  account: Account,
  accountMainnet: Account,
  publicKey: string
): Promise<void> => {
  const constructorCallData = CallData.compile({ publicKey });
  const deployPayload = {
    classHash: OZ_ACCOUNT_CLASS_HASH,
    constructorCalldata: constructorCallData,
    addressSalt: BigInt(publicKey),
  };

  // Deploy Sepolia
  try {
    console.log("🚀 Deploying account on Sepolia...");
    const { transaction_hash, contract_address } = await account.deployAccount(deployPayload);
    console.log("🚀 Sepolia deployment tx hash:", transaction_hash);
    console.log("📬 Sepolia Contract deployed at:", contract_address);
    await SEPOLIA_PROVIDER.waitForTransaction(transaction_hash);
    console.log("✅ Sepolia deployment confirmed");
  } catch (error) {
    console.error("❌ Sepolia deployment failed:", error);
  }

  // Deploy Mainnet
  try {
    console.log("🚀 Deploying account on Mainnet...");
    const { transaction_hash: mainnetTxn, contract_address: mainnetAddress } =
      await accountMainnet.deployAccount(deployPayload);
    console.log("🚀 Mainnet deployment tx hash:", mainnetTxn);
    console.log("📬 Mainnet Contract deployed at:", mainnetAddress);
    await MAINNET_PROVIDER.waitForTransaction(mainnetTxn);
    console.log("✅ Mainnet deployment confirmed");
  } catch (error) {
    console.error("❌ Mainnet deployment failed:", error);
  }
};



  const resetWallet = () => {
    localStorage.removeItem(STARKNET_STORAGE_KEY);
    createNewWallet();
  };

  return {
    ...walletState,
    SEPOLIA_PROVIDER,
    MAINNET_PROVIDER,
    resetWallet,
    createNewWallet
  };
}
