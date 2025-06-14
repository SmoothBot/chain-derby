/* eslint-disable @typescript-eslint/no-explicit-any */
import { Contract, RpcProvider } from "starknet";

const SEPOLIA_RPC_URL = "https://starknet-sepolia.public.blastapi.io/rpc/v0_8";
const MAINNET_RPC_URL = "https://starknet-mainnet.public.blastapi.io/rpc/v0_8";

const SEPOLIA_STRK_TOKEN_ADDRESS = "0x04718f5a0Fc34cC1AF16A1cdee98fFB20C31f5cD61D6Ab07201858f4287c938D"; // Example, update if different
const MAINNET_STRK_TOKEN_ADDRESS = "0x04718f5a0Fc34cC1AF16A1cdee98fFB20C31f5cD61D6Ab07201858f4287c938D"; // Mainnet STRK token

const STRK_ABI = [
  {
    type: "function",
    name: "balanceOf",
    inputs: [{ name: "account", type: "felt" }],
    outputs: [{ name: "balance", type: "felt" }],
    stateMutability: "view",
  },
];

export async function getSTRKBalance(starknetAccountAddress: string, chain: any): Promise<number | undefined> {
  if (
    starknetAccountAddress === null ||
    starknetAccountAddress === undefined ||
    typeof starknetAccountAddress === "boolean"
  ) {
    throw new Error("Invalid starknetAccountAddress: must be string, number, bigint, or object and not null/undefined/boolean");
  }
  console.log("Fetching STRK balance for:", chain, starknetAccountAddress);

  const isSepolia = chain?.name === "Starknet Sepolia Testnet";

  const rpcUrl = isSepolia ? SEPOLIA_RPC_URL : MAINNET_RPC_URL;
  const strkTokenAddress = isSepolia ? SEPOLIA_STRK_TOKEN_ADDRESS : MAINNET_STRK_TOKEN_ADDRESS;

  const provider = new RpcProvider({
    nodeUrl: rpcUrl,
  });

  const strkContract = new Contract(STRK_ABI, strkTokenAddress, provider);

  try {
    const result = await strkContract.call("balanceOf", [starknetAccountAddress]);
    const balance =
      Array.isArray(result)
        ? result[0]
        : typeof result === "object" && result !== null && "balance" in result
        ? result.balance
        : result;

    console.log(`STRK Balance for ${starknetAccountAddress}:`, balance?.toString());
    return Number(balance);
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error fetching STRK balance:", error.message);
    } else {
      console.error("Error fetching STRK balance:", error);
    }
  }
}
