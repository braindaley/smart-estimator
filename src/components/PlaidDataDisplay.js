'use client';

import { useState, useEffect } from 'react';
import { getTokenClient } from '@/lib/client-token-store';
import { getPlaidData } from '@/lib/session-store';
import { INCOME_MAPPINGS, EXPENSE_MAPPINGS, getFieldDisplayName } from '@/lib/plaid-mapping';

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
      
      // Fetch all Plaid data in parallel - accounts, transactions, identity, liabilities, and income
      const [accountsResponse, transactionsResponse, identityResponse, liabilitiesResponse, incomeResponse] = await Promise.all([
        fetch('/api/plaid/accounts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, clientToken }),
        }),
        fetch('/api/plaid/transactions', {
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, clientToken }),
        }),
        fetch('/api/plaid/identity', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, clientToken }),
        }),
        fetch('/api/plaid/liabilities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, clientToken }),
        }),
        fetch('/api/plaid/income', {
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
      
      // Handle optional data that may not be available for all accounts
      let identityData = null;
      let liabilitiesData = null;
      let incomeData = null;

      if (identityResponse.ok) {
        identityData = await identityResponse.json();
      } else {
        console.log('[PlaidDataDisplay] Identity data not available');
      }

      if (liabilitiesResponse.ok) {
        liabilitiesData = await liabilitiesResponse.json();
      } else {
        console.log('[PlaidDataDisplay] Liabilities data not available');
      }

      if (incomeResponse.ok) {
        incomeData = await incomeResponse.json();
      } else {
        console.log('[PlaidDataDisplay] Income data not available');
      }

      setPlaidData({
        connectionMetadata,
        accounts: accountsData,
        transactions: transactionsData,
        identity: identityData,
        liabilities: liabilitiesData,
        income: incomeData,
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
    const date = new Date(dateString);
    // Add 1 day to fix the date offset issue
    date.setDate(date.getDate() + 1);
    // Return in ISO format (YYYY-MM-DD)
    return date.toISOString().split('T')[0];
  };

  // Helper function to determine if a transaction is income based on category and transaction details
  const isIncomeTransaction = (transaction) => {
    const category = transaction.personal_finance_category;
    const primaryCategory = category?.primary;
    const transactionName = (transaction.name || '').toLowerCase();
    
    // Explicit income category
    if (primaryCategory === 'INCOME') {
      return true;
    }
    
    // Check for income indicators in transaction names (payroll, salary, etc.)
    const incomeKeywords = ['gusto pay', 'payroll', 'salary', 'wage', 'deposit', 'direct deposit', 'intrst pymnt', 'interest payment'];
    const hasIncomeKeyword = incomeKeywords.some(keyword => transactionName.includes(keyword));
    
    if (hasIncomeKeyword) {
      return true;
    }
    
    // Most importantly: negative amounts represent money coming INTO the account (income/refunds/credits)
    // unless it's a known expense category that might have positive/negative inconsistencies
    if (transaction.amount < 0) {
      return true;
    }
    
    return false;
  };

  // Helper function to determine payment type based on transaction characteristics
  const getPaymentType = (transaction) => {
    const transactionName = (transaction.name || '').toLowerCase();
    const merchantName = (transaction.merchant_name || '').toLowerCase();
    const category = transaction.personal_finance_category;
    
    // Check for direct deposit/ACH
    if (transactionName.includes('direct deposit') || 
        transactionName.includes('ach') || 
        transactionName.includes('gusto pay') ||
        transactionName.includes('payroll')) {
      return 'ACH/Direct Deposit';
    }
    
    // Check for wire transfers
    if (transactionName.includes('wire') || transactionName.includes('transfer')) {
      return 'Wire Transfer';
    }
    
    // Check for card payments based on payment channel and merchant
    if (transaction.payment_channel === 'online') {
      return 'Card/Online';
    } else if (transaction.payment_channel === 'in store') {
      return 'Card/In-Store';
    }
    
    // Check for check payments
    if (transactionName.includes('check') || transactionName.includes('chk')) {
      return 'Check';
    }
    
    // Check for recurring/automatic payments
    if (transactionName.includes('auto') || 
        transactionName.includes('recurring') ||
        transactionName.includes('automatic')) {
      return 'Automatic Payment';
    }
    
    // Check for ATM transactions
    if (transactionName.includes('atm') || transactionName.includes('cash withdrawal')) {
      return 'ATM';
    }
    
    // Check for fee-related transactions
    if (category?.primary === 'BANK_FEES' || 
        transactionName.includes('fee') || 
        transactionName.includes('service charge')) {
      return 'Bank Fee';
    }
    
    // Default based on payment channel
    if (transaction.payment_channel === 'other') {
      return 'Bank Transaction';
    }
    
    return 'Debit/Credit Card';
  };

  const getDealSheetField = (transaction) => {
    const category = transaction.personal_finance_category;
    if (!category || !category.detailed) {
      return '';
    }

    const detailedCategory = category.detailed;
    const primaryCategory = category.primary;
    
    // Format the detailed category for mapping lookup
    const categoryKey = detailedCategory.toUpperCase().replace(/[^A-Z_]/g, '_');
    
    // Check if this is income
    if (isIncomeTransaction(transaction)) {
      const mappedField = INCOME_MAPPINGS[categoryKey] || 'netMonthlyEmploymentIncome'; // Default to employment income
      return mappedField ? getFieldDisplayName(mappedField) : '';
    } 
    // Check if this is an expense (positive amounts or known expense categories)
    else if (transaction.amount > 0 || 
             primaryCategory === 'TRANSPORTATION' || 
             primaryCategory === 'FOOD_AND_DRINK' || 
             primaryCategory === 'GENERAL_MERCHANDISE' ||
             primaryCategory === 'GENERAL_SERVICES' ||
             primaryCategory === 'ENTERTAINMENT' ||
             primaryCategory === 'PERSONAL_CARE' ||
             primaryCategory === 'LOAN_PAYMENTS' ||
             primaryCategory === 'RENT_AND_UTILITIES' ||
             primaryCategory === 'MEDICAL' ||
             primaryCategory === 'TRAVEL') {
      
      let mappedField = EXPENSE_MAPPINGS[categoryKey];
      
      // Special handling for GENERAL_SERVICES_INSURANCE - need to detect type
      if (categoryKey === 'GENERAL_SERVICES_INSURANCE') {
        const transactionName = (transaction.name || '').toLowerCase();
        const merchantName = (transaction.merchant_name || '').toLowerCase();
        
        if (transactionName.includes('home') || transactionName.includes('renters') || 
            merchantName.includes('home') || merchantName.includes('renters')) {
          mappedField = 'homeOwnersInsurance';
        } else if (transactionName.includes('auto') || transactionName.includes('car') || 
                   merchantName.includes('auto') || merchantName.includes('geico') || 
                   merchantName.includes('progressive') || merchantName.includes('allstate')) {
          mappedField = 'autoInsurance';
        } else if (transactionName.includes('health') || transactionName.includes('life') ||
                   transactionName.includes('medical') || merchantName.includes('health')) {
          mappedField = 'healthLifeInsurance';
        } else {
          mappedField = 'healthLifeInsurance';
        }
      }
      
      return mappedField ? getFieldDisplayName(mappedField) : '';
    }
    
    return '';
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

  // Calculate summary metrics
  const calculateSummaryMetrics = () => {
    const accounts = plaidData.accounts?.accounts || [];
    const transactions = plaidData.transactions?.transactions || [];
    const income = plaidData.income?.income_summary || {};
    const liabilities = plaidData.liabilities?.debt_summary || {};

    // Total assets
    const totalAssets = accounts.reduce((sum, acc) => {
      return sum + (acc.balances?.current || 0);
    }, 0);

    // Total debts
    const totalDebts = (liabilities.total_credit_card_debt || 0) + 
                      (liabilities.total_mortgage_debt || 0) + 
                      (liabilities.total_student_loan_debt || 0);

    // Monthly expenses from transactions (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const monthlyExpenses = transactions
      .filter(t => new Date(t.date) >= thirtyDaysAgo && t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);

    // Debt to income ratio
    const monthlyIncome = income.total_monthly_income || 0;
    const debtToIncomeRatio = monthlyIncome > 0 ? (totalDebts / (monthlyIncome * 12)) : 0;

    // Available funds for settlement
    const availableFunds = totalAssets - (monthlyExpenses * 1.5); // Conservative estimate

    return {
      totalAssets,
      totalDebts,
      monthlyExpenses,
      monthlyIncome,
      debtToIncomeRatio,
      availableFunds: Math.max(0, availableFunds),
      netWorth: totalAssets - totalDebts
    };
  };

  const summaryMetrics = plaidData ? calculateSummaryMetrics() : {};

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Financial Overview</h1>
        <p className="text-gray-600">Complete analysis for debt settlement planning</p>
        <p className="text-sm text-gray-500">Data fetched at: {formatDate(plaidData.fetchedAt)}</p>
      </div>

      {/* Financial Summary Dashboard */}
      {plaidData && (
        <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Financial Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Total Assets</h3>
              <p className={`text-2xl font-bold ${
                summaryMetrics.totalAssets >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatCurrency(summaryMetrics.totalAssets)}
              </p>
            </div>
            <div className="text-center">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Total Debts</h3>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(summaryMetrics.totalDebts)}
              </p>
            </div>
            <div className="text-center">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Monthly Income</h3>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(summaryMetrics.monthlyIncome)}
              </p>
            </div>
            <div className="text-center">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Net Worth</h3>
              <p className={`text-2xl font-bold ${
                summaryMetrics.netWorth >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatCurrency(summaryMetrics.netWorth)}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 pt-6 border-t border-gray-200">
            <div className="text-center">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Monthly Expenses</h3>
              <p className="text-lg font-semibold text-orange-600">
                {formatCurrency(summaryMetrics.monthlyExpenses)}
              </p>
            </div>
            <div className="text-center">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Debt-to-Income Ratio</h3>
              <p className={`text-lg font-semibold ${
                summaryMetrics.debtToIncomeRatio > 0.4 ? 'text-red-600' : 
                summaryMetrics.debtToIncomeRatio > 0.3 ? 'text-orange-600' : 'text-green-600'
              }`}>
                {(summaryMetrics.debtToIncomeRatio * 100).toFixed(1)}%
              </p>
            </div>
            <div className="text-center">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Settlement Funds Available</h3>
              <p className="text-lg font-semibold text-blue-600">
                {formatCurrency(summaryMetrics.availableFunds)}
              </p>
            </div>
          </div>
        </div>
      )}

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

      {/* Expense Analysis from Transactions */}
      {plaidData.transactions && plaidData.transactions.transactions && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-yellow-900 mb-4">
            Monthly Expense Breakdown
          </h2>
          
          {(() => {
            const transactions = plaidData.transactions.transactions;
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            
            const monthlyExpenses = transactions
              .filter(t => new Date(t.date) >= thirtyDaysAgo && t.amount > 0)
              .reduce((categories, transaction) => {
                const category = transaction.personal_finance_category?.primary || 
                               (transaction.category ? transaction.category[0] : 'Other');
                if (!categories[category]) {
                  categories[category] = { total: 0, count: 0, transactions: [] };
                }
                categories[category].total += transaction.amount;
                categories[category].count += 1;
                categories[category].transactions.push(transaction);
                return categories;
              }, {});
            
            const sortedCategories = Object.entries(monthlyExpenses)
              .sort(([,a], [,b]) => b.total - a.total)
              .slice(0, 10);
            
            return (
              <div className="bg-white rounded-lg border border-yellow-300 p-4">
                <h3 className="font-semibold text-yellow-800 mb-3">Top Expense Categories (Last 30 Days)</h3>
                <div className="space-y-3">
                  {sortedCategories.map(([category, data]) => (
                    <div key={category} className="flex justify-between items-center p-3 bg-yellow-25 rounded">
                      <div>
                        <span className="font-medium text-yellow-900">{category}</span>
                        <span className="text-sm text-yellow-600 ml-2">({data.count} transactions)</span>
                      </div>
                      <span className="font-semibold text-yellow-800">
                        {formatCurrency(data.total)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Transactions Information - Grouped by Account */}
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-orange-900 mb-4">
          Recent Transactions ({plaidData.transactions.transactions?.length || 0})
        </h2>
        
        {plaidData.transactions.transactions && plaidData.transactions.transactions.length > 0 ? (
          <>
            <div className="mb-4 text-sm text-orange-700">
              Total transactions available: {plaidData.transactions.total_transactions}
            </div>
            
            {(() => {
              const accounts = plaidData.accounts.accounts || [];
              const transactions = plaidData.transactions.transactions || [];
              
              // Group transactions by account
              const transactionsByAccount = transactions.reduce((grouped, transaction) => {
                const accountId = transaction.account_id;
                if (!grouped[accountId]) {
                  grouped[accountId] = [];
                }
                grouped[accountId].push(transaction);
                return grouped;
              }, {});

              return (
                <div className="space-y-6">
                  {Object.entries(transactionsByAccount).map(([accountId, accountTransactions]) => {
                    const account = accounts.find(acc => acc.account_id === accountId);
                    
                    return (
                      <div key={accountId} className="bg-white rounded-lg border border-orange-300">
                        <div className="bg-orange-100 px-4 py-3 rounded-t-lg">
                          <div className="flex justify-between items-center">
                            <div>
                              <h3 className="font-semibold text-orange-900">
                                {account?.name || 'Unknown Account'}
                              </h3>
                              <p className="text-sm text-orange-700">
                                {account?.subtype} • {account?.type} • ID: ...{accountId.slice(-4)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-orange-700">
                                {accountTransactions.length} transactions
                              </p>
                              {account && (
                                <p className="text-sm text-orange-600">
                                  Balance: {formatCurrency(account.balances.current)}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="overflow-x-auto">
                          <table className="min-w-full">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Date</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Description</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Amount</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Payment Channel</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Payment Type</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Category</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Deal Sheet Field</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {accountTransactions.map((transaction, index) => (
                                <tr key={transaction.transaction_id} className="hover:bg-gray-50">
                                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                    {formatDate(transaction.date)}
                                  </td>
                                  <td className="px-4 py-2 text-sm text-gray-900">
                                    {transaction.name}
                                  </td>
                                  <td className={`px-4 py-2 whitespace-nowrap text-sm font-medium ${
                                    isIncomeTransaction(transaction) ? 'text-green-600' : 'text-red-600'
                                  }`}>
                                    {isIncomeTransaction(transaction) 
                                      ? `+${formatCurrency(Math.abs(transaction.amount))}` 
                                      : `-${formatCurrency(Math.abs(transaction.amount))}`}
                                  </td>
                                  <td className="px-4 py-2 text-sm text-gray-600">
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                                      transaction.payment_channel === 'online' ? 'bg-blue-100 text-blue-800' :
                                      transaction.payment_channel === 'in store' ? 'bg-green-100 text-green-800' :
                                      transaction.payment_channel === 'other' ? 'bg-gray-100 text-gray-800' :
                                      'bg-yellow-100 text-yellow-800'
                                    }`}>
                                      {transaction.payment_channel || 'unknown'}
                                    </span>
                                  </td>
                                  <td className="px-4 py-2 text-sm text-gray-600">
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                                      getPaymentType(transaction).includes('ACH') || getPaymentType(transaction).includes('Direct') ? 'bg-purple-100 text-purple-800' :
                                      getPaymentType(transaction).includes('Card') ? 'bg-indigo-100 text-indigo-800' :
                                      getPaymentType(transaction).includes('Wire') ? 'bg-red-100 text-red-800' :
                                      getPaymentType(transaction).includes('Check') ? 'bg-orange-100 text-orange-800' :
                                      getPaymentType(transaction).includes('ATM') ? 'bg-yellow-100 text-yellow-800' :
                                      getPaymentType(transaction).includes('Fee') ? 'bg-red-100 text-red-800' :
                                      'bg-gray-100 text-gray-800'
                                    }`}>
                                      {getPaymentType(transaction)}
                                    </span>
                                  </td>
                                  <td className="px-4 py-2 text-sm text-gray-600">
                                    <div className="space-y-1">
                                      <div>
                                        {transaction.personal_finance_category 
                                          ? transaction.personal_finance_category.primary 
                                          : (transaction.category ? transaction.category.join(' > ') : 'Uncategorized')}
                                      </div>
                                      {transaction.personal_finance_category?.detailed && (
                                        <div className="text-xs text-gray-500">
                                          {transaction.personal_finance_category.detailed.replace(/_/g, ' ').toLowerCase()}
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                  <td className="px-4 py-2 text-sm text-gray-600">
                                    {(() => {
                                      const dealSheetField = getDealSheetField(transaction);
                                      return dealSheetField ? (
                                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                                          {dealSheetField}
                                        </span>
                                      ) : (
                                        <span className="text-gray-400 italic">No mapping</span>
                                      );
                                    })()}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </>
        ) : (
          <p className="text-orange-700">No transactions found</p>
        )}
      </div>

      {/* Identity Information - KYC & Customer Verification */}
      {plaidData.identity && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-purple-900 mb-4">
            Identity & KYC Information
          </h2>
          
          {plaidData.identity.accounts && plaidData.identity.accounts.length > 0 ? (
            <div className="space-y-4">
              {plaidData.identity.accounts.map((account, index) => (
                <div key={account.account_id} className="bg-white rounded-lg border border-purple-300 p-4">
                  <h3 className="font-medium text-purple-900 mb-3">{account.name}</h3>
                  
                  {account.owners && account.owners.length > 0 && (
                    <div className="space-y-3">
                      {account.owners.map((owner, ownerIndex) => (
                        <div key={ownerIndex} className="bg-purple-25 p-3 rounded">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                              <h4 className="font-medium text-purple-800">Names</h4>
                              {owner.names.map((name, nameIndex) => (
                                <p key={nameIndex} className="text-purple-700">{name}</p>
                              ))}
                            </div>
                            
                            {owner.phone_numbers && owner.phone_numbers.length > 0 && (
                              <div>
                                <h4 className="font-medium text-purple-800">Phone Numbers</h4>
                                {owner.phone_numbers.map((phone, phoneIndex) => (
                                  <p key={phoneIndex} className="text-purple-700">{phone.data}</p>
                                ))}
                              </div>
                            )}
                            
                            {owner.emails && owner.emails.length > 0 && (
                              <div>
                                <h4 className="font-medium text-purple-800">Email Addresses</h4>
                                {owner.emails.map((email, emailIndex) => (
                                  <p key={emailIndex} className="text-purple-700">{email.data}</p>
                                ))}
                              </div>
                            )}
                          </div>
                          
                          {owner.addresses && owner.addresses.length > 0 && (
                            <div className="mt-3">
                              <h4 className="font-medium text-purple-800">Addresses</h4>
                              {owner.addresses.map((address, addressIndex) => (
                                <div key={addressIndex} className="text-purple-700">
                                  <p>{address.data.street}</p>
                                  <p>{address.data.city}, {address.data.region} {address.data.postal_code}</p>
                                  <p>{address.data.country}</p>
                                  {address.primary && (
                                    <span className="text-xs bg-purple-200 text-purple-800 px-2 py-1 rounded">Primary</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-purple-700">No identity information available</p>
          )}
        </div>
      )}

      {/* Liabilities Information - Debt Settlement Focus */}
      {plaidData.liabilities && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-red-900 mb-4">
            Debt Portfolio Analysis
          </h2>
          
          {plaidData.liabilities.debt_summary && (
            <div className="bg-white rounded-lg border border-red-300 p-4 mb-4">
              <h3 className="font-semibold text-red-800 mb-3">Debt Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <h4 className="font-medium text-red-700">Credit Card Debt</h4>
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrency(plaidData.liabilities.debt_summary.total_credit_card_debt)}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-red-700">Mortgage Debt</h4>
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrency(plaidData.liabilities.debt_summary.total_mortgage_debt)}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-red-700">Student Loan Debt</h4>
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrency(plaidData.liabilities.debt_summary.total_student_loan_debt)}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-red-700">Overdue Accounts</h4>
                  <p className="text-2xl font-bold text-red-600">
                    {plaidData.liabilities.debt_summary.overdue_accounts}
                  </p>
                </div>
              </div>
              
              {plaidData.liabilities.debt_summary.accounts_with_minimum_payments.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium text-red-700 mb-2">Monthly Payment Obligations</h4>
                  <div className="space-y-2">
                    {plaidData.liabilities.debt_summary.accounts_with_minimum_payments.map((payment, index) => (
                      <div key={index} className="flex justify-between items-center bg-red-25 p-2 rounded">
                        <span className="text-red-700">{payment.name}</span>
                        <span className="font-semibold text-red-600">
                          {formatCurrency(payment.minimum_payment)}
                          {payment.due_date && (
                            <span className="text-sm text-red-500 ml-2">
                              Due: {formatDate(payment.due_date)}
                            </span>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {plaidData.liabilities.accounts && plaidData.liabilities.accounts.length > 0 ? (
            <div className="space-y-4">
              {plaidData.liabilities.accounts.map((account, index) => (
                <div key={account.account_id} className="bg-white rounded-lg border border-red-300 p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-medium text-red-900">{account.name}</h3>
                      <p className="text-sm text-red-600">{account.subtype} • {account.type}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-red-600">
                        {formatCurrency(account.balances.current)}
                      </p>
                    </div>
                  </div>
                  
                  {/* Credit Card Details */}
                  {account.credit && (
                    <div className="bg-red-25 p-3 rounded">
                      <h4 className="font-medium text-red-800 mb-2">Credit Card Details</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        {account.credit.minimum_payment_amount && (
                          <p className="text-red-700">
                            Min Payment: {formatCurrency(account.credit.minimum_payment_amount)}
                          </p>
                        )}
                        {account.credit.next_payment_due_date && (
                          <p className="text-red-700">
                            Due Date: {formatDate(account.credit.next_payment_due_date)}
                          </p>
                        )}
                        {account.credit.is_overdue && (
                          <p className="text-red-800 font-semibold">⚠️ OVERDUE</p>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Student Loan Details */}
                  {account.student && (
                    <div className="bg-red-25 p-3 rounded">
                      <h4 className="font-medium text-red-800 mb-2">Student Loan Details</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        <p className="text-red-700">Status: {account.student.loan_status}</p>
                        <p className="text-red-700">
                          Interest Rate: {account.student.interest_rate_percentage}%
                        </p>
                        {account.student.minimum_payment_amount && (
                          <p className="text-red-700">
                            Min Payment: {formatCurrency(account.student.minimum_payment_amount)}
                          </p>
                        )}
                        {account.student.is_overdue && (
                          <p className="text-red-800 font-semibold">⚠️ OVERDUE</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-red-700">No liabilities found</p>
          )}
        </div>
      )}

      {/* Settlement Capacity Analysis */}
      {plaidData.income && plaidData.liabilities && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-blue-900 mb-4">
            Debt Settlement Capacity Analysis
          </h2>
          
          <div className="bg-white rounded-lg border border-blue-300 p-4 mb-4">
            <h3 className="font-semibold text-blue-800 mb-3">Settlement Recommendations</h3>
            <div className="space-y-3">
              {summaryMetrics.debtToIncomeRatio > 0.4 && (
                <div className="bg-red-100 border border-red-300 rounded p-3">
                  <p className="text-red-800 font-medium">⚠️ High Debt-to-Income Ratio</p>
                  <p className="text-red-700 text-sm">Your debt-to-income ratio of {(summaryMetrics.debtToIncomeRatio * 100).toFixed(1)}% indicates you may benefit from debt settlement.</p>
                </div>
              )}
              
              {summaryMetrics.availableFunds > 1000 && (
                <div className="bg-green-100 border border-green-300 rounded p-3">
                  <p className="text-green-800 font-medium">✅ Settlement Funds Available</p>
                  <p className="text-green-700 text-sm">You have approximately {formatCurrency(summaryMetrics.availableFunds)} available for potential settlements.</p>
                </div>
              )}
              
              {summaryMetrics.monthlyIncome > 3000 && (
                <div className="bg-blue-100 border border-blue-300 rounded p-3">
                  <p className="text-blue-800 font-medium">💼 Stable Income</p>
                  <p className="text-blue-700 text-sm">Your monthly income of {formatCurrency(summaryMetrics.monthlyIncome)} provides a good foundation for settlement planning.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Income Information - Settlement Capacity Analysis */}
      {plaidData.income && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-emerald-900 mb-4">
            Income Analysis & Employment Details
          </h2>
          
          {plaidData.income.income_summary && (
            <div className="bg-white rounded-lg border border-emerald-300 p-4 mb-4">
              <h3 className="font-semibold text-emerald-800 mb-3">Income Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h4 className="font-medium text-emerald-700">Monthly Income</h4>
                  <p className="text-2xl font-bold text-emerald-600">
                    {formatCurrency(plaidData.income.income_summary.total_monthly_income)}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-emerald-700">Annual Income</h4>
                  <p className="text-2xl font-bold text-emerald-600">
                    {formatCurrency(plaidData.income.income_summary.total_annual_income)}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-emerald-700">Income Stability</h4>
                  <p className="text-2xl font-bold text-emerald-600">
                    {Math.round(plaidData.income.income_summary.income_stability * 100)}%
                  </p>
                </div>
              </div>
              
              {plaidData.income.income_summary.employment_status.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium text-emerald-700 mb-2">Employment Status</h4>
                  <div className="space-y-2">
                    {plaidData.income.income_summary.employment_status.map((employment, index) => (
                      <div key={index} className="flex justify-between items-center bg-emerald-25 p-2 rounded">
                        <span className="text-emerald-700">{employment.employer}</span>
                        <span className="font-semibold text-emerald-600">
                          {formatCurrency(employment.monthly_income)}/month
                          <span className="text-sm text-emerald-500 ml-2">
                            ({Math.round(employment.confidence * 100)}% confidence)
                          </span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {plaidData.income.income_streams && plaidData.income.income_streams.length > 0 ? (
            <div className="space-y-4">
              {plaidData.income.income_streams.map((stream, index) => (
                <div key={index} className="bg-white rounded-lg border border-emerald-300 p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-medium text-emerald-900">{stream.name}</h3>
                      {stream.employer && (
                        <p className="text-sm text-emerald-600">{stream.employer.employer_name}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-emerald-600">
                        {formatCurrency(stream.monthly_income)}/month
                      </p>
                      <p className="text-sm text-emerald-500">
                        Confidence: {Math.round(stream.confidence * 100)}%
                      </p>
                    </div>
                  </div>
                  
                  {stream.income_breakdown && (
                    <div className="bg-emerald-25 p-3 rounded">
                      <h4 className="font-medium text-emerald-800 mb-2">Income Details</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                        <p className="text-emerald-700">Type: {stream.income_breakdown.type}</p>
                        <p className="text-emerald-700">Rate: {formatCurrency(stream.income_breakdown.rate)}</p>
                        <p className="text-emerald-700">Frequency: {stream.income_breakdown.pay_frequency}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-emerald-700">No income streams found</p>
          )}
        </div>
      )}

      {/* Raw JSON Data */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Raw JSON Data</h2>
        <details className="cursor-pointer">
          <summary className="text-blue-600 hover:text-blue-800 font-medium">
            Click to view complete raw data
          </summary>
          <pre className="mt-4 bg-gray-800 text-green-400 p-4 rounded text-xs overflow-x-auto">
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