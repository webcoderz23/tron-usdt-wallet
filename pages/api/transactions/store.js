// API endpoint to store transaction data
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { userAddress, amount, txHash, currency, network = 'BSC' } = req.body;

    if (!userAddress || !amount || !txHash || !currency) {
      return res.status(400).json({ success: false, message: 'Missing required parameters' });
    }

    const transaction = {
      userAddress,
      amount,
      txHash,
      currency,
      network,
      timestamp: new Date().toISOString()
    };

    // In a production environment, this would store data in a database
    // For this example, we'll store it in a JSON file
    const dataDir = path.join(process.cwd(), 'data');
    const filePath = path.join(dataDir, 'transactions.json');

    // Create directory if it doesn't exist
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Read existing transactions or create empty array
    let transactions = [];
    if (fs.existsSync(filePath)) {
      const fileData = fs.readFileSync(filePath, 'utf8');
      transactions = JSON.parse(fileData);
    }

    // Add new transaction
    transactions.push(transaction);

    // Write back to file
    fs.writeFileSync(filePath, JSON.stringify(transactions, null, 2));

    return res.status(200).json({
      success: true,
      message: 'Transaction stored successfully'
    });
  } catch (error) {
    console.error('Error storing transaction:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to store transaction',
      error: error.message
    });
  }
} 