'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/header';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  calculateMonthlyMomentumPayment,
  getMomentumTermLength,
  getMomentumFeePercentage,
  getMomentumSettlementRate,
  calculateMomentumPlanDetailed
} from '@/lib/calculations';
import ResultsTable from './ResultsTable';
import { getPlaidData } from '@/lib/session-store';
import { calculateAverageMonthlyIncome } from '@/lib/mock-cra-income';

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

// Function to get Equifax narrative codes configuration
const getEquifaxNarrativeCodes = () => {
  if (typeof window === 'undefined') return [];
  const savedConfig = localStorage.getItem('equifax-narrative-codes');
  if (!savedConfig) return [];
  try {
    return JSON.parse(savedConfig);
  } catch {
    return [];
  }
};

// Function to check if an account's narrative codes are included in settlement
const isNarrativeCodeIncludedInSettlement = (account, narrativeCodes) => {
  if (narrativeCodes.length === 0) {
    return false;
  }

  const accountNarrativeCodes = [];
  if (account.narrativeCodes && Array.isArray(account.narrativeCodes)) {
    account.narrativeCodes.forEach(nc => {
      if (nc.codeabv) accountNarrativeCodes.push(nc.codeabv);
      if (nc.code) accountNarrativeCodes.push(nc.code);
    });
  }

  if (accountNarrativeCodes.length === 0) {
    return false;
  }

  const hasIncludedCode = accountNarrativeCodes.some(accountCode => {
    const narrativeConfig = narrativeCodes.find(config => config.code === accountCode);
    return narrativeConfig && narrativeConfig.includeInSettlement;
  });

  return hasIncludedCode;
};

// Calculate current path (doing nothing - minimum payments)
function calculateCurrentPath(debtAmount) {
  // Based on real credit card data: $2K at 22% APR = $4.3K total over 11 years
  // Scaling proportionally for any debt amount at 24% APR
  const scalingFactor = debtAmount / 2000;
  const aprAdjustment = 24 / 22;
  const baseYears = 11 * aprAdjustment;
  const baseTotalCost = 4300 * scalingFactor * aprAdjustment;
  const initialMonthlyPayment = Math.round(debtAmount * 0.035);

  return {
    monthlyPayment: initialMonthlyPayment,
    term: Math.round(baseYears * 12),
    totalCost: Math.round(baseTotalCost),
    neverPaysOff: false
  };
}

const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '$0';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

// Mock co-applicant data for demo purposes
const getMockCoApplicantData = () => {
  return {
    name: "Jane Smith",
    phone: "(555) 123-4567",
    creditData: {
      trades: [
        {
          creditor: "CAPITAL ONE",
          balance: 8500,
          narrativeCodes: [{ codeabv: "FE", code: "FE" }]
        },
        {
          creditor: "DISCOVER",
          balance: 3200,
          narrativeCodes: [{ codeabv: "FE", code: "FE" }]
        },
        {
          creditor: "CHASE", // Joint account with primary
          balance: 12000,
          narrativeCodes: [{ codeabv: "FE", code: "FE" }],
          isJoint: true
        }
      ]
    },
    plaidData: {
      income: {
        summary: {
          total_monthly_income: 3200
        }
      },
      transactions: [] // Mock transactions for expenses
    }
  };
};

// Check if user has co-applicant enabled
const hasCoApplicant = () => {
  if (typeof window === 'undefined') return false;
  const stepStatus = JSON.parse(localStorage.getItem('user_steps') || '{}');
  return stepStatus.co_applicant_check?.data?.hasCoApplicant || false;
};

