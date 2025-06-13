import { Contract, Provider, RpcProvider } from "starknet";
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

// Your wallet address (Starknet account)
const WALLET_ADDRESS =
  "0x04c3aaa63a76D6764844123710CAb79Ea187566872920e30e2dF36d4d7E70888";

export async function getSTRKBalance() {
  const provider = new RpcProvider({
    nodeUrl: SEPOLIA_RPC_URL,
  });

  console.log({ provider });
  const strkContract = new Contract(STRK_ABI, STRK_TOKEN_ADDRESS, provider);
  console.log({ strkContract });
  try {
    const balance = await strkContract.call("balanceOf", [WALLET_ADDRESS]);
    console.log(`STRK Balance for ${WALLET_ADDRESS}:`, balance?.balance?.toString());
    return Number(balance?.balance); // Convert from wei to STRK 
  } catch (error) {
    console.error("Error fetching STRK balance:", error.message);
  }
}
