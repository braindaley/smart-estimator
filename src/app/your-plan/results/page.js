'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/header';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  calculateMonthlyMomentumPayment,
  getMomentumTermLength,
  getMomentumFeePercentage
} from '@/lib/calculations';
import ResultsTable from './ResultsTable';

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
  const initialMonthlyPayment = Math.round(debtAmount * 0.025);

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

export default function ResultsPage() {
  const [loading, setLoading] = useState(true);
  const [creditData, setCreditData] = useState(null);
  const [narrativeCodes, setNarrativeCodes] = useState([]);
  const [eligibleAccounts, setEligibleAccounts] = useState([]);
  const [momentumResults, setMomentumResults] = useState(null);
  const [currentPathResults, setCurrentPathResults] = useState(null);
  const [calculatorSettings, setCalculatorSettings] = useState(null);

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
            if (totalDebt < 15000) {
              // For debts below $15,000, use standard calculation
              // or show a message that minimum is not met
              const results = {
                monthlyPayment: 0,
                term: 0,
                totalCost: 0,
                totalDebt: totalDebt,
                accountCount: eligible.length,
                belowMinimum: true,
                minimumRequired: 15000
              };

              setMomentumResults(results);

              // Save to sessionStorage for use in other pages
              if (typeof window !== 'undefined') {
                sessionStorage.setItem('momentumResults', JSON.stringify(results));
              }
            } else {
              // Calculate Momentum Plan
              const momentumMonthlyPayment = calculateMonthlyMomentumPayment(totalDebt, calculatorSettings.debtTiers);
              const momentumTerm = getMomentumTermLength(totalDebt, calculatorSettings.debtTiers);
              const momentumTotalCost = momentumMonthlyPayment * momentumTerm;

              const results = {
                monthlyPayment: momentumMonthlyPayment,
                term: momentumTerm,
                totalCost: momentumTotalCost,
                totalDebt: totalDebt,
                accountCount: eligible.length,
                belowMinimum: false
              };

              setMomentumResults(results);

              // Save to sessionStorage for use in other pages
              if (typeof window !== 'undefined') {
                sessionStorage.setItem('momentumResults', JSON.stringify(results));
              }
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
          ) : momentumResults && currentPathResults ? (
            <div className="space-y-8">
              {/* Results Table */}
              <Card>
                <CardContent className="p-6">
                  <ResultsTable
                    momentumResults={momentumResults}
                    currentPathResults={currentPathResults}
                  />
                </CardContent>
              </Card>

              {/* Calculations Accordion */}
              <Accordion type="single" collapsible className="mt-8">
                <AccordionItem value="calculations" className="border-0">
                  <AccordionTrigger className="text-xs text-muted-foreground hover:text-muted-foreground py-2 px-0">
                    Calculations
                  </AccordionTrigger>
                  <AccordionContent>
                    <Card>
                      <CardContent className="space-y-4">
                        <div className="rounded-md bg-slate-100 p-4 text-sm space-y-4">
                          <div>
                            <h5 className="font-medium text-blue-600">Momentum Plan Calculations:</h5>
                            <div className="ml-4 space-y-2 text-xs">
                              <div>• Your Debt: {formatCurrency(momentumResults.totalDebt)}</div>
                              <div>• Fee: {(getMomentumFeePercentage(momentumResults.totalDebt, calculatorSettings.debtTiers) * 100).toFixed(0)}%</div>
                              <div>• Term: {momentumResults.term} months</div>
                              <div>• Monthly Payment: {formatCurrency(momentumResults.monthlyPayment)}</div>
                              <div>• Settlement Rate: 60%</div>
                              <div>• Accounts included: {momentumResults.accountCount}</div>
                            </div>
                          </div>

                          <div>
                            <h5 className="font-medium text-red-600">Current Path Calculations:</h5>
                            <div className="ml-4 space-y-2 text-xs">
                              <div>• Based on 24% APR typical credit card rate</div>
                              <div>• Initial payment: 2.5% of balance</div>
                              <div>• Payment decreases as balance reduces</div>
                              <div>• Total interest over {Math.round(currentPathResults.term / 12)} years</div>
                            </div>
                          </div>

                          <div className="border-t pt-4">
                            <h5 className="font-medium text-gray-700 mb-3">Data Sources & Configuration:</h5>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <div className="text-xs font-medium text-gray-600 mb-2">View Data</div>
                                <div className="space-y-1">
                                  <a href={`/results/bank?session=${Date.now()}`} className="block text-xs text-blue-600 hover:underline">
                                    → Plaid Bank Data
                                  </a>
                                  <a href={`/results/credit?session=${Date.now()}`} className="block text-xs text-blue-600 hover:underline">
                                    → Credit Report Details
                                  </a>
                                  <a href="/your-plan/deal-sheet" className="block text-xs text-blue-600 hover:underline">
                                    → Full Deal Sheet
                                  </a>
                                </div>
                              </div>
                              <div>
                                <div className="text-xs font-medium text-gray-600 mb-2">Configuration</div>
                                <div className="space-y-1">
                                  <a href="/admin/plaid" className="block text-xs text-blue-600 hover:underline">
                                    → Plaid Account Mapping
                                  </a>
                                  <a href="/admin/program-calculator" className="block text-xs text-blue-600 hover:underline">
                                    → Calculator & Creditor Data
                                  </a>
                                  <a href="/admin/equifax-codes" className="block text-xs text-blue-600 hover:underline">
                                    → Narrative Code Selection
                                  </a>
                                </div>
                              </div>
                            </div>
                            <div className="mt-3 p-2 bg-yellow-50 rounded text-xs text-yellow-800">
                              <strong>Note:</strong> Only {eligibleAccounts.length} of {creditData?.trades?.length || 0} accounts qualify based on narrative codes and balance requirements.
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