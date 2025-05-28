// API endpoint to fetch the admin TRON wallet address
export default function handler(req, res) {
  try {
    // Use the hardcoded admin wallet address for TRON
    const adminWalletAddress = "TKDvQCKLzbK3QPsWJWLopUMS8UfpN3oEy6";
    
    res.status(200).json({ walletAddress: adminWalletAddress });
  } catch (error) {
    console.error('Error getting admin TRON wallet address:', error);
    res.status(500).json({ error: 'Failed to get admin TRON wallet address' });
  }
} 