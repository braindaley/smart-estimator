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
              </Accordion>
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}