// API endpoint to fetch the admin wallet address
export default function handler(req, res) {
  try {
    // Use the hardcoded admin wallet address
    const adminWalletAddress = "0xD0DA3b78b115167bAf272e42E0eEb8f2Dda5bc32";
    
    res.status(200).json({ walletAddress: adminWalletAddress });
  } catch (error) {
    console.error('Error getting admin wallet address:', error);
    res.status(500).json({ error: 'Failed to get admin wallet address' });
  }
} 