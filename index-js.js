import {createWalletClient,custom ,createPublicClient , parseEther ,defineChain,formatEther} from "https://esm.sh/viem";
import { contractAddress ,abi } from "./constants-js.js"; 

const connectButton = document.getElementById("connectButton");// Button to connect wallet
const fundButton = document.getElementById("fundButton");// Button to fund coffe
const ethAmountInput = document.getElementById("ethAmount");// Input field for ETH amount
const balanceButton = document.getElementById("balanceButton");// Button to check balance
const withdrawButton = document.getElementById("withdrawButton");// Button to withdraw funds

let walletClient;
let publicClient;
   
async function connect() {
  if (typeof window.ethereum !== "undefined") {// Check if MetaMask is installed
    walletClient=createWalletClient({// Create a wallet client
        transport: custom(window.ethereum)// Use MetaMask as the transport
  });
   const[address] = await walletClient.requestAddresses();//
   console.log("Connected address:", address);// Log the connected address
    connectButton.innerHTML="Connected";//
} else {
    connectButton.innerHTML="MetaMask is not installed please install it";
}
}

async function fund() {
 const ethAmount = ethAmountInput.value;// Get the ETH amount from the input field
console.log(`Funding with ${ethAmount} ETH`);// Log the funding amount

  if (typeof window.ethereum !== "undefined") {// Check if MetaMask is installed
    walletClient=createWalletClient({// Create a wallet client
        transport: custom(window.ethereum)// Use MetaMask as the transport
  });
   const[conectedAccount] = await walletClient.requestAddresses();//
  const currentChain = await getCurrentChain(walletClient);// Get the current chain
  
  publicClient=createPublicClient({// this is so that we can simulate before we send to the client dress 
    transport: custom(window.ethereum),// Use MetaMask as the transport
   })
   const {request}= await publicClient.simulateContract({// Simulate the contract call
      address:contractAddress,
      abi:abi,
      functionName:"fund",
      account: conectedAccount,
      chain:currentChain,
      value:parseEther(ethAmount),// Convert the ETH amount to wei
   }); 
   
   const hash =await walletClient.writeContract(request);// Write the contract call to the blockchain
   console.log(hash);
  } else {
    connectButton.innerHTML="MetaMask is not installed please install it";
}
}
async function withdraw() {
console.log(`Widthdrawing Funds...`);//

  if (typeof window.ethereum !== "undefined") {// Check if MetaMask is installed
    walletClient=createWalletClient({// Create a wallet client
        transport: custom(window.ethereum)// Use MetaMask as the transport
  });
   const[conectedAccount] = await walletClient.requestAddresses();//
  const currentChain = await getCurrentChain(walletClient);// Get the current chain
  
  publicClient=createPublicClient({// this is so that we can simulate before we send to the client dress 
    transport: custom(window.ethereum),// Use MetaMask as the transport
   })
   const {request}= await publicClient.simulateContract({// Simulate the contract call
      address:contractAddress,
      abi:abi,
      functionName:"withdraw",
      account: conectedAccount,
      chain:currentChain,
      
   }); 
   
   const hash =await walletClient.writeContract(request);// Write the contract call to the blockchain
   console.log("Widthdrawl transaction hash:",hash);
  } else {
    connectButton.innerHTML="MetaMask is not installed please install it";
}
}

async function getCurrentChain(client) {
  const chainId = await client.getChainId()
  const currentChain = defineChain({
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
  })
  return currentChain
}

 async function getbalance() {
   if (typeof window.ethereum !== "undefined") {// Check if MetaMask is installed
   publicClient=createPublicClient({// Create a wallet client
       transport: custom(window.ethereum)// Use MetaMask as the transport
 });
 const balance = await publicClient.getBalance({// Get the balance of the connected account
   address: contractAddress,// Use the contract address to get the balance
 })
 console.log(formatEther(balance));// Log the balance in Ether
}
}
connectButton.onclick = connect
fundButton.onclick = fund 
balanceButton.onclick = getbalance
withdrawButton.onclick = withdraw

