'use client';

import * as React from 'react';
import { useEstimatorStore } from '@/lib/estimator-store';
import { useReadinessStore } from '@/lib/readiness-store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ChartContainer, ChartConfig } from "@/components/ui/chart";
import { Label, PolarRadiusAxis, RadialBar, RadialBarChart } from "recharts";
import {
  calculateMonthlyMomentumPayment,
  calculatePersonalLoanPayment,
  getMomentumTermLength,
  getMomentumFeePercentage,
  getPersonalLoanApr,
  getMaximumPersonalLoanAmount,
  isEligibleForPersonalLoan,
  calculateMomentumScore
} from '@/lib/calculations';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import WhatsNext from '@/components/WhatsNext';

// Calculate current path (doing nothing - minimum payments)
function calculateCurrentPath(debtAmount: number) {
  // Based on real credit card data: $2K at 22% APR = $4.3K total over 11 years
  // Scaling proportionally for any debt amount at 24% APR
  
  const scalingFactor = debtAmount / 2000; // Scale from the $2K example
  const aprAdjustment = 24 / 22; // Adjust for 24% vs 22% APR
  
  // Base calculation from real data, adjusted for higher APR
  const baseYears = 11 * aprAdjustment; // ~12 years at 24% APR
  const baseTotalCost = 4300 * scalingFactor * aprAdjustment; // ~2.3x debt amount
  
  // Monthly payment starts around 2.5% of balance, decreasing over time
  const initialMonthlyPayment = Math.round(debtAmount * 0.025);
  
  return {
    monthlyPayment: initialMonthlyPayment,
    term: Math.round(baseYears * 12), // Convert to months
    totalCost: Math.round(baseTotalCost),
    neverPaysOff: false // Will eventually pay off, just takes forever
  };
}

type Qualification = {
  hideColumns: string[];
  hideComparison: boolean;
};

function getPersonalLoanApprovalLikelihood(userFicoScoreEstimate: number): string {
  if (userFicoScoreEstimate >= 720) return "Very likely";
  if (userFicoScoreEstimate >= 690) return "Moderate likely";
  if (userFicoScoreEstimate >= 580) return "Low likely";
  return "Not likely";
}

function getQualificationStatus(formData: any): Qualification {
  const { hasSteadyIncome, userFicoScoreEstimate, debtAmountEstimate } = formData;

  // Initialize column hiding array and comparison hiding flag
  const hideColumns: string[] = [];

  // Do not show comparison table or Graph section for:
  // - No steady income
  if (hasSteadyIncome === false) {
    return { hideColumns, hideComparison: true };
  }

  // Hide Personal Loan column when credit score < 580 or debt exceeds FICO-based limits
  if (userFicoScoreEstimate < 580 || !isEligibleForPersonalLoan(debtAmountEstimate, userFicoScoreEstimate)) {
    hideColumns.push('personalLoan');
  }

  // For all other cases, show comparison table
  return { hideColumns, hideComparison: false };
}