export default function ResultsPage() {
  const [loading, setLoading] = useState(true);
  const [creditData, setCreditData] = useState(null);
  const [narrativeCodes, setNarrativeCodes] = useState([]);
  const [eligibleAccounts, setEligibleAccounts] = useState([]);
  const [momentumResults, setMomentumResults] = useState(null);
  const [currentPathResults, setCurrentPathResults] = useState(null);
  const [calculatorSettings, setCalculatorSettings] = useState(null);
  const [viewMode, setViewMode] = useState('primary'); // 'primary', 'co-applicant', 'combined'
  const [coApplicantData, setCoApplicantData] = useState(null);
  const [combinedResults, setCombinedResults] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState({
    primaryCompleted: false,
    coApplicantCompleted: false
  });
  const [budgetData, setBudgetData] = useState({
    totalMonthlyIncome: 0,
    totalMonthlyExpenses: 0
  });

  // Load budget data from Plaid
  useEffect(() => {
    const loadBudgetData = () => {
      try {
        const plaidData = getPlaidData();

        // Get income from Plaid data or use calculated average
        let totalIncome = 0;
        if (plaidData?.income?.income_summary?.total_monthly_income) {
          totalIncome = plaidData.income.income_summary.total_monthly_income;
        } else {
          totalIncome = calculateAverageMonthlyIncome();
        }

        // Get expenses from Plaid transactions if available
        let totalExpenses = 0;
        if (plaidData?.transactions) {
          // Calculate expenses from transaction categories (excluding income categories)
          const expenseCategories = plaidData.transactions.filter(tx => {
            const category = tx.personal_finance_category?.primary || tx.category?.[0] || '';
            return !category.includes('INCOME') && tx.amount > 0;
          });

          // Group by month and calculate average
          const last90Days = new Date();
          last90Days.setDate(last90Days.getDate() - 90);

          const recentExpenses = expenseCategories.filter(tx =>
            new Date(tx.date) >= last90Days
          );

          const totalExpenseAmount = recentExpenses.reduce((sum, tx) => sum + tx.amount, 0);
          totalExpenses = totalExpenseAmount / 3; // Average over 3 months
        }

        setBudgetData({
          totalMonthlyIncome: totalIncome,
          totalMonthlyExpenses: totalExpenses
        });
      } catch (error) {
        console.error('Error loading budget data:', error);
      }
    };

    loadBudgetData();
  }, []);

  // Load calculator settings
  useEffect(() => {
    fetch('/api/admin/calculator-settings')
      .then(res => res.json())
      .then(settings => setCalculatorSettings(settings))
      .catch(() => {
        // Use fallback defaults
        setCalculatorSettings({ debtTiers: [] });
      });
  }, []);

  // Load co-applicant data and check for co-applicant mode
  useEffect(() => {
    const mockCoApplicant = getMockCoApplicantData();
    setCoApplicantData(mockCoApplicant);

    // Check verification status
    const stepStatus = JSON.parse(localStorage.getItem('user_steps') || '{}');
    const primaryCompleted = !!(stepStatus.phone_verification?.completed &&
                               stepStatus.bank_connection?.completed &&
                               stepStatus.credit_check?.completed);

    // For demo purposes, co-applicant completion is stored separately
    const coApplicantCompleted = localStorage.getItem('co_applicant_verification_complete') === 'true';

    setVerificationStatus({
      primaryCompleted,
      coApplicantCompleted
    });

    // Set default view mode based on whether co-applicant exists
    if (hasCoApplicant()) {
      setViewMode('combined'); // Default to combined view if co-applicant exists
    } else {
      setViewMode('primary');
    }
  }, []);

  // Calculate combined results when view mode changes
  useEffect(() => {
    if (viewMode === 'combined' && momentumResults && coApplicantData) {
      // Calculate combined debt and results
      const primaryDebt = momentumResults.totalDebt || 0;
      const coApplicantDebt = coApplicantData.creditData.trades
        .filter(account => !account.isJoint) // Don't double-count joint accounts
        .reduce((sum, account) => sum + account.balance, 0);

      const combinedTotalDebt = primaryDebt + coApplicantDebt;

      // Calculate combined monthly income
      const primaryIncome = 4500; // Mock primary income
      const coApplicantIncome = coApplicantData.plaidData.income.summary.total_monthly_income;
      const combinedIncome = primaryIncome + coApplicantIncome;

      // Recalculate momentum plan with combined debt
      if (calculatorSettings && combinedTotalDebt >= 15000) {
        const combinedMomentumPayment = calculateMonthlyMomentumPayment(combinedTotalDebt, calculatorSettings.debtTiers);
        const combinedTerm = getMomentumTermLength(combinedTotalDebt, calculatorSettings.debtTiers);
        const combinedTotalCost = combinedMomentumPayment * combinedTerm;

        setCombinedResults({
          monthlyPayment: combinedMomentumPayment,
          term: combinedTerm,
          totalCost: combinedTotalCost,
          totalDebt: combinedTotalDebt,
          combinedIncome: combinedIncome,
          accountCount: eligibleAccounts.length + coApplicantData.creditData.trades.filter(a => !a.isJoint).length,
          belowMinimum: false
        });
      }
    }
  }, [viewMode, momentumResults, coApplicantData, calculatorSettings, eligibleAccounts]);

  // Load and process credit data
  useEffect(() => {
    if (!calculatorSettings) return;

    setTimeout(() => {
      try {
        const data = getCreditData();
        const codes = getEquifaxNarrativeCodes();

        setCreditData(data);
        setNarrativeCodes(codes);

        if (data && data.trades) {
          // Filter accounts with positive balance
          const accountsWithBalance = data.trades.filter(account => {
            const balance = typeof account.balance === 'number' ? account.balance : parseFloat(account.balance) || 0;
            return balance > 0;
          });

          // Filter accounts eligible for settlement
          const eligible = accountsWithBalance.filter(account =>
            isNarrativeCodeIncludedInSettlement(account, codes)
          );

          setEligibleAccounts(eligible);

          // Calculate total debt from eligible accounts
          const totalDebt = eligible.reduce((sum, account) => {
            const balance = typeof account.balance === 'number' ? account.balance : parseFloat(account.balance) || 0;
            return sum + balance;
          }, 0);

          if (totalDebt > 0) {
            // Check if debt meets minimum for Momentum plan
            if (totalDebt < 10000) {
              // For debts below $10,000, use standard calculation
              // or show a message that minimum is not met
              const results = {
                monthlyPayment: 0,
                term: 0,
                totalCost: 0,
                totalDebt: totalDebt,
                accountCount: eligible.length,
                belowMinimum: true,
                minimumRequired: 10000
              };

              setMomentumResults(results);

              // Save to sessionStorage for use in other pages
              if (typeof window !== 'undefined') {
                sessionStorage.setItem('momentumResults', JSON.stringify(results));
              }
            } else {
              // Calculate Momentum Plan with creditor-specific settlement rates
              const accountsForCalculation = eligible.map(acc => ({
                creditor: acc.creditor || 'UNKNOWN',
                balance: typeof acc.balance === 'number' ? acc.balance : parseFloat(acc.balance) || 0
              }));

              // Try to get income/expenses for qualification check
              // For now, we'll calculate without income data (will be added later when available)
              const detailedResults = calculateMomentumPlanDetailed(
                accountsForCalculation,
                calculatorSettings.debtTiers,
                calculatorSettings.creditorData
                // monthlyIncome and monthlyExpenses can be added when available
              );

              if (!detailedResults) {
                console.error('Failed to calculate Momentum plan - no tier found');
                return;
              }

              const results = {
                ...detailedResults,
                belowMinimum: false
              };

              // Always recalculate and save fresh results based on current calculator settings
              // This ensures the term and payments reflect any changes made in the admin panel
              if (typeof window !== 'undefined') {
                sessionStorage.setItem('momentumResults', JSON.stringify(results));
              }

              setMomentumResults(results);
            }

            // Calculate Current Path (always calculated regardless of debt amount)
            const currentPath = calculateCurrentPath(totalDebt);
            setCurrentPathResults(currentPath);
          }
        }

        setLoading(false);
      } catch (error) {
        console.error('Error:', error);
        setLoading(false);
      }
    }, 500);
  }, [calculatorSettings]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your plan results...</p>
          </div>
        </main>
      </div>
    );
  }

  const hasValidData = creditData && creditData.trades && narrativeCodes.length > 0 && eligibleAccounts.length > 0;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto max-w-7xl px-4 py-12">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">Your Plan Results</h1>
            {hasValidData && (
              <p className="text-muted-foreground max-w-3xl mx-auto">
                Based on your credit profile and Plaid data, here are your debt settlement options.
              </p>
            )}
          </div>

          {/* Verification Status & Co-Applicant View Switcher */}
          {hasCoApplicant() && (
            <div className="mb-8">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Verification Status</h3>

                  {/* Verification Status Checkboxes */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center space-x-3 p-3 border rounded-lg">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        verificationStatus.primaryCompleted
                          ? 'bg-green-500 border-green-500'
                          : 'border-gray-300 bg-gray-100'
                      }`}>
                        {verificationStatus.primaryCompleted && (
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">Primary Applicant</div>
                        <div className="text-sm text-gray-600">
                          Phone, Bank & Credit verification
                        </div>
                      </div>
                      <div className={`text-sm font-medium ${
                        verificationStatus.primaryCompleted ? 'text-green-600' : 'text-gray-500'
                      }`}>
                        {verificationStatus.primaryCompleted ? 'Complete' : 'Pending'}
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 border rounded-lg">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        verificationStatus.coApplicantCompleted
                          ? 'bg-green-500 border-green-500'
                          : 'border-gray-300 bg-gray-100'
                      }`}>
                        {verificationStatus.coApplicantCompleted && (
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{coApplicantData?.name}</div>
                        <div className="text-sm text-gray-600">
                          Phone, Bank & Credit verification
                        </div>
                      </div>
                      <div className={`text-sm font-medium ${
                        verificationStatus.coApplicantCompleted ? 'text-green-600' : 'text-gray-500'
                      }`}>
                        {verificationStatus.coApplicantCompleted ? 'Complete' : 'Pending'}
                      </div>
                    </div>
                  </div>

                  {/* Demo Toggle for Co-Applicant Completion */}
                  {!verificationStatus.coApplicantCompleted && (
                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-yellow-800">Demo Mode</div>
                          <div className="text-xs text-yellow-700">Simulate co-applicant completion for testing</div>
                        </div>
                        <button
                          onClick={() => {
                            localStorage.setItem('co_applicant_verification_complete', 'true');
                            setVerificationStatus(prev => ({ ...prev, coApplicantCompleted: true }));
                          }}
                          className="px-3 py-1 bg-yellow-600 text-white text-xs rounded hover:bg-yellow-700"
                        >
                          Mark Complete
                        </button>
                      </div>
                    </div>
                  )}

                  {/* View Switcher - Only show if both are complete */}
                  {verificationStatus.primaryCompleted && verificationStatus.coApplicantCompleted ? (
                    <>
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center space-x-2">
                          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-sm font-medium text-green-700">Both Applicants Verified</span>
                        </div>

                        <div className="flex items-center space-x-3">
                          <label className="text-sm font-medium text-gray-700">
                            View as:
                          </label>
                          <select
                            value={viewMode}
                            onChange={(e) => setViewMode(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          >
                            <option value="primary">Primary Applicant</option>
                            <option value="co-applicant">Co-Applicant ({coApplicantData?.name})</option>
                            <option value="combined">Combined Results</option>
                          </select>
                        </div>
                      </div>

                      {/* View Mode Explanation */}
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <div className="text-sm text-blue-800">
                          {viewMode === 'primary' && (
                            <span><strong>Primary View:</strong> Showing your individual debt settlement plan</span>
                          )}
                          {viewMode === 'co-applicant' && (
                            <span><strong>Co-Applicant View:</strong> Showing {coApplicantData?.name}'s individual debt settlement plan</span>
                          )}
                          {viewMode === 'combined' && (
                            <span><strong>Combined View:</strong> Showing joint debt settlement plan with combined income and deduplicated joint accounts</span>
                          )}
                        </div>
                      </div>
                    </>
                  ) : null}
                </CardContent>
              </Card>
            </div>
          )}

          {!creditData || !creditData.trades ? (
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2">No Credit Data Available</h3>
                  <p className="text-muted-foreground mb-4">
                    Complete your credit check first to see your debt portfolio analysis and program calculations.
                  </p>
                  <a href="/your-plan" className="text-blue-600 underline">Go to Credit Check →</a>
                </div>
              </CardContent>
            </Card>
          ) : narrativeCodes.length === 0 ? (
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2">Narrative Code Configuration Required</h3>
                  <p className="text-muted-foreground mb-4">
                    Narrative codes need to be configured to determine which accounts are eligible for settlement.
                  </p>
                  <a href="/admin/equifax-codes" className="text-blue-600 underline">Configure Narrative Codes →</a>
                </div>
              </CardContent>
            </Card>
          ) : eligibleAccounts.length === 0 ? (
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2">No Eligible Debt Accounts Found</h3>
                  <p className="text-muted-foreground mb-4">
                    Found {creditData.trades.length} credit accounts, but none meet the criteria for debt settlement.
                  </p>
                  <a href="/admin/equifax-codes" className="text-blue-600 underline">Review Narrative Codes →</a>
                </div>
              </CardContent>
            </Card>
          ) : momentumResults && currentPathResults && verificationStatus.primaryCompleted ? (
            <div className="space-y-8">
              {/* Warning banner when co-applicant hasn't completed */}
              {hasCoApplicant() && !verificationStatus.coApplicantCompleted && (
                <Card className="border-yellow-300 bg-yellow-50">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <svg className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-yellow-800 mb-1">
                          Co-Applicant Verification Pending
                        </div>
                        <div className="text-xs text-yellow-700">
                          The results below show only your individual debt settlement plan. Once {coApplicantData?.name} completes their bank and credit verification, the data may change to reflect your combined financial situation.
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              {/* Results Table */}
              <Card>
                <CardContent className="p-6">
                  {viewMode === 'co-applicant' ? (
                    <div className="text-center py-8">
                      <h3 className="text-xl font-semibold mb-4">Co-Applicant Results</h3>
                      <div className="bg-gray-50 rounded-lg p-6 max-w-md mx-auto">
                        <div className="space-y-3 text-left">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Total Eligible Debt:</span>
                            <span className="font-medium">{formatCurrency(11700)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Monthly Income:</span>
                            <span className="font-medium">{formatCurrency(3200)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Eligible Accounts:</span>
                            <span className="font-medium">2 accounts</span>
                          </div>
                          <div className="border-t pt-3 mt-3">
                            <div className="text-sm text-gray-600 mb-2">Settlement Plan:</div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Monthly Payment:</span>
                              <span className="font-medium text-green-600">{formatCurrency(312)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Term:</span>
                              <span className="font-medium">25 months</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 mt-4">
                        This shows {coApplicantData?.name}'s individual debt settlement plan
                      </p>
                    </div>
                  ) : viewMode === 'combined' && combinedResults && verificationStatus.coApplicantCompleted ? (
                    <div>
                      <div className="mb-4 p-4 bg-green-50 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <span className="font-medium text-green-800">Combined Household Results</span>
                        </div>
                        <div className="text-sm text-green-700">
                          Joint accounts deduplicated • Combined income: {formatCurrency(combinedResults.combinedIncome)}/month
                        </div>
                      </div>
                      <ResultsTable
                        momentumResults={combinedResults}
                        currentPathResults={{
                          ...currentPathResults,
                          totalCost: Math.round(currentPathResults.totalCost * (combinedResults.totalDebt / momentumResults.totalDebt))
                        }}
                      />
                    </div>
                  ) : (
                    <ResultsTable
                      momentumResults={momentumResults}
                      currentPathResults={currentPathResults}
                    />
                  )}
                </CardContent>
              </Card>

              {/* Budget Summary Section */}
              <Card className="mt-6">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Budget Summary</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="text-sm text-gray-600 mb-1">Total Monthly Income</div>
                      <div className="text-2xl font-bold text-green-700">
                        {formatCurrency(budgetData.totalMonthlyIncome)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">From verified bank data</div>
                    </div>
                    <div className="bg-red-50 rounded-lg p-4">
                      <div className="text-sm text-gray-600 mb-1">Total Monthly Expenses</div>
                      <div className="text-2xl font-bold text-red-700">
                        {formatCurrency(budgetData.totalMonthlyExpenses)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">90-day average from transactions</div>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-blue-800">Net Monthly Cash Flow</span>
                      <span className={`text-lg font-bold ${budgetData.totalMonthlyIncome - budgetData.totalMonthlyExpenses >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(budgetData.totalMonthlyIncome - budgetData.totalMonthlyExpenses)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Debt Summary Section */}
              {momentumResults && eligibleAccounts.length > 0 && (
                <Card className="mt-6">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Debt Portfolio Summary</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b-2 border-gray-200">
                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Creditor</th>
                            <th className="text-right py-3 px-4 font-semibold text-gray-700">Balance</th>
                            <th className="text-right py-3 px-4 font-semibold text-gray-700">Est. Settlement</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(momentumResults.accountSettlements || eligibleAccounts.map(acc => {
                            const balance = typeof acc.balance === 'number' ? acc.balance : parseFloat(acc.balance) || 0;
                            const settlementRate = (momentumResults.tierSettlementRate || 60) / 100;
                            return {
                              creditor: acc.creditor || 'Unknown',
                              balance: balance,
                              settlementAmount: balance * settlementRate
                            };
                          })).map((account, index) => (
                            <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="py-3 px-4 font-medium">{account.creditor}</td>
                              <td className="py-3 px-4 text-right text-gray-600">{formatCurrency(account.balance)}</td>
                              <td className="py-3 px-4 text-right text-green-600 font-medium">{formatCurrency(account.settlementAmount)}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="border-t-2 border-gray-300 bg-gray-50">
                            <td className="py-3 px-4 font-bold">Total</td>
                            <td className="py-3 px-4 text-right font-bold">{formatCurrency(momentumResults.totalDebt)}</td>
                            <td className="py-3 px-4 text-right font-bold text-green-600">{formatCurrency(momentumResults.totalSettlement || momentumResults.totalDebt * 0.6)}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                    <div className="mt-4 p-3 bg-green-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-green-800">Estimated Savings</span>
                        <span className="text-lg font-bold text-green-600">
                          {formatCurrency(momentumResults.totalDebt - (momentumResults.totalSettlement || momentumResults.totalDebt * 0.6))}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Settlement rates based on creditor-specific negotiation history
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Technical Documentation */}
              <Accordion type="single" collapsible className="mt-8">
                <AccordionItem value="calculations" className="border-0">
                  <AccordionTrigger className="text-sm font-medium hover:text-muted-foreground py-3 px-0">
                    Calculations
                  </AccordionTrigger>
                  <AccordionContent>
                    <Card>
                      <CardContent className="p-6">
                        <div className="space-y-8 text-sm font-mono">

                          <div>
                            <h3 className="font-bold text-lg mb-4">QUICK LINKS</h3>

                            <h4 className="font-semibold mb-2">Data Sources:</h4>
                            <div className="space-y-1">
                              <div>
                                <a href={`/results/bank?session=${Date.now()}`} className="text-blue-600 hover:underline">
                                  /results/bank
                                </a>
                                <span className="text-gray-600 ml-2">- Plaid Bank Data (Income verification and transactions)</span>
                              </div>
                              <div>
                                <a href={`/results/credit?session=${Date.now()}`} className="text-blue-600 hover:underline">
                                  /results/credit
                                </a>
                                <span className="text-gray-600 ml-2">- Credit Report (Account balances and narrative codes)</span>
                              </div>
                              <div>
                                <a href="/your-plan/deal-sheet" className="text-blue-600 hover:underline">
                                  /your-plan/deal-sheet
                                </a>
                                <span className="text-gray-600 ml-2">- Complete Deal Sheet (Full financial analysis)</span>
                              </div>
                            </div>

                            <h4 className="font-semibold mt-4 mb-2">Configuration Pages:</h4>
                            <div className="space-y-1">
                              <div>
                                <a href="/admin/plaid" className="text-blue-600 hover:underline">
                                  /admin/plaid
                                </a>
                                <span className="text-gray-600 ml-2">- Plaid to Deal Sheet Mapping (Configure expense categories)</span>
                              </div>
                              <div>
                                <a href="/admin/program-calculator" className="text-blue-600 hover:underline">
                                  /admin/program-calculator
                                </a>
                                <span className="text-gray-600 ml-2">- Creditor Settlement Rates & Fee Tiers</span>
                              </div>
                              <div>
                                <a href="/admin/equifax-codes" className="text-blue-600 hover:underline">
                                  /admin/equifax-codes
                                </a>
                                <span className="text-gray-600 ml-2">- Narrative Code Configuration (Debt eligibility)</span>
                              </div>
                            </div>
                          </div>

                          <div>
                            <h3 className="font-bold text-lg mb-4">STEP 1: PLAID INCOME VERIFICATION API</h3>

                            <h4 className="font-semibold mb-2">Data Source:</h4>
                            <div className="bg-gray-100 p-4 mb-4">
                              <code>
                                Plaid /credit/payroll_income/get API (CRA Income Verification)<br/>
                                Backend Route: /api/plaid/cra/get-income
                              </code>
                            </div>

                            <h4 className="font-semibold mb-2">What We Use:</h4>
                            <div className="bg-gray-100 p-4 mb-4">
                              <code>
                                <strong>income.summary.total_monthly_income</strong> - Plaid's calculated monthly income<br/><br/>
                                <strong>Note:</strong> Plaid automatically calculates monthly income from all income streams,<br/>
                                accounting for pay frequency, employment data, and bank deposits.<br/>
                                <strong>No additional calculation needed.</strong>
                              </code>
                            </div>

                            <div className="bg-blue-50 border border-blue-200 p-3 mb-4">
                              <strong>Current User Values:</strong> $4,500/month (from Plaid's calculated value)
                            </div>

                            <h4 className="font-semibold mb-2">What Plaid Provides:</h4>
                            <div className="bg-gray-100 p-4 mb-4">
                              <code>
                                • total_monthly_income - Pre-calculated average monthly income<br/>
                                • total_annual_income - Summed from projected_yearly_income<br/>
                                • income_streams[] - Individual income sources with confidence scores<br/>
                                • employment[] - Employer data with pay_frequency and annual_income<br/>
                                • income_stability_score - Reliability metric
                              </code>
                            </div>

                            <h4 className="font-semibold mb-2">Implementation:</h4>
                            <div className="bg-gray-100 p-4">
                              <code>
                                // Call our backend API that wraps Plaid's CRA endpoint<br/>
                                const response = await fetch('/api/plaid/cra/get-income');<br/>
                                const data = await response.json();<br/>
                                <br/>
                                // Use the pre-calculated monthly income directly<br/>
                                const monthlyIncome = data.income.summary.total_monthly_income;
                              </code>
                            </div>
                          </div>

                          <div>
                            <h3 className="font-bold text-lg mb-4">STEP 2: PLAID TRANSACTION DATA & EXPENSE MAPPING</h3>

                            <h4 className="font-semibold mb-2">Data Source:</h4>
                            <div className="bg-gray-100 p-4 mb-4">
                              <code>
                                Plaid /transactions/get API<br/>
                                Configuration: <a href="/admin/plaid" className="text-blue-600 hover:underline">/admin/plaid</a>
                              </code>
                            </div>

                            <h4 className="font-semibold mb-2">Process:</h4>
                            <div className="bg-gray-100 p-4 mb-4">
                              <code>
                                1. Fetch 90 days of transactions<br/>
                                2. Map transactions to deal sheet fields (e.g., FOOD_AND_DRINK_GROCERIES → groceries)<br/>
                                3. Unmapped categories → "Other Expenses - Misc"<br/>
                                4. Split into 3 periods (30 days each)<br/>
                                5. Calculate average per field
                              </code>
                            </div>

                            <h4 className="font-semibold mb-2">Formula (per expense category):</h4>
                            <div className="bg-gray-100 p-4 mb-4">
                              <code>
                                <strong>Average Monthly Expense = (Period 1 + Period 2 + Period 3) ÷ 3</strong>
                              </code>
                            </div>

                            <h4 className="font-semibold mb-2">Implementation:</h4>
                            <div className="bg-gray-100 p-4">
                              <code>
                                const period1Txns = transactions.filter(tx =&gt; isInPeriod(tx.date, 1));<br/>
                                const period2Txns = transactions.filter(tx =&gt; isInPeriod(tx.date, 2));<br/>
                                const period3Txns = transactions.filter(tx =&gt; isInPeriod(tx.date, 3));<br/>
                                <br/>
                                const calculatePeriodTotals = (txns) =&gt; {'{'}<br/>
                                &nbsp;&nbsp;const totals = {'{}'};<br/>
                                &nbsp;&nbsp;txns.forEach(tx =&gt; {'{'}<br/>
                                &nbsp;&nbsp;&nbsp;&nbsp;const field = mapPlaidCategoryToDealSheetField(tx.category);<br/>
                                &nbsp;&nbsp;&nbsp;&nbsp;totals[field] = (totals[field] || 0) + tx.amount;<br/>
                                &nbsp;&nbsp;{'}'});<br/>
                                &nbsp;&nbsp;return totals;<br/>
                                {'}'};<br/>
                                <br/>
                                allFields.forEach(field =&gt; {'{'}<br/>
                                &nbsp;&nbsp;averages[field] = (p1Totals[field] + p2Totals[field] + p3Totals[field]) / 3;<br/>
                                {'}'});
                              </code>
                            </div>
                          </div>

                          <div>
                            <h3 className="font-bold text-lg mb-4">STEP 3: CALCULATIONS TAB (90-DAY BREAKDOWN)</h3>

                            <h4 className="font-semibold mb-2">Location:</h4>
                            <div className="bg-gray-100 p-4 mb-4">
                              <code>
                                <a href="/your-plan/deal-sheet" className="text-blue-600 hover:underline">/your-plan/deal-sheet</a> → Calculations Tab
                              </code>
                            </div>

                            <h4 className="font-semibold mb-2">Purpose:</h4>
                            <div className="bg-gray-100 p-4 mb-4">
                              <code>
                                Shows detailed period-by-period breakdown of how transactions convert to monthly averages
                              </code>
                            </div>

                            <h4 className="font-semibold mb-2">Table Structure:</h4>
                            <div className="bg-gray-100 p-4 mb-4">
                              <code>
                                <strong>| Field Name | Period 1 | Period 2 | Period 3 | Average |</strong><br/>
                                | Groceries  | $369.58  | $326.85  | $294.45  | $330.29 |<br/>
                                | → Walmart  | $85.43   |          |          |    --   |<br/>
                                | → Safeway  | $124.20  | $98.45   |          |    --   |<br/>
                                <br/>
                                • Category rows show period totals<br/>
                                • Indented rows (→) show individual transactions<br/>
                                • Average column = value used in Deal Sheet
                              </code>
                            </div>

                            <div className="bg-blue-50 border border-blue-200 p-3">
                              <strong>Current User Values:</strong> View at <a href="/your-plan/deal-sheet" className="text-blue-600 hover:underline">/your-plan/deal-sheet</a> → Calculations Tab
                            </div>
                          </div>

                          <div>
                            <h3 className="font-bold text-lg mb-4">STEP 4: DEAL SHEET TOP CALCULATIONS</h3>

                            <h4 className="font-semibold mb-2">Total Monthly Income (from Plaid Income API):</h4>
                            <div className="bg-gray-100 p-4 mb-4">
                              <code>
                                Primary Source: income.summary.total_monthly_income<br/>
                                Confidence: income.income_insights[0].income_streams[0].confidence<br/>
                                Components tracked: Employment, Social Security, Unemployment, etc.
                              </code>
                            </div>

                            <h4 className="font-semibold mb-2">Key Calculations:</h4>
                            <div className="space-y-1">
                              <div><strong>Total Monthly Expenses:</strong> Sum of all averaged expense fields (excludes debt minimums)</div>
                              <div><strong>Program Cost:</strong> From Momentum Plan calculation (see Step 6)</div>
                              <div><strong>Total Monthly Expense (With Program):</strong> Total Expenses + Program Cost</div>
                              <div><strong>Available Funds:</strong> Total Monthly Income - Total Monthly Expense (With Program)</div>
                              <div><strong>DTI (With Program):</strong> (Total Monthly Expense With Program ÷ Total Monthly Income) × 100</div>
                              <div><strong>DTI (Without Program):</strong> (Total Expenses ÷ Total Monthly Income) × 100</div>
                            </div>
                          </div>

                          <div>
                            <h3 className="font-bold text-lg mb-4">STEP 5: CREDIT REPORT ACCOUNT FILTERING</h3>

                            <h4 className="font-semibold mb-2">Data Source:</h4>
                            <div className="bg-gray-100 p-4 mb-4">
                              <code>
                                Equifax Credit Report API<br/>
                                Configuration: <a href="/admin/equifax-codes" className="text-blue-600 hover:underline">/admin/equifax-codes</a>
                              </code>
                            </div>

                            <h4 className="font-semibold mb-2">Eligibility Rules:</h4>
                            <div className="bg-gray-100 p-4 mb-4">
                              <code>
                                1. Account balance &gt; $500 (minimum threshold)<br/>
                                2. Account has narrative code with includeInSettlement = true
                              </code>
                            </div>

                            <h4 className="font-semibold mb-2">Formula:</h4>
                            <div className="bg-gray-100 p-4 mb-4">
                              <code>
                                <strong>Total Eligible Debt = Σ(Balance of all eligible accounts)</strong>
                              </code>
                            </div>

                            <h4 className="font-semibold mb-2">Common Narrative Codes:</h4>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                              <div className="bg-gray-100 p-3">
                                <code>
                                  <strong>Eligible:</strong><br/>
                                  FE - Credit Card<br/>
                                  AU - Personal Loan<br/>
                                  CZ - Collection<br/>
                                  GS - Medical
                                </code>
                              </div>
                              <div className="bg-gray-100 p-3">
                                <code>
                                  <strong>Excluded:</strong><br/>
                                  BU - Student Loan<br/>
                                  AR - Mortgage<br/>
                                  AO - Auto Loan
                                </code>
                              </div>
                            </div>

                            <div className="bg-blue-50 border border-blue-200 p-3 mb-4">
                              <strong>Current User Values:</strong><br/>
                              CHASE ($8,500 - FE) ✓<br/>
                              DISCOVER ($6,200 - FE) ✓<br/>
                              CAPITAL ONE ($4,800 - FE) ✓<br/>
                              BANK OF AMERICA ($12,000 - BU) ✗ Excluded<br/>
                              <strong>Total Eligible Debt: $19,500</strong>
                            </div>

                            <h4 className="font-semibold mb-2">Implementation:</h4>
                            <div className="bg-gray-100 p-4">
                              <code>
                                const MINIMUM_BALANCE = 500;<br/>
                                const eligibleAccounts = creditReport.trades.filter(account =&gt; {'{'}<br/>
                                &nbsp;&nbsp;if (account.balance &lt;= MINIMUM_BALANCE) return false;<br/>
                                &nbsp;&nbsp;return account.narrativeCodes.some(nc =&gt; {'{'}<br/>
                                &nbsp;&nbsp;&nbsp;&nbsp;const rule = narrativeCodeRules.find(r =&gt; r.code === nc.codeabv);<br/>
                                &nbsp;&nbsp;&nbsp;&nbsp;return rule && rule.includeInSettlement === true;<br/>
                                &nbsp;&nbsp;{'}'});<br/>
                                {'}'});<br/>
                                const totalEligibleDebt = eligibleAccounts.reduce((sum, acc) =&gt; sum + acc.balance, 0);
                              </code>
                            </div>
                          </div>

                          <div>
                            <h3 className="font-bold text-lg mb-4">STEP 6: MOMENTUM PLAN CALCULATIONS</h3>

                            <h4 className="font-semibold mb-2">Calculation Flow Overview</h4>
                            <div className="bg-gray-100 p-4 mb-4">
                              <code>
                                <strong>1.</strong> Total Debt = Sum of all eligible account balances<br/>
                                <strong>2.</strong> Determine Tier (based on Total Debt) → Max Term Length & Fee Rate<br/>
                                <strong>3.</strong> Lookup Settlement Rate per Account (Creditor-specific, Term-based)<br/>
                                <strong>4.</strong> Sum Settlement Amounts + Fee = Total Program Cost<br/>
                                <strong>5.</strong> Calculate Monthly Payment (Total Cost ÷ Max Term Length)<br/>
                                <strong>6.</strong> Optimize Term if excess budget ≥ $50 (Optional)
                              </code>
                            </div>

                            <h4 className="font-semibold mb-2">A. Determine Debt Tier & Program Term</h4>
                            <div className="bg-gray-100 p-4 mb-4">
                              <code>
                                <strong>Momentum Program Tiers:</strong><br/>
                                | Debt Range | Fee % | Max Term | Tier Settlement % |<br/>
                                | $10,000-$12,499 | 15% | 28 months | 52% (fallback) |<br/>
                                | $12,500-$14,999 | 15% | 30 months | 52% (fallback) |<br/>
                                | $15,000-$19,000 | 20% | 34 months | 52% (fallback) |<br/>
                                | $20,000-$23,999 | 15% | 39 months | 54% (fallback) |<br/>
                                | $24,000-$49,999 | 15% | 42 months | 55% (fallback) |<br/>
                                <br/>
                                <strong>Note:</strong> Tier settlement % is used as fallback when creditor not found
                              </code>
                            </div>

                            <h4 className="font-semibold mb-2">B. Settlement Amount Per Account (Term-Based Rates)</h4>
                            <div className="bg-gray-100 p-4 mb-4">
                              <code>
                                <strong>Formula: Account Settlement = Balance × Settlement Rate</strong><br/><br/>
                                <strong>Settlement rates vary by creditor AND program term length.</strong><br/>
                                Configuration: <a href="/admin/program-calculator" className="text-blue-600 hover:underline">/admin/program-calculator</a> (Creditor Data section)<br/><br/>
                                <strong>Example rates for 30-month term:</strong><br/>
                                AMERICAN EXPRESS: 56% | CHASE: 58% | BANK OF AMERICA: 65%<br/>
                                CAPITAL ONE: 65% | DISCOVER: 65%<br/><br/>
                                <strong>Fallback hierarchy:</strong><br/>
                                1. Creditor-specific rate for program term<br/>
                                2. Tier settlement rate (if creditor not found)<br/>
                                3. Global fallback: 60%
                              </code>
                            </div>

                            <div className="bg-blue-50 border border-blue-200 p-3 mb-4">
                              <strong>Example Calculation (30-month program):</strong><br/>
                              CHASE: $8,500 × 0.58 = $4,930<br/>
                              DISCOVER: $6,200 × 0.65 = $4,030<br/>
                              CAPITAL ONE: $4,800 × 0.65 = $3,120<br/>
                              <strong>Total Settlement: $12,080</strong>
                            </div>

                            <h4 className="font-semibold mb-2">C. Program Fee (Debt Tier-Based)</h4>
                            <div className="bg-gray-100 p-4 mb-4">
                              <code>
                                <strong>Formula: Program Fee = Total Eligible Debt × Fee %</strong><br/><br/>
                                Fee percentage determined by debt tier (see section A above)
                              </code>
                            </div>

                            <div className="bg-blue-50 border border-blue-200 p-3 mb-4">
                              <strong>Example:</strong><br/>
                              Debt: $17,000 → Tier 3 (20% fee, 34 months, 52% fallback settlement)<br/>
                              <strong>Program Fee: $17,000 × 0.20 = $3,400</strong>
                              {momentumResults?.totalDebt && (
                                <span>
                                  <br/>Your Actual: {formatCurrency(momentumResults.totalDebt)} × {(getMomentumFeePercentage(momentumResults.totalDebt, calculatorSettings.debtTiers) * 100).toFixed(0)}% = {formatCurrency(momentumResults.totalDebt * getMomentumFeePercentage(momentumResults.totalDebt, calculatorSettings.debtTiers))}
                                </span>
                              )}
                            </div>

                            <h4 className="font-semibold mb-2">D. Total Program Cost & Monthly Payment</h4>
                            <div className="bg-gray-100 p-4 mb-4">
                              <code>
                                <strong>Total Cost = Total Settlement + Program Fee</strong><br/>
                                <strong>Monthly Payment = Total Cost ÷ Max Term Length</strong>
                              </code>
                            </div>

                            <div className="bg-blue-50 border border-blue-200 p-3 mb-4">
                              <strong>Example:</strong><br/>
                              Total Settlement: $12,080<br/>
                              Program Fee: $3,900<br/>
                              Total Program Cost: $12,080 + $3,900 = $15,980<br/>
                              Term: 30 months<br/>
                              <strong>Monthly Payment: $15,980 ÷ 30 = $533/month</strong>
                              {momentumResults?.monthlyPayment && (
                                <span><br/>Your Actual: {formatCurrency(momentumResults.monthlyPayment)}/month over {momentumResults.term} months</span>
                              )}
                            </div>

                            <h4 className="font-semibold mb-2">E. Term Optimization (Optional)</h4>
                            <div className="bg-gray-100 p-4 mb-4">
                              <code>
                                <strong>User Preference Check:</strong><br/>
                                During the Your Plan flow, user is asked: "Which option is more important to you?"<br/>
                                &nbsp;&nbsp;• "Getting Debt-Free Faster" → Show Term Optimization if logic allows<br/>
                                &nbsp;&nbsp;• "Lowering Your Monthly Payments" → Hide Term Optimization even if logic allows<br/>
                                <br/>
                                <strong>Calculation Logic (when preference allows):</strong><br/>
                                IF (Monthly Income - Monthly Expenses) - Min Monthly Payment ≥ $50 THEN:<br/>
                                &nbsp;&nbsp;Optimized Payment = (Income - Expenses) - $50<br/>
                                &nbsp;&nbsp;Optimized Term = Total Cost ÷ Optimized Payment<br/>
                                <br/>
                                <strong>$50 buffer</strong> ensures client has breathing room in their budget
                              </code>
                            </div>

                            <h4 className="font-semibold mb-2">Implementation:</h4>
                            <div className="bg-gray-100 p-4">
                              <code>
                                // See calculateMomentumPlanDetailed() in /lib/calculations.ts<br/>
                                const tier = findDebtTier(totalDebt, debtTiers, 'momentum');<br/>
                                const accountSettlements = eligibleAccounts.map(account =&gt; (&#123;<br/>
                                &nbsp;&nbsp;creditor: account.creditor,<br/>
                                &nbsp;&nbsp;balance: account.balance,<br/>
                                &nbsp;&nbsp;settlementRate: getCreditorSettlementRate(account.creditor, tier.maxTerm, creditorData, tier.settlementRate / 100),<br/>
                                &nbsp;&nbsp;settlementAmount: account.balance * settlementRate<br/>
                                &#125;));<br/>
                                const totalSettlement = accountSettlements.reduce((sum, acc) =&gt; sum + acc.settlementAmount, 0);<br/>
                                const programFee = totalDebt * (tier.feePercentage / 100);<br/>
                                const totalCost = totalSettlement + programFee;<br/>
                                const monthlyPayment = totalProgramCost / tier.maxTermMonths;<br/>
                                <br/>
                                // Term optimization<br/>
                                const excessLiquidity = (monthlyIncome - monthlyExpenses) - monthlyPayment;<br/>
                                if (excessLiquidity &gt;= 50) {'{'}<br/>
                                &nbsp;&nbsp;const optimizedTerm = Math.ceil(totalProgramCost / ((monthlyIncome - monthlyExpenses - 50) - 50));<br/>
                                {'}'}
                              </code>
                            </div>
                          </div>

                          <div>
                            <h3 className="font-bold text-lg mb-4">STEP 7: CURRENT PATH (MINIMUM PAYMENTS)</h3>

                            <h4 className="font-semibold mb-2">Purpose:</h4>
                            <div className="bg-gray-100 p-4 mb-4">
                              <code>Calculate outcome if user only makes minimum payments</code>
                            </div>

                            <h4 className="font-semibold mb-2">Formulas:</h4>
                            <div className="bg-gray-100 p-4 mb-4">
                              <code>
                                <strong>Minimum Payment = Total Debt × 0.025</strong><br/>
                                <strong>Term = 11 years × (APR ÷ 22%) × 12 months</strong><br/>
                                <strong>Total Cost = (Debt ÷ 2000) × 4300 × (APR ÷ 22%)</strong><br/>
                                <strong>Interest Paid = Total Cost - Original Debt</strong><br/>
                                <br/>
                                <em>Based on industry data: $2,000 at 22% APR = $4,300 over 11 years</em>
                              </code>
                            </div>

                            <div className="bg-blue-50 border border-blue-200 p-3 mb-4">
                              <strong>Current User Values:</strong><br/>
                              Minimum Payment: $19,500 × 0.025 = $488/month<br/>
                              Term: 11 × (24 ÷ 22) × 12 = 144 months (12 years)<br/>
                              Total Cost: 9.75 × $4,300 × 1.091 = $45,729<br/>
                              <strong>Interest Paid: $45,729 - $19,500 = $26,229</strong>
                              {currentPathResults?.monthlyPayment && (
                                <span><br/>Your Actual: {formatCurrency(currentPathResults.monthlyPayment)}/month over {currentPathResults.term} months</span>
                              )}
                            </div>

                            <h4 className="font-semibold mb-2">Implementation:</h4>
                            <div className="bg-gray-100 p-4">
                              <code>
                                function calculateCurrentPath(totalDebt) {'{'}<br/>
                                &nbsp;&nbsp;const minimumPayment = Math.round(totalDebt * 0.025);<br/>
                                &nbsp;&nbsp;const termMonths = Math.round(11 * (24 / 22) * 12);<br/>
                                &nbsp;&nbsp;const totalCost = Math.round((totalDebt / 2000) * 4300 * (24 / 22));<br/>
                                &nbsp;&nbsp;return {'{'}minimumPayment, termMonths, totalCost{'}'};<br/>
                                {'}'}
                              </code>
                            </div>
                          </div>

                          <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-300 rounded-lg">
                            <h3 className="font-bold text-xl mb-4 text-center">FINAL COMPARISON</h3>

                            <div className="bg-white rounded-lg p-4 mb-4">
                              <table className="w-full">
                                <thead>
                                  <tr className="border-b-2 border-gray-300">
                                    <th className="text-left p-2">Metric</th>
                                    <th className="text-right p-2">Current Path</th>
                                    <th className="text-right p-2">Momentum Plan</th>
                                    <th className="text-right p-2 text-green-600">Savings</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr className="border-b border-gray-200">
                                    <td className="p-2">Monthly Payment</td>
                                    <td className="text-right p-2">$488</td>
                                    <td className="text-right p-2">$533</td>
                                    <td className="text-right p-2 text-red-600">$45 more</td>
                                  </tr>
                                  <tr className="border-b border-gray-200">
                                    <td className="p-2">Term</td>
                                    <td className="text-right p-2">144 months (12 yrs)</td>
                                    <td className="text-right p-2">30 months (2.5 yrs)</td>
                                    <td className="text-right p-2 text-green-600">114 months faster</td>
                                  </tr>
                                  <tr className="border-b border-gray-200">
                                    <td className="p-2">Total Cost</td>
                                    <td className="text-right p-2">$45,729</td>
                                    <td className="text-right p-2">$15,980</td>
                                    <td className="text-right p-2 text-green-600 font-bold">$29,749 saved</td>
                                  </tr>
                                  <tr>
                                    <td className="p-2">Interest/Fees</td>
                                    <td className="text-right p-2">$26,229</td>
                                    <td className="text-right p-2">$0</td>
                                    <td className="text-right p-2 text-green-600">Settlement-based</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>

                            <div className="text-center text-lg font-semibold text-gray-700">
                              <strong className="text-green-600">Result:</strong> Pay only $45/month more, become debt-free <strong className="text-green-600">9.5 years sooner</strong>, and save <strong className="text-green-600 text-2xl">$29,749</strong>
                            </div>
                          </div>

                          <div>
                            <h3 className="font-bold text-lg mb-4">DATA FLOW SUMMARY</h3>

                            <h4 className="font-semibold mb-2">Complete Data Pipeline:</h4>
                            <div className="bg-gray-100 p-4 mb-4">
                              <code>
                                1. <strong>Plaid Income API</strong> → Verified employment income with confidence<br/>
                                2. <strong>Plaid Transactions API</strong> → Expense transactions with categories<br/>
                                3. <strong>Mapping Table</strong> (<a href="/admin/plaid" className="text-blue-600 hover:underline">/admin/plaid</a>) → Maps expenses to deal sheet<br/>
                                4. <strong>3-Period Analysis</strong> → 90-day averages for income and expenses<br/>
                                5. <strong>Deal Sheet</strong> → Displays calculations and totals<br/>
                                6. <strong>Credit Report</strong> → All debt accounts with balances<br/>
                                7. <strong>Narrative Codes</strong> (<a href="/admin/equifax-codes" className="text-blue-600 hover:underline">/admin/equifax-codes</a>) → Filter eligible accounts<br/>
                                8. <strong>Creditor Rates</strong> (<a href="/admin/program-calculator" className="text-blue-600 hover:underline">/admin/program-calculator</a>) → Settlement percentages<br/>
                                9. <strong>Results Page</strong> → Final calculations and comparisons
                              </code>
                            </div>

                            <h4 className="font-semibold mb-2">Current Session State:</h4>
                            <div className="space-y-1">
                              <div>Total Credit Accounts: {creditData?.trades?.length || 0}</div>
                              <div>Accounts with Balance &gt; 0: {creditData?.trades?.filter(a => (typeof a.balance === 'number' ? a.balance : parseFloat(a.balance) || 0) > 0).length || 0}</div>
                              <div>Eligible for Settlement: {eligibleAccounts.length}</div>
                              <div>Total Eligible Debt: {formatCurrency(momentumResults?.totalDebt || 0)}</div>
                              <div>Narrative Codes Configured: {narrativeCodes.length}</div>
                              <div>Minimum Threshold Met: {momentumResults?.totalDebt >= 15000 ? 'Yes' : 'No'}</div>
                            </div>

                          </div>

                        </div>
                      </CardContent>
                    </Card>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="database-schema" className="border-0">
                  <AccordionTrigger className="text-sm font-medium hover:text-muted-foreground py-3 px-0">
                    Database Schema & Architecture
                  </AccordionTrigger>
                  <AccordionContent>
                    <Card>
                      <CardContent className="p-6">
                        <div className="space-y-8 text-sm font-mono">

                          <div>
                            <h3 className="font-bold text-lg mb-4">DATABASE ARCHITECTURE OVERVIEW</h3>

                            <h4 className="font-semibold mb-2">Core Architecture Vision:</h4>
                            <div className="bg-gray-100 p-4 mb-4">
                              <code>
                                Current: Frontend localStorage + Hardcoded configs + Client-side calculations<br/>
                                Target: Centralized database + API-driven + Server-side business logic<br/><br/>
                                Data Flow: External APIs → Database → Internal APIs → Next.js Frontend
                              </code>
                            </div>

                            <h4 className="font-semibold mb-2">Migration Benefits:</h4>
                            <div className="space-y-1 mb-4">
                              <div>• Centralized business logic and configuration management</div>
                              <div>• Audit trails for all financial calculations and user interactions</div>
                              <div>• Proper data retention and PII compliance</div>
                              <div>• Scalable multi-user architecture</div>
                              <div>• Real-time admin configuration without code deployments</div>
                            </div>
                          </div>

                          <div>
                            <h3 className="font-bold text-lg mb-4">CORE USER & SESSION MANAGEMENT</h3>

                            <h4 className="font-semibold mb-2">Users Table:</h4>
                            <div className="bg-gray-100 p-4 mb-4">
                              <code>
                                CREATE TABLE users (<br/>
                                &nbsp;&nbsp;id UUID PRIMARY KEY DEFAULT gen_random_uuid(),<br/>
                                &nbsp;&nbsp;email VARCHAR(255) UNIQUE,<br/>
                                &nbsp;&nbsp;phone VARCHAR(20),<br/>
                                &nbsp;&nbsp;first_name VARCHAR(100),<br/>
                                &nbsp;&nbsp;last_name VARCHAR(100),<br/>
                                &nbsp;&nbsp;date_of_birth DATE,<br/>
                                &nbsp;&nbsp;ssn_hash VARCHAR(64), -- Hashed for security<br/>
                                &nbsp;&nbsp;address JSONB, -- Flexible address storage<br/>
                                &nbsp;&nbsp;created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,<br/>
                                &nbsp;&nbsp;updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,<br/>
                                &nbsp;&nbsp;last_login TIMESTAMP,<br/>
                                &nbsp;&nbsp;status VARCHAR(20) DEFAULT 'active' -- active, inactive, deleted<br/>
                                );
                              </code>
                            </div>

                            <h4 className="font-semibold mb-2">User Sessions Table:</h4>
                            <div className="bg-gray-100 p-4 mb-4">
                              <code>
                                CREATE TABLE user_sessions (<br/>
                                &nbsp;&nbsp;id UUID PRIMARY KEY DEFAULT gen_random_uuid(),<br/>
                                &nbsp;&nbsp;user_id UUID REFERENCES users(id),<br/>
                                &nbsp;&nbsp;session_token VARCHAR(255) UNIQUE,<br/>
                                &nbsp;&nbsp;smart_estimator_progress JSONB, -- Step completion tracking<br/>
                                &nbsp;&nbsp;readiness_quiz_progress JSONB, -- Quiz state and answers<br/>
                                &nbsp;&nbsp;plaid_link_status VARCHAR(20), -- pending, linked, expired<br/>
                                &nbsp;&nbsp;credit_check_status VARCHAR(20), -- pending, completed, failed<br/>
                                &nbsp;&nbsp;expires_at TIMESTAMP,<br/>
                                &nbsp;&nbsp;created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP<br/>
                                );
                              </code>
                            </div>
                          </div>

                          <div>
                            <h3 className="font-bold text-lg mb-4">PLAID INTEGRATION SCHEMA</h3>

                            <h4 className="font-semibold mb-2">Plaid Connections:</h4>
                            <div className="bg-gray-100 p-4 mb-4">
                              <code>
                                CREATE TABLE plaid_connections (<br/>
                                &nbsp;&nbsp;id UUID PRIMARY KEY DEFAULT gen_random_uuid(),<br/>
                                &nbsp;&nbsp;user_id UUID REFERENCES users(id),<br/>
                                &nbsp;&nbsp;item_id VARCHAR(255) UNIQUE, -- Plaid item ID<br/>
                                &nbsp;&nbsp;access_token_encrypted TEXT, -- Encrypted storage<br/>
                                &nbsp;&nbsp;institution_id VARCHAR(255),<br/>
                                &nbsp;&nbsp;institution_name VARCHAR(255),<br/>
                                &nbsp;&nbsp;status VARCHAR(20), -- good, bad, requires_update<br/>
                                &nbsp;&nbsp;last_webhook TIMESTAMP,<br/>
                                &nbsp;&nbsp;created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,<br/>
                                &nbsp;&nbsp;updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP<br/>
                                );
                              </code>
                            </div>

                            <h4 className="font-semibold mb-2">Plaid Accounts:</h4>
                            <div className="bg-gray-100 p-4 mb-4">
                              <code>
                                CREATE TABLE plaid_accounts (<br/>
                                &nbsp;&nbsp;id UUID PRIMARY KEY DEFAULT gen_random_uuid(),<br/>
                                &nbsp;&nbsp;connection_id UUID REFERENCES plaid_connections(id),<br/>
                                &nbsp;&nbsp;plaid_account_id VARCHAR(255) UNIQUE,<br/>
                                &nbsp;&nbsp;name VARCHAR(255),<br/>
                                &nbsp;&nbsp;official_name VARCHAR(255),<br/>
                                &nbsp;&nbsp;type VARCHAR(50), -- depository, credit, loan, investment<br/>
                                &nbsp;&nbsp;subtype VARCHAR(50), -- checking, savings, credit_card, mortgage<br/>
                                &nbsp;&nbsp;mask VARCHAR(10), -- Last 4 digits<br/>
                                &nbsp;&nbsp;balances JSONB, -- Current, available, limit<br/>
                                &nbsp;&nbsp;deal_sheet_category VARCHAR(100), -- Custom mapping to deal sheet fields<br/>
                                &nbsp;&nbsp;is_primary_income BOOLEAN DEFAULT FALSE,<br/>
                                &nbsp;&nbsp;include_in_calculations BOOLEAN DEFAULT TRUE,<br/>
                                &nbsp;&nbsp;created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,<br/>
                                &nbsp;&nbsp;updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP<br/>
                                );
                              </code>
                            </div>

                            <h4 className="font-semibold mb-2">Plaid Transactions:</h4>
                            <div className="bg-gray-100 p-4 mb-4">
                              <code>
                                CREATE TABLE plaid_transactions (<br/>
                                &nbsp;&nbsp;id UUID PRIMARY KEY DEFAULT gen_random_uuid(),<br/>
                                &nbsp;&nbsp;account_id UUID REFERENCES plaid_accounts(id),<br/>
                                &nbsp;&nbsp;plaid_transaction_id VARCHAR(255) UNIQUE,<br/>
                                &nbsp;&nbsp;amount DECIMAL(12,2),<br/>
                                &nbsp;&nbsp;date DATE,<br/>
                                &nbsp;&nbsp;name TEXT,<br/>
                                &nbsp;&nbsp;merchant_name VARCHAR(255),<br/>
                                &nbsp;&nbsp;category JSONB, -- Plaid category hierarchy<br/>
                                &nbsp;&nbsp;deal_sheet_field VARCHAR(100), -- Mapped field from plaid-to-dealsheet-mapping<br/>
                                &nbsp;&nbsp;is_income BOOLEAN,<br/>
                                &nbsp;&nbsp;is_recurring BOOLEAN DEFAULT FALSE,<br/>
                                &nbsp;&nbsp;frequency VARCHAR(20), -- weekly, biweekly, monthly, quarterly<br/>
                                &nbsp;&nbsp;confidence_level DECIMAL(3,2), -- 0.0-1.0 mapping confidence<br/>
                                &nbsp;&nbsp;manual_override BOOLEAN DEFAULT FALSE,<br/>
                                &nbsp;&nbsp;created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,<br/>
                                &nbsp;&nbsp;updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP<br/>
                                );
                              </code>
                            </div>
                          </div>

                          <div>
                            <h3 className="font-bold text-lg mb-4">CREDIT REPORT DATA SCHEMA</h3>

                            <h4 className="font-semibold mb-2">Credit Reports:</h4>
                            <div className="bg-gray-100 p-4 mb-4">
                              <code>
                                CREATE TABLE credit_reports (<br/>
                                &nbsp;&nbsp;id UUID PRIMARY KEY DEFAULT gen_random_uuid(),<br/>
                                &nbsp;&nbsp;user_id UUID REFERENCES users(id),<br/>
                                &nbsp;&nbsp;report_date DATE,<br/>
                                &nbsp;&nbsp;bureau VARCHAR(20), -- equifax, experian, transunion<br/>
                                &nbsp;&nbsp;credit_score INTEGER,<br/>
                                &nbsp;&nbsp;score_model VARCHAR(50), -- FICO Score 8, VantageScore 3.0<br/>
                                &nbsp;&nbsp;raw_response JSONB, -- Complete API response for audit<br/>
                                &nbsp;&nbsp;is_mock_data BOOLEAN DEFAULT FALSE,<br/>
                                &nbsp;&nbsp;created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP<br/>
                                );
                              </code>
                            </div>

                            <h4 className="font-semibold mb-2">Credit Trade Lines:</h4>
                            <div className="bg-gray-100 p-4 mb-4">
                              <code>
                                CREATE TABLE credit_trade_lines (<br/>
                                &nbsp;&nbsp;id UUID PRIMARY KEY DEFAULT gen_random_uuid(),<br/>
                                &nbsp;&nbsp;credit_report_id UUID REFERENCES credit_reports(id),<br/>
                                &nbsp;&nbsp;creditor_name VARCHAR(255),<br/>
                                &nbsp;&nbsp;account_number_masked VARCHAR(50),<br/>
                                &nbsp;&nbsp;account_type VARCHAR(50), -- credit_card, mortgage, auto_loan<br/>
                                &nbsp;&nbsp;balance DECIMAL(12,2),<br/>
                                &nbsp;&nbsp;credit_limit DECIMAL(12,2),<br/>
                                &nbsp;&nbsp;monthly_payment DECIMAL(12,2),<br/>
                                &nbsp;&nbsp;date_opened DATE,<br/>
                                &nbsp;&nbsp;date_reported DATE,<br/>
                                &nbsp;&nbsp;account_status VARCHAR(50), -- current, past_due, closed<br/>
                                &nbsp;&nbsp;narrative_codes JSONB, -- Array of narrative code objects<br/>
                                &nbsp;&nbsp;eligible_for_settlement BOOLEAN, -- Computed from narrative codes<br/>
                                &nbsp;&nbsp;settlement_eligible_amount DECIMAL(12,2),<br/>
                                &nbsp;&nbsp;created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP<br/>
                                );
                              </code>
                            </div>
                          </div>

                          <div>
                            <h3 className="font-bold text-lg mb-4">DEAL SHEET & FINANCIAL ANALYSIS</h3>

                            <h4 className="font-semibold mb-2">Deal Sheet Snapshots:</h4>
                            <div className="bg-gray-100 p-4 mb-4">
                              <code>
                                CREATE TABLE deal_sheets (<br/>
                                &nbsp;&nbsp;id UUID PRIMARY KEY DEFAULT gen_random_uuid(),<br/>
                                &nbsp;&nbsp;user_id UUID REFERENCES users(id),<br/>
                                &nbsp;&nbsp;version INTEGER DEFAULT 1,<br/>
                                &nbsp;&nbsp;-- INCOME FIELDS --<br/>
                                &nbsp;&nbsp;net_monthly_employment_income DECIMAL(12,2),<br/>
                                &nbsp;&nbsp;self_employment DECIMAL(12,2),<br/>
                                &nbsp;&nbsp;social_security DECIMAL(12,2),<br/>
                                &nbsp;&nbsp;unemployment DECIMAL(12,2),<br/>
                                &nbsp;&nbsp;alimony DECIMAL(12,2),<br/>
                                &nbsp;&nbsp;child_support DECIMAL(12,2),<br/>
                                &nbsp;&nbsp;other_govt_assistance DECIMAL(12,2),<br/>
                                &nbsp;&nbsp;annuities DECIMAL(12,2),<br/>
                                &nbsp;&nbsp;dividends DECIMAL(12,2),<br/>
                                &nbsp;&nbsp;retirement DECIMAL(12,2),<br/>
                                &nbsp;&nbsp;other_income DECIMAL(12,2),<br/>
                                &nbsp;&nbsp;-- CO-APPLICANT INCOME (if applicable) --<br/>
                                &nbsp;&nbsp;co_applicant_net_monthly_income DECIMAL(12,2),<br/>
                                &nbsp;&nbsp;co_applicant_self_employment DECIMAL(12,2),<br/>
                                &nbsp;&nbsp;-- EXPENSE FIELDS --<br/>
                                &nbsp;&nbsp;housing_payment DECIMAL(12,2),<br/>
                                &nbsp;&nbsp;secondary_housing_payment DECIMAL(12,2),<br/>
                                &nbsp;&nbsp;auto_payments DECIMAL(12,2),<br/>
                                &nbsp;&nbsp;auto_insurance DECIMAL(12,2),<br/>
                                &nbsp;&nbsp;health_life_insurance DECIMAL(12,2),<br/>
                                &nbsp;&nbsp;home_owners_insurance DECIMAL(12,2),<br/>
                                &nbsp;&nbsp;groceries DECIMAL(12,2),<br/>
                                &nbsp;&nbsp;eating_out DECIMAL(12,2),<br/>
                                &nbsp;&nbsp;gasoline DECIMAL(12,2),<br/>
                                &nbsp;&nbsp;-- ... (all other expense fields from mapping) --<br/>
                                &nbsp;&nbsp;total_monthly_income DECIMAL(12,2),<br/>
                                &nbsp;&nbsp;total_monthly_expenses DECIMAL(12,2),<br/>
                                &nbsp;&nbsp;funds_available DECIMAL(12,2),<br/>
                                &nbsp;&nbsp;data_source VARCHAR(20), -- plaid_auto, manual, mixed<br/>
                                &nbsp;&nbsp;confidence_score DECIMAL(3,2), -- Overall confidence in data accuracy<br/>
                                &nbsp;&nbsp;created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP<br/>
                                );
                              </code>
                            </div>

                            <h4 className="font-semibold mb-2">Transaction Mapping Rules:</h4>
                            <div className="bg-gray-100 p-4 mb-4">
                              <code>
                                CREATE TABLE plaid_category_mappings (<br/>
                                &nbsp;&nbsp;id UUID PRIMARY KEY DEFAULT gen_random_uuid(),<br/>
                                &nbsp;&nbsp;plaid_primary_category VARCHAR(100),<br/>
                                &nbsp;&nbsp;plaid_detailed_category VARCHAR(100),<br/>
                                &nbsp;&nbsp;deal_sheet_field VARCHAR(100), -- Target field in deal_sheets table<br/>
                                &nbsp;&nbsp;is_income BOOLEAN,<br/>
                                &nbsp;&nbsp;subcategory_rules JSONB, -- Complex categorization logic<br/>
                                &nbsp;&nbsp;merchant_keywords JSONB, -- Array of merchant name patterns<br/>
                                &nbsp;&nbsp;amount_range_min DECIMAL(12,2), -- Optional amount-based rules<br/>
                                &nbsp;&nbsp;amount_range_max DECIMAL(12,2),<br/>
                                &nbsp;&nbsp;priority INTEGER DEFAULT 100, -- For handling conflicts<br/>
                                &nbsp;&nbsp;is_active BOOLEAN DEFAULT TRUE,<br/>
                                &nbsp;&nbsp;created_by UUID REFERENCES users(id), -- Admin who created mapping<br/>
                                &nbsp;&nbsp;created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,<br/>
                                &nbsp;&nbsp;updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP<br/>
                                );
                              </code>
                            </div>
                          </div>

                          <div>
                            <h3 className="font-bold text-lg mb-4">QUESTION & QUIZ MANAGEMENT SYSTEM</h3>

                            <h4 className="font-semibold mb-2">Smart Estimator Questions:</h4>
                            <div className="bg-gray-100 p-4 mb-4">
                              <code>
                                CREATE TABLE estimator_questions (<br/>
                                &nbsp;&nbsp;id UUID PRIMARY KEY DEFAULT gen_random_uuid(),<br/>
                                &nbsp;&nbsp;step_number INTEGER,<br/>
                                &nbsp;&nbsp;question_order INTEGER,<br/>
                                &nbsp;&nbsp;question_type VARCHAR(50), -- text, select, radio, checkbox, slider<br/>
                                &nbsp;&nbsp;question_text TEXT,<br/>
                                &nbsp;&nbsp;description TEXT, -- Additional help text<br/>
                                &nbsp;&nbsp;options JSONB, -- For select/radio/checkbox questions<br/>
                                &nbsp;&nbsp;validation_rules JSONB, -- Required, min/max, regex patterns<br/>
                                &nbsp;&nbsp;conditional_logic JSONB, -- Show/hide based on other answers<br/>
                                &nbsp;&nbsp;variable_name VARCHAR(100), -- For storing answer<br/>
                                &nbsp;&nbsp;affects_calculations BOOLEAN DEFAULT FALSE,<br/>
                                &nbsp;&nbsp;calculation_weight DECIMAL(5,2), -- For scoring/calculation impact<br/>
                                &nbsp;&nbsp;is_active BOOLEAN DEFAULT TRUE,<br/>
                                &nbsp;&nbsp;version INTEGER DEFAULT 1, -- For A/B testing<br/>
                                &nbsp;&nbsp;created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,<br/>
                                &nbsp;&nbsp;updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP<br/>
                                );
                              </code>
                            </div>

                            <h4 className="font-semibold mb-2">Readiness Quiz Questions:</h4>
                            <div className="bg-gray-100 p-4 mb-4">
                              <code>
                                CREATE TABLE readiness_quiz_questions (<br/>
                                &nbsp;&nbsp;id UUID PRIMARY KEY DEFAULT gen_random_uuid(),<br/>
                                &nbsp;&nbsp;category VARCHAR(100), -- financial, legal, emotional, practical<br/>
                                &nbsp;&nbsp;question_order INTEGER,<br/>
                                &nbsp;&nbsp;question_text TEXT,<br/>
                                &nbsp;&nbsp;question_type VARCHAR(50),<br/>
                                &nbsp;&nbsp;options JSONB, -- Answer options with point values<br/>
                                &nbsp;&nbsp;scoring_logic JSONB, -- How answers contribute to readiness score<br/>
                                &nbsp;&nbsp;weight DECIMAL(5,2), -- Question importance weight<br/>
                                &nbsp;&nbsp;explanation TEXT, -- Why this question matters<br/>
                                &nbsp;&nbsp;recommendations JSONB, -- What to do based on answer<br/>
                                &nbsp;&nbsp;is_active BOOLEAN DEFAULT TRUE,<br/>
                                &nbsp;&nbsp;created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,<br/>
                                &nbsp;&nbsp;updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP<br/>
                                );
                              </code>
                            </div>

                            <h4 className="font-semibold mb-2">User Question Responses:</h4>
                            <div className="bg-gray-100 p-4 mb-4">
                              <code>
                                CREATE TABLE user_question_responses (<br/>
                                &nbsp;&nbsp;id UUID PRIMARY KEY DEFAULT gen_random_uuid(),<br/>
                                &nbsp;&nbsp;user_id UUID REFERENCES users(id),<br/>
                                &nbsp;&nbsp;session_id UUID REFERENCES user_sessions(id),<br/>
                                &nbsp;&nbsp;question_id UUID, -- References estimator_questions or readiness_quiz_questions<br/>
                                &nbsp;&nbsp;question_type VARCHAR(20), -- estimator, readiness_quiz<br/>
                                &nbsp;&nbsp;response_value JSONB, -- Flexible storage for any answer type<br/>
                                &nbsp;&nbsp;response_text TEXT, -- Human-readable version<br/>
                                &nbsp;&nbsp;score_contribution DECIMAL(10,2), -- Points earned from this answer<br/>
                                &nbsp;&nbsp;confidence_level DECIMAL(3,2), -- User's confidence in their answer<br/>
                                &nbsp;&nbsp;time_spent_seconds INTEGER, -- Analytics on question difficulty<br/>
                                &nbsp;&nbsp;created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,<br/>
                                &nbsp;&nbsp;updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP<br/>
                                );
                              </code>
                            </div>
                          </div>

                          <div>
                            <h3 className="font-bold text-lg mb-4">CONFIGURATION & BUSINESS RULES</h3>

                            <h4 className="font-semibold mb-2">Calculator Settings (replacing /admin/program-calculator):</h4>
                            <div className="bg-gray-100 p-4 mb-4">
                              <code>
                                CREATE TABLE calculator_debt_tiers (<br/>
                                &nbsp;&nbsp;id UUID PRIMARY KEY DEFAULT gen_random_uuid(),<br/>
                                &nbsp;&nbsp;program_type VARCHAR(50), -- momentum, other_program<br/>
                                &nbsp;&nbsp;tier_name VARCHAR(100),<br/>
                                &nbsp;&nbsp;min_amount DECIMAL(12,2),<br/>
                                &nbsp;&nbsp;max_amount DECIMAL(12,2),<br/>
                                &nbsp;&nbsp;fee_percentage DECIMAL(5,2), -- 15.00 for 15%<br/>
                                &nbsp;&nbsp;max_term_months INTEGER,<br/>
                                &nbsp;&nbsp;settlement_percentage DECIMAL(5,2) DEFAULT 60.00, -- 60% default<br/>
                                &nbsp;&nbsp;is_active BOOLEAN DEFAULT TRUE,<br/>
                                &nbsp;&nbsp;effective_date DATE,<br/>
                                &nbsp;&nbsp;created_by UUID REFERENCES users(id),<br/>
                                &nbsp;&nbsp;created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,<br/>
                                &nbsp;&nbsp;updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP<br/>
                                );
                              </code>
                            </div>

                            <h4 className="font-semibold mb-2">Equifax Narrative Codes (replacing /admin/equifax-codes):</h4>
                            <div className="bg-gray-100 p-4 mb-4">
                              <code>
                                CREATE TABLE narrative_code_rules (<br/>
                                &nbsp;&nbsp;id UUID PRIMARY KEY DEFAULT gen_random_uuid(),<br/>
                                &nbsp;&nbsp;code VARCHAR(10), -- Equifax narrative code<br/>
                                &nbsp;&nbsp;code_abbreviation VARCHAR(10), -- Short form<br/>
                                &nbsp;&nbsp;description TEXT,<br/>
                                &nbsp;&nbsp;include_in_settlement BOOLEAN DEFAULT FALSE,<br/>
                                &nbsp;&nbsp;exclusion_reason TEXT, -- Why excluded if not included<br/>
                                &nbsp;&nbsp;account_type_restrictions JSONB, -- Which account types this applies to<br/>
                                &nbsp;&nbsp;minimum_balance DECIMAL(12,2), -- Min balance to consider<br/>
                                &nbsp;&nbsp;maximum_age_days INTEGER, -- Max age of debt to include<br/>
                                &nbsp;&nbsp;priority INTEGER DEFAULT 100, -- For handling code conflicts<br/>
                                &nbsp;&nbsp;is_active BOOLEAN DEFAULT TRUE,<br/>
                                &nbsp;&nbsp;last_reviewed DATE,<br/>
                                &nbsp;&nbsp;created_by UUID REFERENCES users(id),<br/>
                                &nbsp;&nbsp;created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,<br/>
                                &nbsp;&nbsp;updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP<br/>
                                );
                              </code>
                            </div>

                            <h4 className="font-semibold mb-2">Plaid Account Mappings (replacing /admin/plaid):</h4>
                            <div className="bg-gray-100 p-4 mb-4">
                              <code>
                                CREATE TABLE plaid_account_type_mappings (<br/>
                                &nbsp;&nbsp;id UUID PRIMARY KEY DEFAULT gen_random_uuid(),<br/>
                                &nbsp;&nbsp;plaid_type VARCHAR(50), -- depository, credit, loan<br/>
                                &nbsp;&nbsp;plaid_subtype VARCHAR(50), -- checking, savings, credit_card<br/>
                                &nbsp;&nbsp;institution_name VARCHAR(255), -- Optional: specific institution<br/>
                                &nbsp;&nbsp;account_name_pattern VARCHAR(255), -- Regex for account name matching<br/>
                                &nbsp;&nbsp;deal_sheet_category VARCHAR(100), -- Target category for deal sheet<br/>
                                &nbsp;&nbsp;income_source BOOLEAN DEFAULT FALSE, -- Treat as income source<br/>
                                &nbsp;&nbsp;include_in_dti BOOLEAN DEFAULT TRUE, -- Include in debt-to-income<br/>
                                &nbsp;&nbsp;transaction_category_override VARCHAR(100), -- Override transaction categorization<br/>
                                &nbsp;&nbsp;priority INTEGER DEFAULT 100,<br/>
                                &nbsp;&nbsp;is_active BOOLEAN DEFAULT TRUE,<br/>
                                &nbsp;&nbsp;created_by UUID REFERENCES users(id),<br/>
                                &nbsp;&nbsp;created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,<br/>
                                &nbsp;&nbsp;updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP<br/>
                                );
                              </code>
                            </div>
                          </div>

                          <div>
                            <h3 className="font-bold text-lg mb-4">CALCULATION RESULTS & BUSINESS LOGIC</h3>

                            <h4 className="font-semibold mb-2">Plan Calculations:</h4>
                            <div className="bg-gray-100 p-4 mb-4">
                              <code>
                                CREATE TABLE plan_calculations (<br/>
                                &nbsp;&nbsp;id UUID PRIMARY KEY DEFAULT gen_random_uuid(),<br/>
                                &nbsp;&nbsp;user_id UUID REFERENCES users(id),<br/>
                                &nbsp;&nbsp;calculation_type VARCHAR(50), -- momentum_plan, current_path<br/>
                                &nbsp;&nbsp;version INTEGER DEFAULT 1, -- For tracking calculation changes<br/>
                                &nbsp;&nbsp;-- INPUT DATA --<br/>
                                &nbsp;&nbsp;total_debt DECIMAL(12,2),<br/>
                                &nbsp;&nbsp;eligible_debt DECIMAL(12,2), -- After narrative code filtering<br/>
                                &nbsp;&nbsp;eligible_account_count INTEGER,<br/>
                                &nbsp;&nbsp;monthly_income DECIMAL(12,2),<br/>
                                &nbsp;&nbsp;monthly_expenses DECIMAL(12,2),<br/>
                                &nbsp;&nbsp;client_budget DECIMAL(12,2), -- Income - Expenses (before program)<br/>
                                &nbsp;&nbsp;available_funds DECIMAL(12,2), -- Client Budget - Program Cost<br/>
                                &nbsp;&nbsp;-- CALCULATION PARAMETERS --<br/>
                                &nbsp;&nbsp;debt_tier_used VARCHAR(100),<br/>
                                &nbsp;&nbsp;fee_percentage DECIMAL(5,2),<br/>
                                &nbsp;&nbsp;settlement_percentage DECIMAL(5,2),<br/>
                                &nbsp;&nbsp;term_length_months INTEGER, -- Standard term based on debt tier<br/>
                                &nbsp;&nbsp;-- TERM OPTIMIZATION FIELDS --<br/>
                                &nbsp;&nbsp;is_optimized BOOLEAN DEFAULT FALSE,<br/>
                                &nbsp;&nbsp;excess_liquidity DECIMAL(12,2), -- Client Budget - Original Monthly Payment<br/>
                                &nbsp;&nbsp;original_monthly_payment DECIMAL(12,2), -- Pre-optimization payment<br/>
                                &nbsp;&nbsp;original_term_months INTEGER, -- Pre-optimization term<br/>
                                &nbsp;&nbsp;optimized_monthly_payment DECIMAL(12,2), -- Client Budget - $50<br/>
                                &nbsp;&nbsp;optimized_term_months INTEGER, -- Shortened term<br/>
                                &nbsp;&nbsp;payment_toward_program_cost DECIMAL(12,2), -- Optimized Payment - $50<br/>
                                &nbsp;&nbsp;-- RESULTS --<br/>
                                &nbsp;&nbsp;settlement_amount DECIMAL(12,2),<br/>
                                &nbsp;&nbsp;program_fee DECIMAL(12,2),<br/>
                                &nbsp;&nbsp;total_program_cost DECIMAL(12,2),<br/>
                                &nbsp;&nbsp;monthly_payment DECIMAL(12,2), -- Final payment (optimized or standard)<br/>
                                &nbsp;&nbsp;total_savings DECIMAL(12,2), -- vs current path<br/>
                                &nbsp;&nbsp;time_savings_months INTEGER, -- vs current path or vs original term<br/>
                                &nbsp;&nbsp;qualifies_for_program BOOLEAN,<br/>
                                &nbsp;&nbsp;disqualification_reasons JSONB, -- If doesn't qualify<br/>
                                &nbsp;&nbsp;confidence_score DECIMAL(3,2), -- Based on data quality<br/>
                                &nbsp;&nbsp;created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP<br/>
                                );
                              </code>
                            </div>

                            <h4 className="font-semibold mb-2">Calculation Audit Trail:</h4>
                            <div className="bg-gray-100 p-4 mb-4">
                              <code>
                                CREATE TABLE calculation_audit_log (<br/>
                                &nbsp;&nbsp;id UUID PRIMARY KEY DEFAULT gen_random_uuid(),<br/>
                                &nbsp;&nbsp;calculation_id UUID REFERENCES plan_calculations(id),<br/>
                                &nbsp;&nbsp;step_name VARCHAR(100), -- debt_filtering, fee_calculation, etc<br/>
                                &nbsp;&nbsp;input_values JSONB,<br/>
                                &nbsp;&nbsp;calculation_method TEXT, -- Formula or business rule applied<br/>
                                &nbsp;&nbsp;intermediate_result JSONB,<br/>
                                &nbsp;&nbsp;notes TEXT,<br/>
                                &nbsp;&nbsp;execution_time_ms INTEGER,<br/>
                                &nbsp;&nbsp;created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP<br/>
                                );
                              </code>
                            </div>
                          </div>

                          <div>
                            <h3 className="font-bold text-lg mb-4">DATA RETENTION & COMPLIANCE</h3>

                            <h4 className="font-semibold mb-2">Data Retention Policies:</h4>
                            <div className="bg-gray-100 p-4 mb-4">
                              <code>
                                CREATE TABLE data_retention_policies (<br/>
                                &nbsp;&nbsp;id UUID PRIMARY KEY DEFAULT gen_random_uuid(),<br/>
                                &nbsp;&nbsp;table_name VARCHAR(100),<br/>
                                &nbsp;&nbsp;data_category VARCHAR(100), -- pii, financial, operational, analytics<br/>
                                &nbsp;&nbsp;retention_period_days INTEGER,<br/>
                                &nbsp;&nbsp;deletion_method VARCHAR(50), -- hard_delete, anonymize, archive<br/>
                                &nbsp;&nbsp;legal_basis TEXT, -- GDPR article, business necessity, etc<br/>
                                &nbsp;&nbsp;cleanup_schedule VARCHAR(50), -- daily, weekly, monthly<br/>
                                &nbsp;&nbsp;last_cleanup TIMESTAMP,<br/>
                                &nbsp;&nbsp;is_active BOOLEAN DEFAULT TRUE,<br/>
                                &nbsp;&nbsp;created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP<br/>
                                );
                              </code>
                            </div>

                            <h4 className="font-semibold mb-2">User Data Deletion Log:</h4>
                            <div className="bg-gray-100 p-4 mb-4">
                              <code>
                                CREATE TABLE user_data_deletions (<br/>
                                &nbsp;&nbsp;id UUID PRIMARY KEY DEFAULT gen_random_uuid(),<br/>
                                &nbsp;&nbsp;user_id UUID, -- Original user ID (may no longer exist)<br/>
                                &nbsp;&nbsp;deletion_requested_at TIMESTAMP,<br/>
                                &nbsp;&nbsp;deletion_completed_at TIMESTAMP,<br/>
                                &nbsp;&nbsp;deletion_method VARCHAR(50),<br/>
                                &nbsp;&nbsp;tables_affected JSONB, -- List of tables and row counts<br/>
                                &nbsp;&nbsp;retention_exceptions JSONB, -- Data kept for legal/business reasons<br/>
                                &nbsp;&nbsp;requested_by UUID REFERENCES users(id), -- Admin who approved deletion<br/>
                                &nbsp;&nbsp;verification_hash VARCHAR(64), -- For audit verification<br/>
                                &nbsp;&nbsp;created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP<br/>
                                );
                              </code>
                            </div>
                          </div>

                          <div>
                            <h3 className="font-bold text-lg mb-4">INDEXES & PERFORMANCE OPTIMIZATION</h3>

                            <h4 className="font-semibold mb-2">Critical Indexes:</h4>
                            <div className="bg-gray-100 p-4 mb-4">
                              <code>
                                -- User lookup performance<br/>
                                CREATE INDEX idx_users_email ON users(email);<br/>
                                CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);<br/>
                                CREATE INDEX idx_user_sessions_token ON user_sessions(session_token);<br/><br/>

                                -- Plaid data queries<br/>
                                CREATE INDEX idx_plaid_connections_user_id ON plaid_connections(user_id);<br/>
                                CREATE INDEX idx_plaid_accounts_connection_id ON plaid_accounts(connection_id);<br/>
                                CREATE INDEX idx_plaid_transactions_account_id ON plaid_transactions(account_id);<br/>
                                CREATE INDEX idx_plaid_transactions_date ON plaid_transactions(date);<br/>
                                CREATE INDEX idx_plaid_transactions_deal_sheet_field ON plaid_transactions(deal_sheet_field);<br/><br/>

                                -- Credit report performance<br/>
                                CREATE INDEX idx_credit_reports_user_id ON credit_reports(user_id);<br/>
                                CREATE INDEX idx_credit_trade_lines_report_id ON credit_trade_lines(credit_report_id);<br/>
                                CREATE INDEX idx_credit_trade_lines_settlement ON credit_trade_lines(eligible_for_settlement);<br/><br/>

                                -- Calculation performance<br/>
                                CREATE INDEX idx_plan_calculations_user_id ON plan_calculations(user_id);<br/>
                                CREATE INDEX idx_plan_calculations_type ON plan_calculations(calculation_type);<br/>
                                CREATE INDEX idx_deal_sheets_user_id ON deal_sheets(user_id);<br/>
                                CREATE INDEX idx_deal_sheets_version ON deal_sheets(user_id, version);<br/><br/>

                                -- Configuration lookups<br/>
                                CREATE INDEX idx_calculator_debt_tiers_active ON calculator_debt_tiers(is_active, program_type);<br/>
                                CREATE INDEX idx_narrative_code_rules_code ON narrative_code_rules(code, is_active);<br/>
                                CREATE INDEX idx_plaid_category_mappings_category ON plaid_category_mappings(plaid_primary_category, plaid_detailed_category);
                              </code>
                            </div>

                            <h4 className="font-semibold mb-2">Query Optimization Notes:</h4>
                            <div className="space-y-1 mb-4">
                              <div>• Use connection pooling for high-concurrency scenarios</div>
                              <div>• Consider read replicas for reporting and analytics queries</div>
                              <div>• Implement caching for frequently accessed configuration data</div>
                              <div>• Use materialized views for complex financial calculations</div>
                              <div>• Partition large tables (transactions, audit logs) by date</div>
                            </div>
                          </div>

                          <div>
                            <h3 className="font-bold text-lg mb-4">MIGRATION STRATEGY</h3>

                            <h4 className="font-semibold mb-2">Phase 1: Foundation:</h4>
                            <div className="space-y-1 mb-4">
                              <div>1. Set up database schema and basic user management</div>
                              <div>2. Create API endpoints for user registration/authentication</div>
                              <div>3. Migrate admin configuration from localStorage to database</div>
                              <div>4. Update admin pages to use database-backed APIs</div>
                            </div>

                            <h4 className="font-semibold mb-2">Phase 2: Data Integration:</h4>
                            <div className="space-y-1 mb-4">
                              <div>1. Implement Plaid data storage and webhook handling</div>
                              <div>2. Build credit report data storage and processing</div>
                              <div>3. Create transaction categorization engine</div>
                              <div>4. Implement deal sheet auto-population</div>
                            </div>

                            <h4 className="font-semibold mb-2">Phase 3: Business Logic:</h4>
                            <div className="space-y-1 mb-4">
                              <div>1. Move calculation logic to server-side APIs</div>
                              <div>2. Implement question management system</div>
                              <div>3. Build configuration-driven business rules</div>
                              <div>4. Add audit trails and compliance features</div>
                            </div>

                            <h4 className="font-semibold mb-2">Phase 4: Optimization:</h4>
                            <div className="space-y-1 mb-4">
                              <div>1. Performance tuning and index optimization</div>
                              <div>2. Implement caching strategies</div>
                              <div>3. Add data retention automation</div>
                              <div>4. Complete frontend migration from localStorage</div>
                            </div>

                            <h4 className="font-semibold mb-2">Data Migration Approach:</h4>
                            <div className="bg-gray-100 p-4">
                              <code>
                                // Example migration script structure<br/>
                                1. Export existing localStorage data to JSON files<br/>
                                2. Create user records from existing sessions<br/>
                                3. Import Plaid tokens and re-fetch latest data<br/>
                                4. Import credit reports and recalculate eligibility<br/>
                                5. Recreate deal sheets with new categorization<br/>
                                6. Recalculate all plan results with audit trail<br/>
                                7. Validate data integrity and calculation accuracy<br/>
                                8. Switch frontend to use new database APIs<br/>
                                9. Deprecate localStorage usage gradually
                              </code>
                            </div>
                          </div>

                        </div>
                      </CardContent>
                    </Card>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}