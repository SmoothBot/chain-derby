import { Contract, Provider } from "starknet";

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
  },
];

// Your wallet address (Starknet account)
const WALLET_ADDRESS =
  "0x04c3aaa63a76D6764844123710CAb79Ea187566872920e30e2dF36d4d7E70888";

async function getSTRKBalance() {
  const provider = new Provider({
    nodeUrl: "Starknet Sepolia Testnet",
  });

  const strkContract = new Contract(STRK_ABI, STRK_TOKEN_ADDRESS, provider);

  try {
    const { balance } = await strkContract.balanceOf(WALLET_ADDRESS);
    console.log(`STRK Token Contract: ${STRK_TOKEN_ADDRESS}`);
    console.log(`Wallet Address: ${WALLET_ADDRESS}`);
    console.log(`STRK Balance: ${balance.toString()}`);
  } catch (error) {
    console.error("Error fetching STRK balance:", error.message);
  }
}

getSTRKBalance();
