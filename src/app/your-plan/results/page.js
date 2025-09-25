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

              {/* Technical Documentation */}
              <Accordion type="single" collapsible className="mt-8">
                <AccordionItem value="calculations" className="border-0">
                  <AccordionTrigger className="text-sm font-medium hover:text-muted-foreground py-3 px-0">
                    Technical Implementation Documentation
                  </AccordionTrigger>
                  <AccordionContent>
                    <Card>
                      <CardContent className="p-6">
                        <div className="space-y-8 text-sm font-mono">

                          <div>
                            <h3 className="font-bold text-lg mb-4">MOMENTUM PLAN CALCULATION ENGINE</h3>

                            <h4 className="font-semibold mb-2">Core Formula Implementation:</h4>
                            <div className="bg-gray-100 p-4 mb-4">
                              <code>
                                Monthly Payment = (Settlement Amount + Program Fee) ÷ Term Length<br/>
                                Settlement Amount = Total Eligible Debt × 0.60<br/>
                                Program Fee = Total Eligible Debt × Fee Percentage (tier-based)<br/>
                                Total Program Cost = Settlement Amount + Program Fee
                              </code>
                            </div>

                            <h4 className="font-semibold mb-2">Current Calculation Results:</h4>
                            <div className="space-y-1">
                              <div>Total Eligible Debt: {formatCurrency(momentumResults.totalDebt)}</div>
                              <div>Settlement Amount: {formatCurrency(momentumResults.totalDebt * 0.60)} (60% of debt)</div>
                              <div>Fee Percentage: {(getMomentumFeePercentage(momentumResults.totalDebt, calculatorSettings.debtTiers) * 100).toFixed(0)}% (tier: {momentumResults.totalDebt >= 24001 ? '$24k+' : momentumResults.totalDebt >= 20001 ? '$20k-24k' : '$15k-20k'})</div>
                              <div>Program Fee: {formatCurrency(momentumResults.totalDebt * getMomentumFeePercentage(momentumResults.totalDebt, calculatorSettings.debtTiers))}</div>
                              <div>Term Length: {momentumResults.term} months (tier-based)</div>
                              <div>Monthly Payment: {formatCurrency(momentumResults.monthlyPayment)}</div>
                            </div>

                            <h4 className="font-semibold mt-4 mb-2">Fee Tier Logic (from /src/lib/calculations.ts):</h4>
                            <div className="bg-gray-100 p-4">
                              <code>
                                function getMomentumFeePercentage(debtAmount, debtTiers) {`{`}<br/>
                                &nbsp;&nbsp;if (!debtTiers) {`{`}<br/>
                                &nbsp;&nbsp;&nbsp;&nbsp;if (debtAmount {`>=`} 15000 && debtAmount {`<=`} 20000) return 0.20;<br/>
                                &nbsp;&nbsp;&nbsp;&nbsp;if (debtAmount {`>=`} 20001 && debtAmount {`<=`} 24000) return 0.15;<br/>
                                &nbsp;&nbsp;&nbsp;&nbsp;if (debtAmount {`>=`} 24001) return 0.15;<br/>
                                &nbsp;&nbsp;&nbsp;&nbsp;return 0;<br/>
                                &nbsp;&nbsp;{`}`}<br/>
                                &nbsp;&nbsp;const tier = findDebtTier(debtAmount, debtTiers, 'momentum');<br/>
                                &nbsp;&nbsp;return tier ? tier.feePercentage / 100 : 0;<br/>
                                {`}`}
                              </code>
                            </div>
                          </div>

                          <div>
                            <h3 className="font-bold text-lg mb-4">CURRENT PATH CALCULATION ENGINE</h3>

                            <h4 className="font-semibold mb-2">Mathematical Model:</h4>
                            <div className="bg-gray-100 p-4 mb-4">
                              <code>
                                function calculateCurrentPath(debtAmount) {`{`}<br/>
                                &nbsp;&nbsp;const scalingFactor = debtAmount / 2000;<br/>
                                &nbsp;&nbsp;const aprAdjustment = 24 / 22;  // Adjust from 22% baseline to 24%<br/>
                                &nbsp;&nbsp;const baseYears = 11 * aprAdjustment;<br/>
                                &nbsp;&nbsp;const baseTotalCost = 4300 * scalingFactor * aprAdjustment;<br/>
                                &nbsp;&nbsp;const initialMonthlyPayment = Math.round(debtAmount * 0.025);<br/>
                                &nbsp;&nbsp;return {`{`}<br/>
                                &nbsp;&nbsp;&nbsp;&nbsp;monthlyPayment: initialMonthlyPayment,<br/>
                                &nbsp;&nbsp;&nbsp;&nbsp;term: Math.round(baseYears * 12),<br/>
                                &nbsp;&nbsp;&nbsp;&nbsp;totalCost: Math.round(baseTotalCost)<br/>
                                &nbsp;&nbsp;{`}`};<br/>
                                {`}`}
                              </code>
                            </div>

                            <h4 className="font-semibold mb-2">Current Calculation Results:</h4>
                            <div className="space-y-1">
                              <div>Debt Amount: {formatCurrency(momentumResults.totalDebt)}</div>
                              <div>Scaling Factor: {(momentumResults.totalDebt / 2000).toFixed(2)} (debt / $2000 baseline)</div>
                              <div>APR Adjustment: {(24 / 22).toFixed(3)} (24% APR vs 22% baseline)</div>
                              <div>Base Years: {(11 * (24 / 22)).toFixed(1)} years</div>
                              <div>Initial Monthly Payment: {formatCurrency(currentPathResults.monthlyPayment)} (2.5% of balance)</div>
                              <div>Term: {currentPathResults.term} months</div>
                              <div>Total Cost: {formatCurrency(currentPathResults.totalCost)}</div>
                              <div>Total Interest: {formatCurrency(currentPathResults.totalCost - momentumResults.totalDebt)}</div>
                            </div>

                            <h4 className="font-semibold mt-4 mb-2">Baseline Data Source:</h4>
                            <div className="bg-gray-100 p-4">
                              Real credit card data: $2,000 at 22% APR = $4,300 total over 11 years with minimum payments
                            </div>
                          </div>

                          <div>
                            <h3 className="font-bold text-lg mb-4">DATA INTEGRATION ARCHITECTURE</h3>

                            <h4 className="font-semibold mb-2">Credit Data Processing (src/app/your-plan/results/page.js lines 126-193):</h4>
                            <div className="bg-gray-100 p-4 mb-4">
                              <code>
                                1. getCreditData() - Retrieves from localStorage['credit_data_{`userId`}']<br/>
                                2. getEquifaxNarrativeCodes() - Gets narrative code config from localStorage<br/>
                                3. Filter accounts: data.trades.filter(account {`=>`} balance &gt; 0)<br/>
                                4. Filter eligible: accounts.filter(isNarrativeCodeIncludedInSettlement)<br/>
                                5. Calculate total debt: eligible.reduce((sum, account) {`=>`} sum + balance, 0)<br/>
                                6. Apply minimum threshold: totalDebt {`>=`} 15000 for Momentum Plan
                              </code>
                            </div>

                            <h4 className="font-semibold mb-2">Narrative Code Eligibility Logic:</h4>
                            <div className="bg-gray-100 p-4 mb-4">
                              <code>
                                function isNarrativeCodeIncludedInSettlement(account, narrativeCodes) {`{`}<br/>
                                &nbsp;&nbsp;const accountNarrativeCodes = [];<br/>
                                &nbsp;&nbsp;account.narrativeCodes.forEach(nc {`=>`} {`{`}<br/>
                                &nbsp;&nbsp;&nbsp;&nbsp;if (nc.codeabv) accountNarrativeCodes.push(nc.codeabv);<br/>
                                &nbsp;&nbsp;&nbsp;&nbsp;if (nc.code) accountNarrativeCodes.push(nc.code);<br/>
                                &nbsp;&nbsp;{`}`});<br/>
                                &nbsp;&nbsp;return accountNarrativeCodes.some(accountCode {`=>`} {`{`}<br/>
                                &nbsp;&nbsp;&nbsp;&nbsp;const config = narrativeCodes.find(c {`=>`} c.code {`===`} accountCode);<br/>
                                &nbsp;&nbsp;&nbsp;&nbsp;return config && config.includeInSettlement;<br/>
                                &nbsp;&nbsp;{`}`});<br/>
                                {`}`}
                              </code>
                            </div>

                            <h4 className="font-semibold mb-2">Calculator Settings Integration:</h4>
                            <div className="bg-gray-100 p-4 mb-4">
                              <code>
                                API: /api/admin/calculator-settings<br/>
                                Structure: {`{`} debtTiers: [tier1, tier2, ...] {`}`}<br/>
                                Tier Properties: minAmount, maxAmount, feePercentage, maxTerm, programType<br/>
                                Used by: getMomentumFeePercentage(), getMomentumTermLength()
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

                          <div>
                            <h3 className="font-bold text-lg mb-4">DATA INTEGRATION ARCHITECTURE</h3>

                            <h4 className="font-semibold mb-2">Credit Data Processing (src/app/your-plan/results/page.js lines 126-193):</h4>
                            <div className="bg-gray-100 p-4 mb-4">
                              <code>
                                1. getCreditData() - Retrieves from localStorage['credit_data_{`userId`}']<br/>
                                2. getEquifaxNarrativeCodes() - Gets narrative code config from localStorage<br/>
                                3. Filter accounts: data.trades.filter(account {`=>`} balance &gt; 0)<br/>
                                4. Filter eligible: accounts.filter(isNarrativeCodeIncludedInSettlement)<br/>
                                5. Calculate total debt: eligible.reduce((sum, account) {`=>`} sum + balance, 0)<br/>
                                6. Apply minimum threshold: totalDebt {`>=`} 15000 for Momentum Plan
                              </code>
                            </div>

                            <h4 className="font-semibold mb-2">Narrative Code Eligibility Logic:</h4>
                            <div className="bg-gray-100 p-4 mb-4">
                              <code>
                                function isNarrativeCodeIncludedInSettlement(account, narrativeCodes) {`{`}<br/>
                                &nbsp;&nbsp;const accountNarrativeCodes = [];<br/>
                                &nbsp;&nbsp;account.narrativeCodes.forEach(nc {`=>`} {`{`}<br/>
                                &nbsp;&nbsp;&nbsp;&nbsp;if (nc.codeabv) accountNarrativeCodes.push(nc.codeabv);<br/>
                                &nbsp;&nbsp;&nbsp;&nbsp;if (nc.code) accountNarrativeCodes.push(nc.code);<br/>
                                &nbsp;&nbsp;{`}`});<br/>
                                &nbsp;&nbsp;return accountNarrativeCodes.some(accountCode {`=>`} {`{`}<br/>
                                &nbsp;&nbsp;&nbsp;&nbsp;const config = narrativeCodes.find(c {`=>`} c.code {`===`} accountCode);<br/>
                                &nbsp;&nbsp;&nbsp;&nbsp;return config && config.includeInSettlement;<br/>
                                &nbsp;&nbsp;{`}`});<br/>
                                {`}`}
                              </code>
                            </div>

                            <h4 className="font-semibold mb-2">Calculator Settings Integration:</h4>
                            <div className="bg-gray-100 p-4 mb-4">
                              <code>
                                API: /api/admin/calculator-settings<br/>
                                Structure: {`{`} debtTiers: [tier1, tier2, ...] {`}`}<br/>
                                Tier Properties: minAmount, maxAmount, feePercentage, maxTerm, programType<br/>
                                Used by: getMomentumFeePercentage(), getMomentumTermLength()
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

                          <div>
                            <h3 className="font-bold text-lg mb-4">DATA SOURCES & CONFIGURATION ACCESS</h3>

                            <h4 className="font-semibold mb-2">View Data Sources:</h4>
                            <div className="space-y-1">
                              <div>
                                <a href={`/results/bank?session=${Date.now()}`} className="text-blue-600 hover:underline">
                                  /results/bank - Plaid Bank Data
                                </a>
                                <span className="text-gray-600 ml-2">Income verification and transaction analysis</span>
                              </div>
                              <div>
                                <a href={`/results/credit?session=${Date.now()}`} className="text-blue-600 hover:underline">
                                  /results/credit - Credit Report Details
                                </a>
                                <span className="text-gray-600 ml-2">Account balances and narrative codes</span>
                              </div>
                              <div>
                                <a href="/your-plan/deal-sheet" className="text-blue-600 hover:underline">
                                  /your-plan/deal-sheet - Complete Deal Sheet
                                </a>
                                <span className="text-gray-600 ml-2">Full financial analysis</span>
                              </div>
                            </div>

                            <h4 className="font-semibold mt-4 mb-2">Configuration & Admin Settings:</h4>
                            <div className="space-y-1">
                              <div>
                                <a href="/admin/plaid" className="text-blue-600 hover:underline">
                                  /admin/plaid - Plaid Account Mapping
                                </a>
                                <span className="text-gray-600 ml-2">Configure income sources</span>
                              </div>
                              <div>
                                <a href="/admin/program-calculator" className="text-blue-600 hover:underline">
                                  /admin/program-calculator - Calculator Settings
                                </a>
                                <span className="text-gray-600 ml-2">Fee tiers and terms</span>
                              </div>
                              <div>
                                <a href="/admin/equifax-codes" className="text-blue-600 hover:underline">
                                  /admin/equifax-codes - Narrative Code Selection
                                </a>
                                <span className="text-gray-600 ml-2">Debt eligibility criteria</span>
                              </div>
                            </div>

                            <h4 className="font-semibold mt-4 mb-2">Current Session Status:</h4>
                            <div className="bg-gray-100 p-4">
                              <code>
                                Total Credit Accounts: {creditData?.trades?.length || 0}<br/>
                                Eligible for Settlement: {eligibleAccounts.length}<br/>
                                Total Eligible Debt: {formatCurrency(momentumResults?.totalDebt || 0)}<br/>
                                Narrative Codes Configured: {narrativeCodes.length}<br/>
                                Qualification Status: {eligibleAccounts.length} of {creditData?.trades?.length || 0} accounts qualify
                              </code>
                            </div>
                          </div>

                          <div>
                            <h3 className="font-bold text-lg mb-4">COMPONENT INTEGRATION MAP</h3>

                            <h4 className="font-semibold mb-2">File Dependencies:</h4>
                            <div className="space-y-1">
                              <div>/src/lib/calculations.ts - Core calculation functions</div>
                              <div>/src/app/your-plan/results/ResultsTable.js - Display component</div>
                              <div>/src/app/your-plan/results/page.js - Main orchestration</div>
                              <div>/api/admin/calculator-settings - Dynamic tier configuration</div>
                              <div>localStorage['credit_data_userId'] - Equifax credit report data</div>
                              <div>localStorage['equifax-narrative-codes'] - Admin eligibility configuration</div>
                              <div>sessionStorage['momentumResults'] - Cross-page result sharing</div>
                            </div>

                            <h4 className="font-semibold mt-4 mb-2">Data Flow Sequence:</h4>
                            <div className="bg-gray-100 p-4">
                              <code>
                                1. User completes credit check (stores to localStorage)<br/>
                                2. Admin configures narrative codes (/admin/equifax-codes)<br/>
                                3. Admin sets calculator tiers (/admin/program-calculator)<br/>
                                4. Results page loads credit data and applies filters<br/>
                                5. Eligible debt calculated using narrative code matching<br/>
                                6. Calculator functions determine fees and terms<br/>
                                7. Results displayed with comparison to current path<br/>
                                8. Results saved to sessionStorage for other pages
                              </code>
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
                                &nbsp;&nbsp;available_funds DECIMAL(12,2),<br/>
                                &nbsp;&nbsp;-- CALCULATION PARAMETERS --<br/>
                                &nbsp;&nbsp;debt_tier_used VARCHAR(100),<br/>
                                &nbsp;&nbsp;fee_percentage DECIMAL(5,2),<br/>
                                &nbsp;&nbsp;settlement_percentage DECIMAL(5,2),<br/>
                                &nbsp;&nbsp;term_length_months INTEGER,<br/>
                                &nbsp;&nbsp;-- RESULTS --<br/>
                                &nbsp;&nbsp;settlement_amount DECIMAL(12,2),<br/>
                                &nbsp;&nbsp;program_fee DECIMAL(12,2),<br/>
                                &nbsp;&nbsp;total_program_cost DECIMAL(12,2),<br/>
                                &nbsp;&nbsp;monthly_payment DECIMAL(12,2),<br/>
                                &nbsp;&nbsp;total_savings DECIMAL(12,2), -- vs current path<br/>
                                &nbsp;&nbsp;time_savings_months INTEGER, -- vs current path<br/>
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