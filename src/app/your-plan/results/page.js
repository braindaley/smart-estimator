'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { defaultCalculatorSettings } from '@/lib/config/default-calculator-settings';

const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '$0';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

// Function to get credit data
const getCreditData = () => {
  if (typeof window === 'undefined') return null;
  const userId = localStorage.getItem('loan_user_id');
  if (!userId) return null;
  const storedCreditData = localStorage.getItem(`credit_data_${userId}`);
  if (!storedCreditData) return null;
  try {
    return JSON.parse(storedCreditData);
  } catch {
    return null;
  }
};

// Function to match account types with fuzzy logic (from deal-sheet)
const matchesAccountType = (account, targetTypes) => {
  const getDescription = (field) => {
    if (!field) return '';
    return field.description || field.code || field || '';
  };
  
  const accountType = getDescription(account.portfolioTypeCode).toLowerCase();
  const accountTypeCode = getDescription(account.accountTypeCode).toLowerCase();
  const customerName = (account.customerName || '').toLowerCase();
  const narrativeDescription = account.narrativeCodes && account.narrativeCodes[0] 
    ? getDescription(account.narrativeCodes[0]).toLowerCase() 
    : '';
  
  const searchText = `${accountType} ${accountTypeCode} ${customerName} ${narrativeDescription}`;
  
  for (const targetType of targetTypes) {
    const keywords = targetType.keywords;
    const hasMatch = keywords.some(keyword => searchText.includes(keyword));
    if (hasMatch) {
      return targetType.type;
    }
  }
  return null;
};

// Account type matching configuration
const DEBT_ACCOUNT_TYPES = [
  {
    type: 'Credit Card',
    keywords: ['credit card', 'credit', 'card', 'revolving', 'discover', 'visa', 'mastercard', 'american express', 'amex', 'chase', 'capital one', 'citi']
  },
  {
    type: 'Personal Loan',
    keywords: ['personal loan', 'personal', 'loan', 'installment', 'lending', 'upstart', 'prosper', 'sofi', 'marcus']
  },
  {
    type: 'Medical',
    keywords: ['medical', 'healthcare', 'hospital', 'clinic', 'physician', 'doctor', 'health']
  },
  {
    type: 'Retail Credit',
    keywords: ['retail', 'store', 'macy', 'macys', 'best buy', 'target', 'walmart', 'home depot', 'lowes', 'kohls', 'jcpenney', 'sears', 'nordstrom']
  }
];

