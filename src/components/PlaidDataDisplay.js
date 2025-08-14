'use client';

import { useState, useEffect } from 'react';
import { getTokenClient } from '@/lib/client-token-store';
import { getPlaidData } from '@/lib/session-store';

/**
 * PlaidDataDisplay Component - Shows all raw Plaid data after connection
 */
export default function PlaidDataDisplay({ userId, connectionMetadata, isResultsPage = false }) {
  const [plaidData, setPlaidData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isResultsPage) {
      // Load from session storage for results page
      loadFromSession();
    } else if (userId && connectionMetadata) {
      // Fetch fresh data for direct usage
      fetchAllPlaidData();
    }
  }, [userId, connectionMetadata, isResultsPage]);

  const loadFromSession = () => {
    try {
      const sessionData = getPlaidData();
      if (sessionData && sessionData.data) {
        setPlaidData(sessionData.data);
      } else {
        setError('No Plaid data found in session');
      }
    } catch (err) {
      console.error('[PlaidDataDisplay] Error loading from session:', err);
      setError('Error loading stored data');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllPlaidData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const clientToken = getTokenClient(userId);
      console.log('[PlaidDataDisplay] Fetching all Plaid data for user:', userId);
      
      // Fetch accounts and transactions in parallel
      const [accountsResponse, transactionsResponse] = await Promise.all([
        fetch('/api/plaid/accounts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, clientToken }),
        }),
        fetch('/api/plaid/transactions', {
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, clientToken }),
        })
      ]);

      if (!accountsResponse.ok) {
        throw new Error('Failed to fetch accounts');
      }
      if (!transactionsResponse.ok) {
        throw new Error('Failed to fetch transactions');
      }

      const accountsData = await accountsResponse.json();
      const transactionsData = await transactionsResponse.json();

      setPlaidData({
        connectionMetadata,
        accounts: accountsData,
        transactions: transactionsData,
        fetchedAt: new Date().toISOString()
      });

    } catch (err) {
      console.error('[PlaidDataDisplay] Error fetching Plaid data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your Plaid data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-semibold">Error Loading Data</h3>
          <p className="text-red-700">{error}</p>
          <button 
            onClick={fetchAllPlaidData}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!plaidData) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <p className="text-gray-600">No data available</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Plaid Data</h1>
        <p className="text-gray-600">Complete information retrieved from your connected bank account</p>
        <p className="text-sm text-gray-500">Data fetched at: {formatDate(plaidData.fetchedAt)}</p>
      </div>

      {/* Connection Metadata */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-blue-900 mb-4">Connection Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-medium text-blue-800">Institution</h3>
            <p className="text-blue-700">{plaidData.connectionMetadata.institution?.name || 'N/A'}</p>
          </div>
          <div>
            <h3 className="font-medium text-blue-800">Account Selection</h3>
            <p className="text-blue-700">{plaidData.connectionMetadata.accounts?.length || 0} accounts selected</p>
          </div>
          <div>
            <h3 className="font-medium text-blue-800">Link Session ID</h3>
            <p className="text-blue-700 text-sm font-mono">{plaidData.connectionMetadata.link_session_id || 'N/A'}</p>
          </div>
          <div>
            <h3 className="font-medium text-blue-800">Item ID</h3>
            <p className="text-blue-700 text-sm font-mono">{plaidData.connectionMetadata.item_id || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Accounts Information */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-green-900 mb-4">
          Accounts ({plaidData.accounts.accounts?.length || 0})
        </h2>
        
        {plaidData.accounts.accounts && plaidData.accounts.accounts.length > 0 ? (
          <div className="space-y-4">
            {plaidData.accounts.accounts.map((account, index) => (
              <div key={account.account_id} className="bg-white rounded-lg border border-green-300 p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h3 className="font-medium text-gray-900">{account.name}</h3>
                    <p className="text-sm text-gray-600">{account.subtype} • {account.type}</p>
                    <p className="text-xs text-gray-500 font-mono">ID: {account.account_id}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800">Current Balance</h4>
                    <p className="text-lg font-semibold text-green-600">
                      {formatCurrency(account.balances.current)}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800">Available Balance</h4>
                    <p className="text-lg font-semibold text-gray-700">
                      {formatCurrency(account.balances.available || account.balances.current)}
                    </p>
                  </div>
                </div>
                
                {/* Additional balance info */}
                {account.balances.limit && (
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <span className="text-sm text-gray-600">
                      Credit Limit: {formatCurrency(account.balances.limit)}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-green-700">No accounts found</p>
        )}
      </div>

      {/* Transactions Information */}
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-orange-900 mb-4">
          Transactions ({plaidData.transactions.transactions?.length || 0})
        </h2>
        
        {plaidData.transactions.transactions && plaidData.transactions.transactions.length > 0 ? (
          <>
            <div className="mb-4 text-sm text-orange-700">
              Total transactions available: {plaidData.transactions.total_transactions}
            </div>
            
            <div className="bg-white rounded-lg border border-orange-300 max-h-96 overflow-y-auto">
              <table className="min-w-full">
                <thead className="bg-orange-100 sticky top-0">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-orange-900 uppercase">Date</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-orange-900 uppercase">Description</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-orange-900 uppercase">Amount</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-orange-900 uppercase">Category</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-orange-900 uppercase">Account</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {plaidData.transactions.transactions.slice(0, 100).map((transaction, index) => (
                    <tr key={transaction.transaction_id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(transaction.date)}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {transaction.name}
                      </td>
                      <td className={`px-4 py-2 whitespace-nowrap text-sm font-medium ${
                        transaction.amount > 0 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {transaction.amount > 0 ? '-' : '+'}{formatCurrency(Math.abs(transaction.amount))}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-600">
                        {transaction.category ? transaction.category.join(' > ') : 'Uncategorized'}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-500 font-mono">
                        {transaction.account_id.slice(-4)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {plaidData.transactions.transactions.length > 100 && (
                <div className="p-4 text-center text-sm text-gray-600 bg-gray-50">
                  Showing first 100 of {plaidData.transactions.transactions.length} transactions
                </div>
              )}
            </div>
          </>
        ) : (
          <p className="text-orange-700">No transactions found</p>
        )}
      </div>

      {/* Raw JSON Data */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Raw JSON Data</h2>
        <details className="cursor-pointer">
          <summary className="text-blue-600 hover:text-blue-800 font-medium">
            Click to view complete raw data
          </summary>
          <pre className="mt-4 bg-gray-800 text-green-400 p-4 rounded text-xs overflow-x-auto max-h-64 overflow-y-auto">
            {JSON.stringify(plaidData, null, 2)}
          </pre>
        </details>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        {!isResultsPage && (
          <button 
            onClick={fetchAllPlaidData}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh Data
          </button>
        )}
        <button 
          onClick={() => window.location.href = '/'}
          className="px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors"
        >
          {isResultsPage ? 'Back to Home' : 'Start Over'}
        </button>
      </div>
    </div>
  );
}