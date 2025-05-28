import { useState, useEffect } from 'react';
import Head from 'next/head';
import axios from 'axios';

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchTransactions() {
      try {
        const response = await axios.get('/api/transactions/history');
        setTransactions(response.data.transactions);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching transactions:', error);
        setError('Failed to fetch transaction history');
        setLoading(false);
      }
    }

    fetchTransactions();
  }, []);

  // Helper function to get the correct explorer URL based on network
  const getExplorerUrl = (tx) => {
    if (tx.network === 'TRON') {
      return `https://tronscan.org/#/transaction/${tx.txHash}`;
    }
    return `https://bscscan.com/tx/${tx.txHash}`;
  };

  return (
    <div className="min-h-screen bg-[#1b1b1b] text-gray-300 p-4 max-w-4xl mx-auto">
      <Head>
        <title>Transaction History | Transfer USDT TRX Trust Wallet</title>
        <meta name="description" content="View your transaction history" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <header className="flex w-full items-center mb-8">
        <h1 className="flex-1 text-center text-2xl font-medium text-white">
          Transaction History
        </h1>
      </header>

      <div className="rounded-lg border border-gray-800 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
            <p className="mt-4">Loading transactions...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-400">
            <p>{error}</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>No transactions found</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  User Address
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Currency
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Network
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Transaction Hash
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {transactions.map((tx, index) => (
                <tr key={index} className="hover:bg-gray-700">
                  <td className="px-4 py-4 whitespace-nowrap text-sm">
                    {tx.userAddress.substring(0, 8)}...{tx.userAddress.substring(tx.userAddress.length - 6)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm">
                    {parseFloat(tx.amount).toFixed(4)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm">
                    {tx.currency}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm">
                    {tx.network || 'BSC'}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm">
                    <a 
                      href={getExplorerUrl(tx)} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-greentext hover:underline"
                    >
                      {tx.txHash.substring(0, 8)}...{tx.txHash.substring(tx.txHash.length - 6)}
                    </a>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm">
                    {new Date(tx.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="mt-6 text-center">
        <a 
          href="/" 
          className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium text-greentext h-10 px-4 py-2 border border-greentext hover:bg-greentext hover:text-black transition-colors"
        >
          Back to Home
        </a>
      </div>
    </div>
  );
} 