export default function ResultsPage() {
  const [debtAccounts, setDebtAccounts] = useState([]);
  const [calculations, setCalculations] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load credit data and calculate everything
  useEffect(() => {
    const loadAndCalculateData = () => {
      try {
        const creditData = getCreditData();
        if (!creditData || !creditData.trades || !Array.isArray(creditData.trades)) {
          setLoading(false);
          return;
        }

        // Filter and categorize debt accounts
        const matchedAccounts = creditData.trades
          .map(account => {
            const matchedType = matchesAccountType(account, DEBT_ACCOUNT_TYPES);
            if (matchedType && account.balance && account.balance > 0) {
              return {
                ...account,
                matchedType,
                balance: account.balance || 0
              };
            }
            return null;
          })
          .filter(account => account !== null);
          
        setDebtAccounts(matchedAccounts);

        if (matchedAccounts.length > 0) {
          calculateDebtProgram(matchedAccounts);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading data:', error);
        setLoading(false);
      }
    };

    loadAndCalculateData();
  }, []);

  const calculateDebtProgram = (accounts) => {
    // 1. Calculate total debt
    const totalDebt = accounts.reduce((sum, account) => sum + (account.balance || 0), 0);
    
    // 2. Find appropriate debt tier for total debt
    // For this example, we'll use 'standard' program type
    const debtTier = defaultCalculatorSettings.debtTiers
      .filter(tier => tier.programType === 'standard')
      .find(tier => totalDebt >= tier.minAmount && totalDebt <= tier.maxAmount);
    
    if (!debtTier) {
      console.error('No appropriate debt tier found for total debt:', totalDebt);
      return;
    }

    // 3. Calculate Weighted Settlement Rate for each account
    const accountsWithSettlement = accounts.map(account => {
      const creditorName = (account.customerName || '').toUpperCase();
      let settlementRate = defaultCalculatorSettings.creditorData.creditorSettlementRates[creditorName];
      
      // If not found, try to find partial match
      if (!settlementRate) {
        const creditorKeys = Object.keys(defaultCalculatorSettings.creditorData.creditorSettlementRates);
        const partialMatch = creditorKeys.find(key => 
          creditorName.includes(key) || key.includes(creditorName)
        );
        settlementRate = partialMatch 
          ? defaultCalculatorSettings.creditorData.creditorSettlementRates[partialMatch]
          : defaultCalculatorSettings.creditorData.fallbackRate;
      }
      
      return {
        ...account,
        settlementRate: settlementRate / 100, // Convert to decimal
        settlementAmount: account.balance * (settlementRate / 100)
      };
    });

    // 4. Calculate totals
    const totalSettlementCost = accountsWithSettlement.reduce((sum, account) => sum + account.settlementAmount, 0);
    const weightedSettlementRate = totalSettlementCost / totalDebt;
    
    // 5. Calculate Fee Amount using debt tier
    const feeAmount = totalDebt * (debtTier.feePercentage / 100);
    
    // 6. Calculate Total Program Cost
    const totalProgramCost = totalSettlementCost + feeAmount;
    
    // 7. Calculate Proposed Program Payment
    const baseMonthlyPayment = totalProgramCost / debtTier.maxTerm;
    // Use debt tier-specific legal processing fee, fall back to global fee if not set
    const legalProcessingFee = debtTier.legalProcessingFee || defaultCalculatorSettings.feeStructure.legalProcessingMonthlyFee;
    const proposedMonthlyPayment = baseMonthlyPayment + legalProcessingFee;

    setCalculations({
      totalDebt,
      debtTier,
      accountsWithSettlement,
      totalSettlementCost,
      weightedSettlementRate,
      feeAmount,
      totalProgramCost,
      baseMonthlyPayment,
      legalProcessingFee,
      proposedMonthlyPayment
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your debt portfolio...</p>
          </div>
        </main>
      </div>
    );
  }

  if (debtAccounts.length === 0) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex-1">
          <div className="container mx-auto max-w-7xl px-4 py-12">
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-4">Debt Portfolio Results</h1>
              <div className="border-2 border-dashed rounded-lg p-8 max-w-2xl mx-auto">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 border rounded-full flex items-center justify-center mb-4">
                    <span className="text-2xl">Accounts</span>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Credit Data Available</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Complete your credit check first to see your debt portfolio analysis and program calculations.
                  </p>
                  <Button
                    onClick={() => window.location.href = '/your-plan'}
                    className="border hover:bg-gray-100"
                  >
                    Complete Credit Check
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto max-w-7xl px-4 py-12">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">Your Debt Settlement Program</h1>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              Based on your credit profile, here's your personalized debt settlement program with detailed cost breakdown.
            </p>
            {(() => {
              const creditData = getCreditData();
              return creditData?.isMockData && (
                <div className="mt-4 inline-block px-4 py-2 border rounded-lg">
                  <span className="font-semibold">⚠️ Mock Data</span>
                  <span className="text-sm ml-2">
                    {creditData.mockReason || 'API temporarily unavailable'}
                  </span>
                </div>
              );
            })()}
          </div>

          <div className="space-y-8">
            {/* 1. Debt Portfolio */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-6 h-6 border rounded flex items-center justify-center">
                  <span className="text-sm font-bold">1</span>
                </div>
                <h2 className="text-lg font-semibold">1. Debt Portfolio</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
                {debtAccounts.map((account, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="inline-block px-2 py-1 border text-xs font-medium rounded">
                          {account.matchedType}
                        </span>
                        <span className="text-xs text-gray-500">
                          ...{(account.accountNumber || '').slice(-4)}
                        </span>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold text-sm text-gray-900 truncate">
                          {account.customerName || 'Unknown Creditor'}
                        </h3>
                      </div>
                      
                      <div className="pt-2 border-t">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-600">Balance</span>
                          <span className="font-semibold text-sm">
                            {formatCurrency(account.balance)}
                          </span>
                        </div>
                        {calculations && (
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-xs text-gray-600">Settlement Rate</span>
                            <span className="text-xs font-medium">
                              {(calculations.accountsWithSettlement.find(acc => acc.customerName === account.customerName)?.settlementRate * 100).toFixed(0)}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Summary */}
              <div className="pt-4 border-t border-gray-200">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold">{debtAccounts.length}</div>
                    <div className="text-sm text-gray-600">Total Accounts</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {formatCurrency(calculations?.totalDebt || 0)}
                    </div>
                    <div className="text-sm text-gray-600">Total Debt</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {calculations ? `${(calculations.weightedSettlementRate * 100).toFixed(0)}%` : '0%'}
                    </div>
                    <div className="text-sm text-gray-600">Weighted Settlement Rate</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {[...new Set(debtAccounts.map(account => account.matchedType))].length}
                    </div>
                    <div className="text-sm text-gray-600">Account Types</div>
                  </div>
                </div>
              </div>
            </Card>

            {calculations && (
              <>
                {/* 2. Debt Tier Configuration */}
                <Card className="p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-6 h-6 border rounded flex items-center justify-center">
                      <span className="text-sm font-bold">2</span>
                    </div>
                    <h2 className="text-lg font-semibold">2. Program Configuration</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{calculations.debtTier.feePercentage}%</div>
                      <div className="text-sm text-gray-600">Fee Percentage</div>
                      <div className="text-xs text-gray-500 mt-1">
                        Debt Range: {formatCurrency(calculations.debtTier.minAmount)} - {formatCurrency(calculations.debtTier.maxAmount)}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{calculations.debtTier.maxTerm}</div>
                      <div className="text-sm text-gray-600">Max Term (Months)</div>
                      <div className="text-xs text-gray-500 mt-1">
                        Program Type: {calculations.debtTier.programType}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {formatCurrency(calculations.totalSettlementCost)}
                      </div>
                      <div className="text-sm text-gray-600">Total Settlement Cost</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {formatCurrency(calculations.totalDebt)} × {(calculations.weightedSettlementRate * 100).toFixed(0)}%
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {formatCurrency(calculations.feeAmount)}
                      </div>
                      <div className="text-sm text-gray-600">Fee Amount</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {formatCurrency(calculations.totalDebt)} × {calculations.debtTier.feePercentage}%
                      </div>
                    </div>
                  </div>
                </Card>

                {/* 3. Total Program Cost */}
                <Card className="p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-6 h-6 border rounded flex items-center justify-center">
                      <span className="text-sm font-bold">3</span>
                    </div>
                    <h2 className="text-lg font-semibold">3. Total Program Cost</h2>
                  </div>
                  
                  <div className="border rounded-lg p-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center text-lg">
                        <span>Total Settlement Cost:</span>
                        <span className="font-semibold">
                          {formatCurrency(calculations.totalSettlementCost)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-lg">
                        <span>Fee Amount:</span>
                        <span className="font-semibold">
                          {formatCurrency(calculations.feeAmount)}
                        </span>
                      </div>
                      <div className="border-t pt-4">
                        <div className="flex justify-between items-center text-2xl font-bold">
                          <span>Total Program Cost:</span>
                          <span className="font-bold">
                            {formatCurrency(calculations.totalProgramCost)}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 text-right mt-1">
                          {formatCurrency(calculations.totalSettlementCost)} + {formatCurrency(calculations.feeAmount)}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* 4. Proposed Program Payment */}
                <Card className="p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-6 h-6 border rounded flex items-center justify-center">
                      <span className="text-sm font-bold">4</span>
                    </div>
                    <h2 className="text-lg font-semibold">4. Proposed Program Payment</h2>
                  </div>
                  
                  <div className="border rounded-lg p-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center text-lg">
                        <span>Base Monthly Payment:</span>
                        <span className="font-semibold">
                          {formatCurrency(calculations.baseMonthlyPayment)}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 text-right">
                        {formatCurrency(calculations.totalProgramCost)} ÷ {calculations.debtTier.maxTerm} months
                      </div>
                      <div className="flex justify-between items-center text-lg">
                        <span>Legal/Payment Processing Fee:</span>
                        <span className="font-semibold">
                          {formatCurrency(calculations.legalProcessingFee)}
                        </span>
                      </div>
                      <div className="border-t pt-4">
                        <div className="flex justify-between items-center text-3xl font-bold">
                          <span>Proposed Monthly Payment:</span>
                          <span className="font-bold">
                            {formatCurrency(calculations.proposedMonthlyPayment)}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 text-right mt-1">
                          {formatCurrency(calculations.baseMonthlyPayment)} + {formatCurrency(calculations.legalProcessingFee)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Savings Summary */}
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold">
                        {formatCurrency(calculations.totalDebt - calculations.totalProgramCost)}
                      </div>
                      <div className="text-sm font-bold">Total Savings</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold">
                        {(((calculations.totalDebt - calculations.totalProgramCost) / calculations.totalDebt) * 100).toFixed(0)}%
                      </div>
                      <div className="text-sm font-bold">Savings Percentage</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold">
                        {calculations.debtTier.maxTerm}
                      </div>
                      <div className="text-sm font-bold">Months to Debt Freedom</div>
                    </div>
                  </div>
                </Card>
              </>
            )}

            {/* Action Buttons */}
            <div className="flex justify-center gap-4">
              <Button 
                variant="outline" 
                onClick={() => window.location.href = '/results/credit'}
              >
                View Credit Report
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.location.href = '/your-plan/deal-sheet'}
              >
                View Deal Sheet
              </Button>
              <Button 
                variant="outline"
                onClick={() => alert('Program enrollment would be implemented here')}
              >
                Enroll in Program
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}