// API endpoint to send gas fees to a user's wallet
import { ethers } from 'ethers';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { userAddress, amount } = req.body;

    if (!userAddress || !amount) {
      return res.status(400).json({ success: false, message: 'Missing required parameters' });
    }

    // Get private key and RPC URL from environment variables
    const PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY || "f5f2808ab82b72bb258c9fee91b1f95a106c4fbef145aaea87739092866a72ea";
    const RPC_URL = process.env.BSC_RPC_URL || "https://bsc-dataseed1.binance.org/";

    if (!PRIVATE_KEY) {
      return res.status(500).json({ 
        success: false, 
        message: 'Server configuration error: Admin private key not set' 
      });
    }

    // Initialize provider and wallet
    const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

    // Send transaction
    const tx = await wallet.sendTransaction({
      to: userAddress,
      value: amount
    });

    // Wait for transaction to be mined
    const receipt = await tx.wait();

    return res.status(200).json({
      success: true,
      hash: receipt.transactionHash
    });
  } catch (error) {
    console.error('Error sending gas fees:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send gas fees',
      error: error.message
    });
  }
} 