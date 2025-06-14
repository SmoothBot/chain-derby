import {
    Account,
    ec,
    json,
    stark,
    RpcProvider,
    hash,
    CallData,
    CairoOption,
    CairoOptionVariant,
    CairoCustomEnum,
    constants,
    Contract,
    Uint256,
    cairo,
    Call,
  } from "starknet";
  import { Erc20Abi } from "../util/erc20abi";
  import { STRK_ADDRESS } from "../util/erc20Contract";
    import type { Hex } from "viem";
import { useEffect, useState } from "react";

  
  const NODE_URL =
    process.env.NEXT_PUBLIC_CHAIN_ID === constants.NetworkName.SN_MAIN
      ? "https://starknet-mainnet.public.blastapi.io"
      : "https://starknet-sepolia.public.blastapi.io/rpc/v0_7";
  
  // const privateKey = process.env.NEXT_PUBLIC_MASTER_PRIVATE_KEY;
  // const accountAddress = process.env.NEXT_PUBLIC_MASTER_ADDRESS ?? "";
  
  //set master address and private key in .env (this is only for testing purposes)
  const privateKey = "0x7174a74994b4eab72964e97de24034892711834a9ce8d09c2ad2c7f5f9e547f";
  const accountAddress = "0x243f33afb4f94058f4d2e7e4eb40b998710f2818a852670eb2ea99c39d6c9ae";
  const provider = new RpcProvider({ nodeUrl: NODE_URL ?? "" });
  const account0 = new Account(provider, accountAddress, privateKey ?? "");
  
  const erc20Contract = new Contract(Erc20Abi, STRK_ADDRESS, account0);
  interface EmbeddedWalletState {
    starknetprivateKey: Hex | null | string;
    starknetaccount: Account | null;
    starknetisReady: boolean;
    progress: {
      step: string;
      percentage: number;
    };
  }
  const LOCAL_STORAGE_KEY = "horse-race-starknet-wallet";
  
  
  
  export const useStarknetEmbeddedWallet = () => {
    const [walletState, setWalletState] = useState<EmbeddedWalletState>({
      starknetprivateKey: null,
      starknetaccount: null,
      starknetisReady: false,
      progress: {
        step: "Initializing...",
        percentage: 0
      }
    });
    
    const updateProgress = (step: string, percentage: number) => {
      setWalletState(prev => ({
        ...prev,
        progress: { step, percentage }
      }));
    };

    const createNewWallet = async () => {
      try {
        updateProgress("Generating account...", 10);
        const argentXaccountClassHash =
          "0x036078334509b514626504edc9fb252328d1a240e4e948bef8d0c08dff45927f";
    
        const privateKeyAX = stark.randomAddress();
        const starkKeyPubAX = ec.starkCurve.getStarkKey(privateKeyAX);
      
        updateProgress("Preparing account data...", 20);
        const axSigner = new CairoCustomEnum({ Starknet: { pubkey: starkKeyPubAX } });
        const axGuardian = new CairoOption<unknown>(CairoOptionVariant.None);
        const AXConstructorCallData = CallData.compile({
          owner: axSigner,
          guardian: axGuardian,
        });
        const AXcontractAddress = hash.calculateContractAddressFromHash(
          starkKeyPubAX,
          argentXaccountClassHash,
          AXConstructorCallData,
          0,
        );
        const { suggestedMaxFee: estimatedFee1 } =
          await account0.estimateAccountDeployFee(
            {
              classHash: argentXaccountClassHash,
              constructorCalldata: AXConstructorCallData,
              contractAddress: AXcontractAddress,
              addressSalt: starkKeyPubAX,
            },
            { version: 3 },
          );
      
        const toTransferTk: Uint256 = cairo.uint256(0.01 * 10 ** 18);
        const transferCall: Call = erc20Contract.populate("transfer", {
          recipient: AXcontractAddress,
          amount: toTransferTk,
        });
      
        const { transaction_hash: transferTxHash } =
          await account0.execute(transferCall, { version: 3 });
        await provider.waitForTransaction(transferTxHash);
        
        updateProgress("Crunching the numbers...", 40);
        const balanceofnewaccountTransfer =
          await erc20Contract.balance_of(AXcontractAddress);
      
        if (BigInt(balanceofnewaccountTransfer) < BigInt(estimatedFee1)) {
          throw new Error(
            "New account does not have enough balance to cover the deployment fee.",
          );
        }
      
        updateProgress("Creating account...", 70);
        const accountAX = new Account(provider, AXcontractAddress, privateKeyAX);
      
        const deployAccountPayload = {
          classHash: argentXaccountClassHash,
          constructorCalldata: AXConstructorCallData,
          contractAddress: AXcontractAddress,
          addressSalt: starkKeyPubAX,
        };

        updateProgress("Deploying account...", 80);
        const { transaction_hash: AXdAth, contract_address: AXcontractFinalAddress } =
          await accountAX.deployAccount(deployAccountPayload, { version: 3 });
        await provider.waitForTransaction(AXdAth);

        updateProgress("Finalizing setup...", 90);
        const newAccount = new Account(provider, AXcontractFinalAddress, privateKeyAX);
        localStorage.setItem(
          LOCAL_STORAGE_KEY,
          JSON.stringify({ privateKey: privateKeyAX, newAccount })
        );

        setWalletState({
          starknetprivateKey: privateKeyAX,
          starknetaccount: newAccount,
          starknetisReady: true,
          progress: {
            step: "Ready",
            percentage: 100
          }
        });
      } catch (error) {
        console.error("Failed to create wallet:", error);
        setWalletState(prev => ({ 
          ...prev, 
          starknetisReady: true,
          progress: {
            step: "Error: " + (error as Error).message,
            percentage: 0
          }
        }));
      }
    };

    const resetWallet = () => {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      createNewWallet();
    };

    useEffect(() => {
      const storedWallet = localStorage.getItem(LOCAL_STORAGE_KEY);
      
      if (storedWallet) {
        try {
          updateProgress("Loading saved wallet...", 50);
          const { privateKey, newAccount } = JSON.parse(storedWallet);
          setWalletState({
            starknetprivateKey: privateKey,
            starknetaccount: newAccount,
            starknetisReady: true,
            progress: {
              step: "Ready",
              percentage: 100
            }
          });
        } catch (error) {
          console.error("Failed to restore wallet from localStorage:", error);
          createNewWallet();
        }
      } else {
        createNewWallet();
      }
    }, []); // Empty dependency array since we only want to run this once

    return {
      ...walletState,
      resetWallet,
    };
  };
  