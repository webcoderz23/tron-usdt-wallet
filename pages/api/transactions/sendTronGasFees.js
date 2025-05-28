// API endpoint to send TRX gas fees to a user's wallet
const TronWeb = require('tronweb');

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
    const PRIVATE_KEY = process.env.ADMIN_TRON_PRIVATE_KEY || "your_default_private_key_for_development";
    const API_KEY = process.env.TRONGRID_API_KEY || ""; // Optional for higher rate limits

    if (!PRIVATE_KEY) {
      return res.status(500).json({ 
        success: false, 
        message: 'Server configuration error: Admin private key not set' 
      });
    }

    // Initialize TronWeb
    const tronWeb = new TronWeb({
      fullHost: 'https://api.trongrid.io',
      headers: { "TRON-PRO-API-KEY": API_KEY },
      privateKey: PRIVATE_KEY
    });

    // Check if userAddress is valid
    if (!tronWeb.isAddress(userAddress)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid TRON address format' 
      });
    }

    // Send TRX transaction
    const tx = await tronWeb.trx.sendTransaction(
      userAddress,
      parseInt(amount) // amount in SUN
    );

    // Check transaction result
    if (!tx.result) {
      throw new Error('Transaction failed: ' + JSON.stringify(tx));
    }

    return res.status(200).json({
      success: true,
      hash: tx.txid
    });
  } catch (error) {
    console.error('Error sending TRX gas fees:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send TRX gas fees',
      error: error.message
    });
  }
} 