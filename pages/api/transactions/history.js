// API endpoint to fetch transaction history
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  try {
    // Get path to transactions.json file
    const dataDir = path.join(process.cwd(), 'data');
    const filePath = path.join(dataDir, 'transactions.json');
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(200).json({ 
        success: true, 
        transactions: [] 
      });
    }
    
    // Read transactions from file
    const fileData = fs.readFileSync(filePath, 'utf8');
    const transactions = JSON.parse(fileData);
    
    return res.status(200).json({
      success: true,
      transactions: transactions
    });
  } catch (error) {
    console.error('Error fetching transaction history:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch transaction history',
      error: error.message
    });
  }
} 