
import { Contract, RpcProvider } from "starknet";

const SEPOLIA_RPC_URL = "https://starknet-sepolia.public.blastapi.io/rpc/v0_8";
// STRK token contract address on Starknet Mainnet
const STRK_TOKEN_ADDRESS =
  "0x04718f5a0Fc34cC1AF16A1cdee98fFB20C31f5cD61D6Ab07201858f4287c938D";


// STRK token ABI - minimal for balanceOf function
const STRK_ABI = [
  {
    type: "function",
    name: "balanceOf",
    inputs: [{ name: "account", type: "felt" }],
    outputs: [{ name: "balance", type: "felt" }],
    stateMutability: "view",
  },
];






export async function getSTRKBalance(starknetAccountAddress: string) {
  if (
    starknetAccountAddress === null ||
    starknetAccountAddress === undefined ||
    typeof starknetAccountAddress === "boolean"
  ) {
    throw new Error("Invalid starknetAccountAddress: must be string, number, bigint, or object and not null/undefined/boolean");
  }

  const provider = new RpcProvider({
    nodeUrl: SEPOLIA_RPC_URL,
  });

  const strkContract = new Contract(STRK_ABI, STRK_TOKEN_ADDRESS, provider);
  try {
    const result = await strkContract.call("balanceOf", [starknetAccountAddress]);
    // The result is usually an array or a string, depending on the ABI and starknet.js version
    const balance =
      Array.isArray(result) ? result[0] : (typeof result === "object" && "balance" in result ? result.balance : result);
    console.log(`STRK Balance for ${starknetAccountAddress}:`, balance?.toString());
    return Number(balance); // Convert from wei to STRK 
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error fetching STRK balance:", error.message);
    } else {
      console.error("Error fetching STRK balance:", error);
    }
  }
}
