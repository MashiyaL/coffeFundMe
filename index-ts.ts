import { 
  createWalletClient, 
  custom, 
  createPublicClient, 
  parseEther, 
  defineChain, 
  formatEther, 
  WalletClient, 
  PublicClient, 
  Chain,
  Address 
} from "viem";

import "viem/window"
import { contractAddress, abi } from "./constants-ts.ts"; 

// DOM Elements
const connectButton = document.getElementById("connectButton") as HTMLButtonElement;
const fundButton = document.getElementById("fundButton") as HTMLButtonElement;
const ethAmountInput = document.getElementById("ethAmount") as HTMLInputElement;
const balanceButton = document.getElementById("balanceButton") as HTMLButtonElement;
const withdrawButton = document.getElementById("withdrawButton") as HTMLButtonElement;
console.log("WE working");
// Client instances
let walletClient: WalletClient | undefined;
let publicClient: PublicClient;

async function connect(): Promise<void> {
  if (typeof window.ethereum !== "undefined") {
    walletClient = createWalletClient({
      transport: custom(window.ethereum as any)
    });
    
    const [address]: Address[] = await walletClient.requestAddresses();
    console.log("Connected address:", address);
    
    if (connectButton) {
      connectButton.textContent = "Connected";
    }
  } else {
    if (connectButton) {
      connectButton.textContent = "MetaMask is not installed. Please install it";
    }
  }
}

async function fund(): Promise<void> {
  if (!ethAmountInput) {
    console.error("ETH amount input not found");
    return;
  }

  const ethAmount: string = ethAmountInput.value;
  console.log(`Funding with ${ethAmount} ETH`);

  if (typeof window.ethereum !== "undefined") {
    if (!walletClient) {
      walletClient = createWalletClient({
        transport: custom(window.ethereum as any)
      });
    }

    const [connectedAccount]: Address[] = await walletClient.requestAddresses();
    const currentChain: Chain = await getCurrentChain(walletClient);

    publicClient = createPublicClient({
      transport: custom(window.ethereum as any)
    });

    try {
      const { request } = await publicClient.simulateContract({
        address: contractAddress as Address,
        abi: abi,
        functionName: "fund",
        account: connectedAccount,
        chain: currentChain,
        value: parseEther(ethAmount)
      });

      const hash: `0x${string}` = await walletClient.writeContract(request);
      console.log("Funding transaction hash:", hash);
    } catch (error) {
      console.error("Funding failed:", error);
    }
  } else {
    if (connectButton) {
      connectButton.textContent = "MetaMask is not installed. Please install it";
    }
  }
}

async function withdraw(): Promise<void> {
  console.log(`Withdrawing Funds...`);

  if (typeof window.ethereum !== "undefined") {
    if (!walletClient) {
      walletClient = createWalletClient({
        transport: custom(window.ethereum as any)
      });
    }

    const [connectedAccount]: Address[] = await walletClient.requestAddresses();
    const currentChain: Chain = await getCurrentChain(walletClient);

    publicClient = createPublicClient({
      transport: custom(window.ethereum as any)
    });

    try {
      const { request } = await publicClient.simulateContract({
        address: contractAddress as Address,
        abi: abi,
        functionName: "withdraw",
        account: connectedAccount,
        chain: currentChain
      });

      const hash: `0x${string}` = await walletClient.writeContract(request);
      console.log("Withdrawal transaction hash:", hash);
    } catch (error) {
      console.error("Withdrawal failed:", error);
    }
  } else {
    if (connectButton) {
      connectButton.textContent = "MetaMask is not installed. Please install it";
    }
  }
}

async function getCurrentChain(client: WalletClient): Promise<Chain> {
  const chainId: number = await client.getChainId();
  const currentChain: Chain = defineChain({
    id: chainId,
    name: "Custom Chain",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      default: {
        http: ["http://localhost:8545"],
      },
    },
  });
  return currentChain;
}

export async function getBalance(): Promise<void> {
  if (typeof window.ethereum !== "undefined") {
    try {
      publicClient = createPublicClient({
        transport: custom(window.ethereum),
      })
      const balance = await publicClient.getBalance({
        address: contractAddress,
      })
      console.log(formatEther(balance))
    } catch (error) {
      console.error(error)
    }
  } else {
    balanceButton.innerHTML = "Please install MetaMask"
  }
}

// Event listeners
if (connectButton) {
  connectButton.addEventListener("click", connect);
}

if (fundButton) {
  fundButton.addEventListener("click", fund);
}

if (balanceButton) {
  balanceButton.addEventListener("click", getBalance);
}

if (withdrawButton) {
  withdrawButton.addEventListener("click", withdraw);
}