export default function Results() {
  const store = useEstimatorStore();
  const readinessStore = useReadinessStore();
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(true);

  const [allFormData, setAllFormData] = React.useState<any>(null);
  const [results, setResults] = React.useState<any>(null);
  const [qualification, setQualification] = React.useState<Qualification | null>(null);
  const [momentumScore, setMomentumScore] = React.useState<any>(null);
  const [readinessScore, setReadinessScore] = React.useState(0);
  const [totalPossibleScore, setTotalPossibleScore] = React.useState(70); // 35 + 35 = 70
  const [calculatorSettings, setCalculatorSettings] = React.useState<any>(null);

  // Load calculator settings on mount
  React.useEffect(() => {
    const loadCalculatorSettings = async () => {
      try {
        const response = await fetch('/api/admin/calculator-settings');
        if (response.ok) {
          const settings = await response.json();
          setCalculatorSettings(settings);
        }
      } catch (error) {
        console.error('Error loading calculator settings:', error);
      }
    };

    loadCalculatorSettings();
  }, []);

  React.useEffect(() => {
    // Wait for the store to be hydrated and calculator settings to be loaded
    if (!store._hasHydrated || !calculatorSettings) {
      return;
    }

    const { formData } = store;
    const collectedData = Object.values(formData).reduce(
      (acc, curr) => ({ ...acc, ...curr }),
      {}
    );

    const requiredKeys = [
      'debtAmountEstimate',
      'creditorCountEstimate',
      'userFicoScoreEstimate',
      'hasSteadyIncome',
      'debtPaymentStatus',
    ];
    
    const hasAllRequiredData = requiredKeys.every(key => collectedData.hasOwnProperty(key) && collectedData[key] !== undefined);

    if (!hasAllRequiredData) {
      // Don't redirect immediately, just wait for data.
      // A loading state is already shown.
      // If data is truly missing, the user can use navigation to go back.
      return;
    }

    try {
      // Estimate missing monthly income and payment data based on what we have
      if (!collectedData.hasOwnProperty('monthlyIncomeEstimate')) {
        // Estimate income based on steady income status
        collectedData.monthlyIncomeEstimate = collectedData.hasSteadyIncome ? 4000 : 0;
      }
      
      if (!collectedData.hasOwnProperty('monthlyPaymentEstimate')) {
        // Estimate monthly payment as 4% of total debt (typical minimum payment)
        collectedData.monthlyPaymentEstimate = collectedData.debtAmountEstimate * 0.04;
      }
      
      setAllFormData(collectedData);
        
      const { 
        debtAmountEstimate, 
        userFicoScoreEstimate,
        hasSteadyIncome,
        monthlyIncomeEstimate,
        monthlyPaymentEstimate,
        creditorCountEstimate,
      } = collectedData;

      // Calculate Momentum Score using new Step-1 Smart Estimator algorithm
      const momentumScoreData = calculateMomentumScore({
          debtAmountEstimate,
          creditorCountEstimate,
          debtPaymentStatus: collectedData.debtPaymentStatus,
          hasSteadyIncome,
          userFicoScoreEstimate
      });
      setMomentumScore(momentumScoreData);

      // Calculate readiness score if available
      let readinessScoreValue = 0;
      if (readinessStore.formData && readinessStore._hasHydrated) {
        // Calculate readiness score from steps 1-9
        for (let i = 1; i <= 9; i++) {
          const stepData = readinessStore.formData[`step${i}`];
          if (stepData && stepData.points) {
            readinessScoreValue += stepData.points;
          }
        }
        
        // Add video bonus points if any
        const videoData = readinessStore.formData.videos;
        if (videoData && videoData.bonusPoints) {
          readinessScoreValue += videoData.bonusPoints;
        }
      }
      setReadinessScore(readinessScoreValue);

      // Get qualification status
      const qualificationStatus = getQualificationStatus(collectedData);
      setQualification(qualificationStatus);
      
      // Calculate Momentum payments using dynamic settings
      const momentumMonthlyPayment = calculateMonthlyMomentumPayment(debtAmountEstimate, calculatorSettings.debtTiers);
      const momentumTerm = getMomentumTermLength(debtAmountEstimate, calculatorSettings.debtTiers);

      // Calculate Personal Loan with FIXED LOGIC
      const personalLoanApr = getPersonalLoanApr(userFicoScoreEstimate);
      const maxLoanAmount = getMaximumPersonalLoanAmount(userFicoScoreEstimate);
      const actualLoanAmount = Math.min(debtAmountEstimate, maxLoanAmount);
      const canGetLoan = userFicoScoreEstimate >= 580 && hasSteadyIncome !== false && isEligibleForPersonalLoan(debtAmountEstimate, userFicoScoreEstimate);
      const personalLoanMonthlyPayment = canGetLoan ? calculatePersonalLoanPayment(actualLoanAmount, personalLoanApr) : 0;
      
      // Calculate Current Path (doing nothing)
      const currentPathData = calculateCurrentPath(debtAmountEstimate);
      
      const resultsData = {
        debtAmountEstimate,
        momentum: {
          monthlyPayment: momentumMonthlyPayment,
          term: momentumTerm,
          isEligible: true,
          totalCost: momentumMonthlyPayment * momentumTerm,
        },
        personalLoan: {
          monthlyPayment: personalLoanMonthlyPayment,
          term: 36,
          apr: personalLoanApr,
          actualLoanAmount: actualLoanAmount,
          maxAvailable: maxLoanAmount,
          isEligible: canGetLoan,
          totalCost: personalLoanMonthlyPayment * 36,
        },
        currentPath: {
          monthlyPayment: currentPathData.monthlyPayment,
          term: currentPathData.term,
          totalCost: currentPathData.totalCost,
          isEligible: true,
        }
      };
      
      setResults(resultsData);
    } catch (error) {
      console.error('Error in Results calculation:', error);
      // Redirect or show an error message if calculations fail.
      router.push('/smart-estimator/step-1');
    } finally {
      setIsLoading(false);
    }
  }, [store._hasHydrated, store.formData, readinessStore._hasHydrated, readinessStore.formData, router, calculatorSettings]);

  // Separate effect to store the momentum score only when it's calculated and not already stored
  React.useEffect(() => {
    if (momentumScore && momentumScore.score > 0 && !store.formData.momentumScore) {
      store.setFormData('momentumScore', { 
        score: momentumScore.score,
        calculatedAt: new Date().toISOString()
      });
    }
  }, [momentumScore, store.formData.momentumScore, store]);

  const formatCurrency = (value: number) => {
    if (typeof value !== 'number' || isNaN(value)) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleRestart = () => {
    store.reset();
    router.push('/smart-estimator/step-1');
  };
  
  if (isLoading || !qualification || !results || !momentumScore || !calculatorSettings) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Calculating Results...</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Please wait while we calculate your results.</p>
        </CardContent>
      </Card>
    );
  }


  return (
    <div className="space-y-8">
      <div className="space-y-4 text-center">
        <h1 className="text-3xl font-bold">Your Smart Estimate</h1>
        {allFormData?.hasSteadyIncome === false ? (
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Unfortunately without steady income, we do not have a solutions for you.</p>
          </div>
        ) : allFormData?.hasSteadyIncome === true ? (
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Based on info provided, you have the following options.</p>
          </div>
        ) : null}
        
      </div>

      {!qualification.hideComparison && (
        <div className="space-y-4">
          {/* Desktop Table View */}
          <div className="hidden md:block">
            <Card>
            <CardContent className="p-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    {!qualification.hideColumns.includes('momentum') && <TableHead className="w-1/3 pb-4 text-center align-top bg-blue-50">
                        <div className="flex flex-col items-center">
                          <div className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-medium mt-4 mb-1">
                            Recommended
                          </div>
                          <p className="text-base font-semibold text-blue-600">Momentum Plan</p>
                          <p className="text-xs text-muted-foreground">Pay off debt faster with a lower monthly payment.</p>
                        </div>
                    </TableHead>}
                    {!qualification.hideColumns.includes('personalLoan') && <TableHead className="w-1/3 border-x pb-4 text-center align-top">
                        <div className="flex flex-col items-center">
                          <div className="bg-white border border-gray-600 text-gray-600 text-xs px-2 py-1 rounded-full font-medium mt-4 mb-1">
                            Consider
                          </div>
                          <p className="text-base font-semibold">Personal Loan</p>
                          <p className="text-xs text-muted-foreground">Consolidate into one payment, but with high interest.</p>
                        </div>
                    </TableHead>}
                    <TableHead className="w-1/3 pb-4 text-center align-top">
                        <div className="flex flex-col items-center">
                          <div className="bg-white border border-red-600 text-red-600 text-xs px-2 py-1 rounded-full font-medium mt-4 mb-1">
                            Do nothing
                          </div>
                          <p className="text-base font-semibold">Current Path</p>
                          <p className="text-xs text-muted-foreground">Keep making minimum payments.</p>
                        </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>

                  {/* Payment Details Row */}
                  <TableRow>
                    {!qualification.hideColumns.includes('momentum') && 
                        <TableCell className="text-center align-top bg-blue-50">
                          <div className="text-sm font-bold mb-2">Payment Details</div>
                          {results.momentum.isEligible ? (
                            <div className="text-sm space-y-1">
                              <div className="text-lg font-bold">{formatCurrency(results.momentum.monthlyPayment)}/mo</div>
                              <div>{results.momentum.term} months</div>
                              <div>Total cost {formatCurrency(results.momentum.totalCost)}</div>
                            </div>
                          ) : (
                            <p>Not Eligible</p>
                          )}
                        </TableCell>
                    }
                    {!qualification.hideColumns.includes('personalLoan') && 
                        <TableCell className="border-x text-center align-top">
                          <div className="text-sm font-bold mb-2">Payment Details</div>
                          {results.personalLoan.isEligible ? (
                            <div className="text-sm space-y-1">
                              <div className="text-lg font-bold">{formatCurrency(results.personalLoan.monthlyPayment)}/mo</div>
                              <div>{results.personalLoan.term} months</div>
                              <div>Total cost {formatCurrency(results.personalLoan.totalCost)}</div>
                              {results.personalLoan.actualLoanAmount < results.debtAmountEstimate && (
                                <div className="text-xs">
                                  Only {Math.round((results.personalLoan.actualLoanAmount / results.debtAmountEstimate) * 100)}% of total debt
                                </div>
                              )}
                            </div>
                          ) : (
                            <p>Not Eligible</p>
                          )}
                        </TableCell>
                    }
                    <TableCell className="text-center align-top">
                      <div className="text-sm font-bold mb-2">Payment Details</div>
                      <div className="text-sm space-y-1">
                        <div className="text-lg font-bold">{formatCurrency(results.currentPath.monthlyPayment)}/mo</div>
                        <div>{results.currentPath.term} months</div>
                        <div>Total cost {formatCurrency(results.currentPath.totalCost)}</div>
                        <div className="text-xs">Payment decreases over time</div>
                      </div>
                    </TableCell>
                  </TableRow>
                  
                  {/* Summary Row - Savings, Pros, Cons */}
                  <TableRow>
                      {!qualification.hideColumns.includes('momentum') && (
                        <TableCell className="text-left align-top bg-blue-50 px-4">
                          <div className="text-sm font-bold mb-2">Summary</div>
                          <ul className="text-xs space-y-1 list-disc list-inside">
                            <li><span className="font-semibold">Approval:</span> Yes, no credit required</li>
                            <li><span className="font-semibold">Pros:</span> Immediate relief, faster recovery</li>
                            <li><span className="font-semibold">Cons:</span> Temporary harm to credit</li>
                          </ul>
                        </TableCell>
                      )}
                      {!qualification.hideColumns.includes('personalLoan') && (
                        <TableCell className="border-x text-left align-top px-4">
                          <div className="text-sm font-bold mb-2">Summary</div>
                          <div className="text-xs">
                            {results.personalLoan.isEligible ? (
                              <ul className="space-y-1 list-disc list-inside">
                                <li><span className="font-semibold">Approval:</span> {getPersonalLoanApprovalLikelihood(allFormData.userFicoScoreEstimate)}</li>
                                <li><span className="font-semibold">Pros:</span> Immediate relief</li>
                                <li><span className="font-semibold">Cons:</span> Credit required, higher total cost</li>
                              </ul>
                            ) : (
                              <ul className="space-y-1 list-disc list-inside">
                                <li><span className="font-semibold">Approval:</span> Not eligible</li>
                              </ul>
                            )}
                          </div>
                        </TableCell>
                      )}
                      <TableCell className="text-left align-top px-4">
                        <div className="text-sm font-bold mb-2">Summary</div>
                        <ul className="text-xs space-y-1 list-disc list-inside">
                          <li><span className="font-semibold">Pros:</span> No monthly payment</li>
                          <li><span className="font-semibold">Cons:</span> Growing debt, no solution</li>
                        </ul>
                      </TableCell>
                  </TableRow>

                </TableBody>
              </Table>
            </CardContent>
          </Card>
          </div>

          {/* Mobile Card View */}
        <div className="md:hidden space-y-4">
          {/* Momentum Plan Card */}
          {!qualification.hideColumns.includes('momentum') && (
            <Card className="bg-blue-50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-blue-600">Momentum Plan</h3>
                  <div className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                    Recommended
                  </div>
                </div>
                <CardDescription className="text-xs">Pay off debt faster with a lower monthly payment.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-center">
                  {results.momentum.isEligible ? (
                    <p className="text-2xl font-bold">{formatCurrency(results.momentum.monthlyPayment)}/mo</p>
                  ) : (
                    <p className="text-muted-foreground">Not Eligible</p>
                  )}
                </div>
                <div className="space-y-2 text-sm">
                  <div><span className="font-bold">Program length:</span> {results.momentum.isEligible ? `${results.momentum.term} months` : '-'}</div>
                  <div><span className="font-bold">Total cost:</span> {results.momentum.isEligible ? formatCurrency(results.momentum.totalCost) : '-'}</div>
                </div>
                <div className="text-xs space-y-1 pt-2 border-t">
                  <div><span className="font-bold">Approval:</span> Yes, no minimum credit required</div>
                  <div><span className="font-bold">Pros:</span> Immediate relief, faster recovery</div>
                  <div><span className="font-bold">Cons:</span> Temporary harm to credit</div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Personal Loan Card */}
          {!qualification.hideColumns.includes('personalLoan') && (
            <Card>
              <CardHeader className="pb-3">
                <h3 className="text-base font-semibold">Personal Loan</h3>
                <CardDescription className="text-xs">Consolidate into one payment, but with high interest.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-center">
                  {results.personalLoan.isEligible ? (
                    <p className="text-2xl font-bold">{formatCurrency(results.personalLoan.monthlyPayment)}/mo</p>
                  ) : (
                    <p className="text-muted-foreground">Not Eligible</p>
                  )}
                </div>
                <div className="space-y-2 text-sm">
                  <div><span className="font-bold">Program length:</span> {results.personalLoan.isEligible ? `${results.personalLoan.term} months` : '-'}</div>
                  <div><span className="font-bold">Total cost:</span> {results.personalLoan.isEligible ? formatCurrency(results.personalLoan.totalCost) : '-'}</div>
                </div>
                <div className="text-xs space-y-1 pt-2 border-t">
                  {results.personalLoan.isEligible ? (
                    <>
                      <div><span className="font-bold">Approval:</span> {getPersonalLoanApprovalLikelihood(allFormData.userFicoScoreEstimate)}</div>
                      <div><span className="font-bold">Pros:</span> Immediate relief</div>
                      <div><span className="font-bold">Cons:</span> Credit required, higher total cost</div>
                    </>
                  ) : (
                    <>
                      <div><span className="font-bold">Approval:</span> Not eligible</div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Current Path Card */}
          <Card>
            <CardHeader className="pb-3">
              <h3 className="text-base font-semibold">Current Path</h3>
              <CardDescription className="text-xs">Keep making minimum payments at 24% APR.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-center">
                <p className="text-2xl font-bold">{formatCurrency(results.currentPath.monthlyPayment)}/mo</p>
                <p className="text-xs text-muted-foreground">Then decreasing</p>
              </div>
              <div className="space-y-2 text-sm">
                <div><span className="font-bold">Program length:</span> {results.currentPath.term} months ({Math.round(results.currentPath.term / 12)} years)</div>
                <div><span className="font-bold">Total cost:</span> {formatCurrency(results.currentPath.totalCost)}</div>
              </div>
              <div className="text-xs space-y-1 pt-2 border-t">
                <div><span className="font-bold">Pros:</span> No monthly payment</div>
                <div><span className="font-bold">Cons:</span> Growing debt, no solution</div>
              </div>
            </CardContent>
          </Card>
        </div>
        </div>
      )}

      {/* What's Next Section */}
      <WhatsNext 
        hasSteadyIncome={allFormData?.hasSteadyIncome}
        userFicoScoreEstimate={allFormData?.userFicoScoreEstimate}
        momentumScore={momentumScore?.score}
      />


      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <h3 className="text-base font-semibold">Why Momentum May Be Better</h3>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Low monthly cost, shorter term = less stress + faster recovery.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <h3 className="text-base font-semibold">Why Loans Can Backfire</h3>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Higher APRs mean you might repay more than you owe today — even if it looks smaller monthly.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <h3 className="text-base font-semibold">Why Doing Nothing Is Risky</h3>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Doing nothing means your debt will likely keep growing, adding stress to your financial future</p>
          </CardContent>
        </Card>
      </div>

      <Accordion type="single" collapsible className="mt-8">
        <AccordionItem value="debug-info" className="border-0">
          <AccordionTrigger className="text-xs text-muted-foreground hover:text-muted-foreground py-2 px-0">Calculations</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-6">
              <div className="text-center">
                <Button asChild onClick={handleRestart} variant="link">
                  <Link href="/smart-estimator/step-1">Start Over</Link>
                </Button>
              </div>


              <Card>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold">Calculations</h4>
                    <div className="mt-2 rounded-md bg-slate-100 p-4 text-sm space-y-4">
                      <div>
                        <h5 className="font-medium text-blue-600">Momentum Plan Calculations:</h5>
                        <div className="ml-4 space-y-2 text-xs">
                          <div className="font-medium">Current User Values:</div>
                          <div className="ml-2 space-y-1">
                            <div>• Your Debt: {formatCurrency(allFormData.debtAmountEstimate)}</div>
                            <div>• Your Fee Percentage: {getMomentumFeePercentage(allFormData.debtAmountEstimate, calculatorSettings.debtTiers) * 100}%</div>
                            <div>• Your Term Length: {getMomentumTermLength(allFormData.debtAmountEstimate, calculatorSettings.debtTiers)} months</div>
                            <div>• Formula: ((debt × fee%) + (debt × 0.60)) ÷ term</div>
                            <div>• Calculation: (({formatCurrency(allFormData.debtAmountEstimate)} × {getMomentumFeePercentage(allFormData.debtAmountEstimate, calculatorSettings.debtTiers)}) + ({formatCurrency(allFormData.debtAmountEstimate)} × 0.60)) ÷ {getMomentumTermLength(allFormData.debtAmountEstimate, calculatorSettings.debtTiers)} = {formatCurrency(results.momentum.monthlyPayment)}/mo</div>
                            <div>• Total Cost: {formatCurrency(results.momentum.monthlyPayment)} × {results.momentum.term} = {formatCurrency(results.momentum.totalCost)}</div>
                          </div>

                          <div className="font-medium mt-3">All Momentum Tiers & Logic:</div>
                          <div className="ml-2 space-y-1">
                            {calculatorSettings.debtTiers
                              .filter(tier => tier.programType === 'momentum')
                              .map((tier, index) => (
                                <div key={index}>
                                  • {formatCurrency(tier.minAmount)}-{formatCurrency(tier.maxAmount)}: {tier.feePercentage}% fee, {tier.maxTerm} months
                                </div>
                              ))}
                          </div>

                          <div className="font-medium mt-3">Fallback Logic (if no dynamic tiers):</div>
                          <div className="ml-2 space-y-1">
                            <div>• $15,000-$20,000: 20% fee, 30 months</div>
                            <div>• $20,001-$24,000: 15% fee, 36 months</div>
                            <div>• $24,001+: 15% fee, 42 months</div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h5 className="font-medium text-gray-600">Personal Loan Calculations:</h5>
                        <div className="ml-4 space-y-2 text-xs">
                          <div className="font-medium">Current User Values:</div>
                          <div className="ml-2 space-y-1">
                            <div>• Your FICO Score: {allFormData.userFicoScoreEstimate}</div>
                            <div>• Your APR: {(getPersonalLoanApr(allFormData.userFicoScoreEstimate) * 100).toFixed(2)}%</div>
                            <div>• Term: 36 months (fixed)</div>
                            <div>• Your Max Loan Amount: {formatCurrency(getMaximumPersonalLoanAmount(allFormData.userFicoScoreEstimate))}</div>
                            <div>• Actual Loan Amount: {formatCurrency(results.personalLoan.actualLoanAmount)}</div>
                            <div>• Monthly Rate: {((getPersonalLoanApr(allFormData.userFicoScoreEstimate) / 12) * 100).toFixed(4)}%</div>
                            <div>• Formula: PMT(rate, nper, pv) where rate = monthly APR, nper = 36, pv = loan amount</div>
                            <div>• Calculation: PMT({((getPersonalLoanApr(allFormData.userFicoScoreEstimate) / 12) * 100).toFixed(4)}%, 36, {formatCurrency(results.personalLoan.actualLoanAmount)}) = {formatCurrency(results.personalLoan.monthlyPayment)}/mo</div>
                            <div>• Total Cost: {formatCurrency(results.personalLoan.monthlyPayment)} × 36 = {formatCurrency(results.personalLoan.totalCost)}</div>
                            <div>• Eligible: {isEligibleForPersonalLoan(allFormData.debtAmountEstimate, allFormData.userFicoScoreEstimate) ? 'Yes' : 'No'}</div>
                          </div>

                          <div className="font-medium mt-3">APR by Credit Score Ranges:</div>
                          <div className="ml-2 space-y-1">
                            <div>• 720+: 10.25% APR</div>
                            <div>• 690-719: 13.25% APR</div>
                            <div>• 660-689: 18.00% APR</div>
                            <div>• 620-659: 25.00% APR</div>
                            <div>• &lt;620: 150.00% APR (very high risk)</div>
                          </div>

                          <div className="font-medium mt-3">Max Loan Amount by Credit Score:</div>
                          <div className="ml-2 space-y-1">
                            <div>• 720+: {formatCurrency(50000)} max</div>
                            <div>• 690-719: {formatCurrency(40000)} max</div>
                            <div>• 660-689: {formatCurrency(30000)} max</div>
                            <div>• 620-659: {formatCurrency(20000)} max</div>
                            <div>• &lt;620: {formatCurrency(5000)} max</div>
                          </div>

                          <div className="font-medium mt-3">Eligibility Logic:</div>
                          <div className="ml-2 space-y-1">
                            <div>• Must have steady income</div>
                            <div>• FICO score ≥ 580</div>
                            <div>• Debt amount ≤ max loan amount for score</div>
                            <div>• Fixed 36-month term</div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h5 className="font-medium text-red-600">Current Path Calculations:</h5>
                        <div className="ml-4 space-y-2 text-xs">
                          <div className="font-medium">Current User Values:</div>
                          <div className="ml-2 space-y-1">
                            <div>• Your Debt: {formatCurrency(allFormData.debtAmountEstimate)}</div>
                            <div>• Initial Monthly Payment: ({formatCurrency(allFormData.debtAmountEstimate)} × 0.025) = {formatCurrency(Math.round(allFormData.debtAmountEstimate * 0.025))}/mo (then decreasing)</div>
                            <div>• Term Formula: (11 years × APR adjustment × 12) = (11 × {(24/22).toFixed(2)} × 12) = {Math.round(11 * (24/22) * 12)} months</div>
                            <div>• Total Cost Formula: (base cost × scaling factor × APR adjustment)</div>
                            <div>• Total Cost Calculation: (4300 × {(allFormData.debtAmountEstimate / 2000).toFixed(2)} × {(24/22).toFixed(2)}) = {formatCurrency(Math.round(4300 * (allFormData.debtAmountEstimate / 2000) * (24/22)))}</div>
                          </div>

                          <div className="font-medium mt-3">Calculation Logic:</div>
                          <div className="ml-2 space-y-1">
                            <div>• Based on real credit card data: $2K at 22% APR = $4.3K total over 11 years</div>
                            <div>• Assumes 24% APR (typical credit card rate)</div>
                            <div>• Scaling Factor: debt ÷ $2,000 = {(allFormData.debtAmountEstimate / 2000).toFixed(2)}</div>
                            <div>• APR Adjustment: 24% ÷ 22% = {(24/22).toFixed(2)} (higher rate = longer payoff)</div>
                            <div>• Base Years: 11 × {(24/22).toFixed(2)} = {Math.round(11 * (24/22))} years</div>
                            <div>• Initial Payment: 2.5% of balance (decreases as balance reduces)</div>
                            <div>• Total multiplier: (4300 × scaling × APR adjustment) = (4300 × {(allFormData.debtAmountEstimate / 2000).toFixed(2)} × {(24/22).toFixed(2)})</div>
                          </div>

                          <div className="font-medium mt-3">Assumptions:</div>
                          <div className="ml-2 space-y-1">
                            <div>• 24% average credit card APR</div>
                            <div>• Minimum payments start at ~2.5% of balance</div>
                            <div>• Payment amount decreases as balance reduces</div>
                            <div>• No additional charges or fees</div>
                            <div>• No missed payments</div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h5 className="font-medium text-purple-600">Momentum Score Calculations:</h5>
                        <div className="ml-4 space-y-2 text-xs">
                          <div className="font-medium">Current User Score:</div>
                          <div className="ml-2 space-y-1">
                            <div>• Debt Amount ({formatCurrency(allFormData.debtAmountEstimate)}): {momentumScore.breakdown.debtAmount} points</div>
                            <div>• Creditor Count ({allFormData.creditorCountEstimate}): {momentumScore.breakdown.creditors} points</div>
                            <div>• Payment Status ({allFormData.debtPaymentStatus}): {momentumScore.breakdown.paymentStatus} points</div>
                            <div>• Steady Income ({allFormData.hasSteadyIncome ? 'Yes' : 'No'}): {momentumScore.breakdown.income} points</div>
                            <div>• Credit Score ({allFormData.userFicoScoreEstimate}): {momentumScore.breakdown.creditScore} points</div>
                            <div>• <strong>Total Score: {momentumScore.score} / {momentumScore.maxPossible}</strong></div>
                          </div>

                          <div className="font-medium mt-3">Debt Amount Points Logic:</div>
                          <div className="ml-2 space-y-1">
                            <div>• $15,000-$24,999: 3 points</div>
                            <div>• $25,000-$34,999: 11 points</div>
                            <div>• $35,000-$49,999: 8 points</div>
                            <div>• $50,000-$74,999: 6 points</div>
                            <div>• $75,000+: 2 points</div>
                            <div>• Below $15,000: 0 points</div>
                          </div>

                          <div className="font-medium mt-3">Creditor Count Points Logic:</div>
                          <div className="ml-2 space-y-1">
                            <div>• 1-2 creditors: 1 point</div>
                            <div>• 3-5 creditors: 8 points</div>
                            <div>• 6-10 creditors: 6 points</div>
                            <div>• 10+ creditors: 4 points</div>
                          </div>

                          <div className="font-medium mt-3">Payment Status Points Logic:</div>
                          <div className="ml-2 space-y-1">
                            <div>• Current: 2 points</div>
                            <div>• Late: 8 points</div>
                            <div>• Collections: 6 points</div>
                          </div>

                          <div className="font-medium mt-3">Income Status Points Logic:</div>
                          <div className="ml-2 space-y-1">
                            <div>• Has steady income: 6 points</div>
                            <div>• No steady income: 0 points</div>
                          </div>

                          <div className="font-medium mt-3">Credit Score Points Logic:</div>
                          <div className="ml-2 space-y-1">
                            <div>• 720+ (Prime): 1 point</div>
                            <div>• 690-719 (Good): 1 point</div>
                            <div>• 580-689 (Fair): 2 points</div>
                            <div>• &lt;580 (Subprime): 1 point</div>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

    </div>
  );
}
