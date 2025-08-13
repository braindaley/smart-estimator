'use client';

import * as React from 'react';
import { useEstimatorStore } from '@/lib/estimator-store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ChartContainer, ChartConfig } from "@/components/ui/chart";
import { Label, PolarRadiusAxis, RadialBar, RadialBarChart } from "recharts";
import {
  calculateMonthlyMomentumPayment,
  calculatePersonalLoanPayment,
  getMomentumTermLength,
  getPersonalLoanApr,
  getMaximumPersonalLoanAmount,
  calculateMomentumScore
} from '@/lib/calculations';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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
  status: string;
  hideColumns: string[];
  primaryCTA: string;
  secondaryCTA?: string;
  message: string;
  showScore: boolean;
  scoreMessage: string;
};

function getPersonalLoanApprovalLikelihood(userFicoScoreEstimate: number): string {
  if (userFicoScoreEstimate >= 720) return "Very likely";
  if (userFicoScoreEstimate >= 690) return "Moderate likely";
  if (userFicoScoreEstimate >= 630) return "Low likely";
  return "Not likely";
}

function getQualificationStatus(formData: any, momentumScore: any): Qualification {
  const { debtAmountEstimate, hasSteadyIncome, userFicoScoreEstimate } = formData;

  // Initialize column hiding array
  const hideColumns: string[] = [];
  
  // STEP 1: Check income first
  if (hasSteadyIncome === false) {
    hideColumns.push("personalLoan"); // Disable loan offer
    hideColumns.push("momentum"); // Also disable momentum plan for no income
    
    return {
      status: "With no income you may have limited options",
      hideColumns: hideColumns,
      primaryCTA: "See Non-Payment Solutions",
      secondaryCTA: "Schedule Call",
      message: "We understand income challenges and have non-payment based relief options available through our legal aid partners.",
      showScore: true,
      scoreMessage: "Income-free debt relief options are available."
    };
  }

  // STEP 2: Check credit score ranges with debt thresholds
  
  // FICO < 630
  if (userFicoScoreEstimate < 630) {
    hideColumns.push("personalLoan"); // Disable Loan Offer Column
    
    return {
      status: "Settlement Recommended",
      hideColumns: hideColumns,
      primaryCTA: "Customize Plan",
      secondaryCTA: "Take Readiness Quiz",
      message: "Most clients in this range succeed through settlement. Based on your credit profile, debt settlement is typically the most effective path forward.",
      showScore: true,
      scoreMessage: "Settlement programs are designed for your credit range."
    };
  }

  // FICO 630-659 AND debt > $15K
  if (userFicoScoreEstimate >= 630 && userFicoScoreEstimate <= 659 && debtAmountEstimate > 15000) {
    // Highlight Settlement (show all columns but emphasize settlement)
    return {
      status: "Settlement is A good option",
      hideColumns: hideColumns,
      primaryCTA: "Customize Plan",
      secondaryCTA: "Schedule a Call",
      message: "Your credit may qualify for loans, but settlement often provides better savings for your situation.",
      showScore: true,
      scoreMessage: "Loan approval rates are lower in this credit range - settlement may save more."
    };
  }

  // FICO 660-719 AND debt > $15K
  if (userFicoScoreEstimate >= 660 && userFicoScoreEstimate <= 719 && debtAmountEstimate > 10000) {
    // Show All 3 Columns
    return {
      status: "Multiple Options Available",
      hideColumns: hideColumns,
      primaryCTA: "Customize Plan",
      secondaryCTA: "Schedule a Call",
      message: "You're eligible for loan or settlement — see what saves you more. You qualify for both loan consolidation and settlement programs.",
      showScore: true,
      scoreMessage: "Your credit score opens up multiple debt relief options."
    };
  }

  // FICO 720+
  if (userFicoScoreEstimate >= 720) {
    // Highlight Both (loan + settlement)
    return {
      status: "Excellent Credit - Best Options",
      hideColumns: hideColumns,
      primaryCTA: "Customize Plan",
      secondaryCTA: "Schedule a Call",
      message: "Compare loans vs settlement and choose what fits best. Your excellent credit qualifies you for the best rates and terms across all programs.",
      showScore: true,
      scoreMessage: "Premium loan rates and priority settlement terms available."
    };
  }

  // Handle cases where debt thresholds aren't met for the credit ranges
  
  // FICO 630-659 but debt <= $15K
  if (userFicoScoreEstimate >= 630 && userFicoScoreEstimate <= 659 && debtAmountEstimate <= 15000) {
    hideColumns.push("momentum"); // Hide momentum since debt is too low
    return {
      status: "Limited Options - Debt Below Threshold",
      hideColumns: hideColumns,
      primaryCTA: "Compare Your Options",
      secondaryCTA: "Estimate Your Savings",
      message: "Compare plan options — loans may not help. For debt amounts under $15K, focus on available consolidation options.",
      showScore: true,
      scoreMessage: "Consider direct creditor negotiations or smaller consolidation loans."
    };
  }

  // FICO 660-719 but debt <= $10K
  if (userFicoScoreEstimate >= 660 && userFicoScoreEstimate <= 719 && debtAmountEstimate <= 10000) {
    hideColumns.push("momentum"); // Hide momentum since debt is too low
    return {
      status: "Personal Loan Recommended",
      hideColumns: hideColumns,
      primaryCTA: "Explore Both Paths",
      secondaryCTA: "Use Smart Estimator",
      message: "Explore both paths available to you. Your good credit makes personal loans a viable option for smaller debt amounts.",
      showScore: true,
      scoreMessage: "Good credit qualifies you for competitive loan rates."
    };
  }

  // Edge case: High debt requiring specialist consultation
  if (debtAmountEstimate >= 50000) {
    return {
      status: "Needs Specialist Consultation",
      hideColumns: hideColumns,
      primaryCTA: "Schedule Consultation",
      message: "For debt over $50,000, let's discuss your custom options.",
      showScore: true,
      scoreMessage: "High debt amounts require personalized consultation."
    };
  }

  // Default fallback
  return {
    status: "Assessment Needed",
    hideColumns: hideColumns,
    primaryCTA: "Complete Assessment",
    secondaryCTA: "Get Help Now",
    message: "Complete our assessment to determine your best options.",
    showScore: true,
    scoreMessage: "We need more information to provide personalized recommendations."
  };
}

export default function Results() {
  const store = useEstimatorStore();
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(true);

  const [allFormData, setAllFormData] = React.useState<any>(null);
  const [results, setResults] = React.useState<any>(null);
  const [qualification, setQualification] = React.useState<Qualification | null>(null);
  const [momentumScore, setMomentumScore] = React.useState<any>(null);

  React.useEffect(() => {
    // Wait for the store to be hydrated before doing anything.
    if (!store._hasHydrated) {
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

      // Get qualification status
      const qualificationStatus = getQualificationStatus(collectedData, momentumScoreData);
      setQualification(qualificationStatus);
      
      // Calculate Momentum payments
      const momentumMonthlyPayment = calculateMonthlyMomentumPayment(debtAmountEstimate);
      const momentumTerm = getMomentumTermLength(debtAmountEstimate);

      // Calculate Personal Loan with FIXED LOGIC
      const personalLoanApr = getPersonalLoanApr(userFicoScoreEstimate);
      const maxLoanAmount = getMaximumPersonalLoanAmount(userFicoScoreEstimate);
      const actualLoanAmount = Math.min(debtAmountEstimate, maxLoanAmount);
      const canGetLoan = actualLoanAmount >= 1000 && userFicoScoreEstimate >= 620 && hasSteadyIncome !== false;
      const personalLoanMonthlyPayment = canGetLoan ? calculatePersonalLoanPayment(actualLoanAmount, personalLoanApr) : 0;
      
      // Calculate Current Path (doing nothing)
      const currentPathData = calculateCurrentPath(debtAmountEstimate);
      
      const resultsData = {
        debtAmountEstimate,
        momentum: {
          monthlyPayment: momentumMonthlyPayment,
          term: momentumTerm,
          isEligible: debtAmountEstimate >= 15000,
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
  }, [store._hasHydrated, store.formData, router]);

  const formatCurrency = (value: number) => {
    if (typeof value !== 'number' || isNaN(value)) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };
  
  if (isLoading || !qualification || !results || !momentumScore) {
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

  const handleRestart = () => {
    store.reset();
    router.push('/smart-estimator/step-1');
  }

  const handleCTAClick = (cta: string) => {
    // Placeholder for CTA handling
    console.log(`${cta} button clicked`);
  };

  const renderCtas = () => {
    if (!qualification) return null;

    const primaryCTAComponent = () => {
      if (qualification.primaryCTA === "See Non-Payment Solutions") {
        return (
          <Button asChild size="lg">
            <Link href="/resources/income-free-debt-options">{qualification.primaryCTA}</Link>
          </Button>
        );
      }
      if (qualification.primaryCTA === "Customize Plan") {
        return (
          <Button asChild size="lg">
            <Link href="/customize-plan">{qualification.primaryCTA}</Link>
          </Button>
        );
      }
      return (
        <Button onClick={() => handleCTAClick(qualification.primaryCTA)} size="lg">
          {qualification.primaryCTA}
        </Button>
      );
    };

    const secondaryCTAComponent = () => {
        if (!qualification.secondaryCTA) return null;
        if (qualification.secondaryCTA === "Schedule Call" || qualification.secondaryCTA === "Schedule a Call") {
          return (
            <Button asChild variant="secondary" size="lg">
              <Link href="/contact-us">{qualification.secondaryCTA}</Link>
            </Button>
          );
        }
        return (
          <Button onClick={() => handleCTAClick(qualification.secondaryCTA!)} variant="secondary" size="lg">
            {qualification.secondaryCTA}
          </Button>
        );
      };

    return (
      <>
        {primaryCTAComponent()}
        {secondaryCTAComponent()}
      </>
    );
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4 text-center">
        <h1 className="text-3xl font-bold">Smart Estimator</h1>
      </div>

      <div className="space-y-4">
        {/* Desktop Table View */}
        <div className="hidden md:block">
          <Card>
            <CardHeader className="pb-4">
              <h2 className="text-xl font-bold text-center">Plans that fit your situation</h2>
              {allFormData?.hasSteadyIncome === false ? (
                <div className="text-center mt-2">
                  <p className="text-sm text-muted-foreground mb-2">See Non-Payment Based Relief Options</p>
                  <Button asChild variant="link" size="sm">
                    <Link href="/resources/legal-aid-partners">View Legal Aid Partners</Link>
                  </Button>
                </div>
              ) : allFormData?.userFicoScoreEstimate < 630 ? (
                <div className="text-center mt-2">
                  <p className="text-sm text-muted-foreground">Settlement Most Likely Path Forward</p>
                </div>
              ) : allFormData?.userFicoScoreEstimate >= 630 && allFormData?.userFicoScoreEstimate <= 659 ? (
                <div className="text-center mt-2">
                  <p className="text-sm text-muted-foreground">Compare Options--loan approval low</p>
                </div>
              ) : allFormData?.userFicoScoreEstimate >= 660 && allFormData?.userFicoScoreEstimate <= 719 ? (
                <div className="text-center mt-2">
                  <p className="text-sm text-muted-foreground">Eligible for loan or settlement--see what saves you more</p>
                </div>
              ) : allFormData?.userFicoScoreEstimate >= 720 ? (
                <div className="text-center mt-2">
                  <p className="text-sm text-muted-foreground">Loan + Settlement Comparison — Choose What Fits Best</p>
                </div>
              ) : null}
            </CardHeader>
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
                            Another option
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
                          <p className="text-xs text-muted-foreground">Keep making minimum payments at 24% APR.</p>
                        </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Approval Likelihood Row */}
                  <TableRow>
                    {!qualification.hideColumns.includes('momentum') && 
                        <TableCell className="text-center align-top bg-blue-50">
                          <div className="text-sm font-bold mb-2">Approval Likelihood</div>
                          <div className="text-sm font-medium">Yes, no credit required</div>
                        </TableCell>
                    }
                    {!qualification.hideColumns.includes('personalLoan') && 
                        <TableCell className="border-x text-center align-top">
                          <div className="text-sm font-bold mb-2">Approval Likelihood</div>
                          <div className="text-sm">{results.personalLoan.isEligible ? getPersonalLoanApprovalLikelihood(allFormData.userFicoScoreEstimate) : 'Not eligible'}</div>
                        </TableCell>
                    }
                    <TableCell className="text-center align-top">
                      <div className="text-sm font-bold mb-2">Approval Likelihood</div>
                      <div className="text-sm">N/A</div>
                    </TableCell>
                  </TableRow>

                  {/* Payment Details Row */}
                  <TableRow>
                    {!qualification.hideColumns.includes('momentum') && 
                        <TableCell className="text-center align-top bg-blue-50">
                          <div className="text-sm font-bold mb-2">Payment Details</div>
                          {results.momentum.isEligible ? (
                            <div className="text-sm space-y-1">
                              <div className="text-lg font-bold">{formatCurrency(results.momentum.monthlyPayment)}/mo</div>
                              <div>{results.momentum.term} months</div>
                              <div>{formatCurrency(results.debtAmountEstimate)} debt covered</div>
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
                              <div>{formatCurrency(results.personalLoan.actualLoanAmount)} debt covered</div>
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
                        <div>{formatCurrency(results.debtAmountEstimate)} debt</div>
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
                                <li><span className="font-semibold">Pros:</span> Immediate relief</li>
                                <li><span className="font-semibold">Cons:</span> Credit required, higher total cost</li>
                              </ul>
                            ) : (
                              <div>-</div>
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

                  {/* Action Buttons Row */}
                  <TableRow>
                    {!qualification.hideColumns.includes('momentum') && 
                        <TableCell className="text-center align-middle bg-blue-50 py-6">
                          <Button size="lg" className="bg-blue-600 hover:bg-blue-700 w-full max-w-48">
                            Choose Plan
                          </Button>
                        </TableCell>
                    }
                    {!qualification.hideColumns.includes('personalLoan') && 
                        <TableCell className="border-x text-center align-middle py-6">
                          <Button size="lg" variant="outline" className="w-full max-w-48">
                            Explore Loan Option
                          </Button>
                        </TableCell>
                    }
                    <TableCell className="text-center align-middle py-6">
                      <Button size="lg" variant="secondary" className="w-full max-w-48">
                        See Impact
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4">
          <h2 className="text-xl font-bold text-center">Plans that fit your situation</h2>
          {allFormData?.hasSteadyIncome === false ? (
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">See Non-Payment Based Relief Options</p>
              <Button asChild variant="link" size="sm">
                <Link href="/resources/legal-aid-partners">View Legal Aid Partners</Link>
              </Button>
            </div>
          ) : allFormData?.userFicoScoreEstimate < 630 ? (
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Settlement Most Likely Path Forward</p>
            </div>
          ) : allFormData?.userFicoScoreEstimate >= 630 && allFormData?.userFicoScoreEstimate <= 659 ? (
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Compare Options--loan approval low</p>
            </div>
          ) : allFormData?.userFicoScoreEstimate >= 660 && allFormData?.userFicoScoreEstimate <= 719 ? (
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Eligible for loan or settlement--see what saves you more</p>
            </div>
          ) : allFormData?.userFicoScoreEstimate >= 720 ? (
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Loan + Settlement Comparison — Choose What Fits Best</p>
            </div>
          ) : null}
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
                  <div><span className="font-bold">Will I be approved:</span> Yes, no minimum credit required</div>
                  <div><span className="font-bold">Program length:</span> {results.momentum.isEligible ? `${results.momentum.term} months` : '-'}</div>
                  <div><span className="font-bold">Debt covered:</span> {results.momentum.isEligible ? formatCurrency(results.debtAmountEstimate) : '-'}</div>
                </div>
                <div className="text-xs space-y-1 pt-2 border-t">
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
                  <div><span className="font-bold">Will I be approved:</span> {getPersonalLoanApprovalLikelihood(allFormData.userFicoScoreEstimate)}</div>
                  <div><span className="font-bold">Program length:</span> {results.personalLoan.isEligible ? `${results.personalLoan.term} months` : '-'}</div>
                  <div>
                    <span className="font-bold">Debt covered:</span> 
                    {results.personalLoan.isEligible ? (
                      results.personalLoan.actualLoanAmount < results.debtAmountEstimate ? (
                        <div className="mt-1">
                          <div>{formatCurrency(results.personalLoan.actualLoanAmount)}</div>
                          <div className="text-xs text-amber-600">
                            Covers only {formatCurrency(results.personalLoan.actualLoanAmount)} ({Math.round((results.personalLoan.actualLoanAmount / results.debtAmountEstimate) * 100)}%) of your total debt
                          </div>
                        </div>
                      ) : (
                        formatCurrency(results.debtAmountEstimate)
                      )
                    ) : (
                      ' -'
                    )}
                  </div>
                </div>
                <div className="text-xs space-y-1 pt-2 border-t">
                  {results.personalLoan.isEligible ? (
                    <>
                      <div><span className="font-bold">Pros:</span> Immediate relief</div>
                      <div><span className="font-bold">Cons:</span> Credit required, higher total cost</div>
                    </>
                  ) : (
                    <div>Not available</div>
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
                <div><span className="font-bold">Will I be approved:</span> N/A</div>
                <div><span className="font-bold">Program length:</span> {results.currentPath.term} months ({Math.round(results.currentPath.term / 12)} years)</div>
                <div><span className="font-bold">Debt covered:</span> {formatCurrency(results.debtAmountEstimate)}</div>
              </div>
              <div className="text-xs space-y-1 pt-2 border-t">
                <div><span className="font-bold">Pros:</span> No monthly payment</div>
                <div><span className="font-bold">Cons:</span> Growing debt, no solution</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Time to Freedom Visual Bar Graph */}
      <Card className="mt-8">
        <CardHeader className="pb-4">
          <h2 className="text-xl font-bold text-center">Time to Freedom Comparison</h2>
          <CardDescription className="text-center">
            Visual comparison of debt payoff timeline and total costs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row md:justify-center gap-3">
            {/* Calculate max values for scaling */}
            {(() => {
              const maxTerm = Math.max(
                results.momentum.isEligible ? results.momentum.term : 0,
                results.personalLoan.isEligible ? results.personalLoan.term : 0,
                results.currentPath.term
              );
              const maxCost = Math.max(
                results.momentum.isEligible ? results.momentum.totalCost : 0,
                results.personalLoan.isEligible ? results.personalLoan.totalCost : 0,
                results.currentPath.totalCost
              );
              const maxPayment = Math.max(
                results.momentum.isEligible ? results.momentum.monthlyPayment : 0,
                results.personalLoan.isEligible ? results.personalLoan.monthlyPayment : 0,
                results.currentPath.monthlyPayment
              );
              const currentDate = new Date();

              return (
                <>
                  {/* Momentum Option */}
                  {!qualification.hideColumns.includes('momentum') && results.momentum.isEligible && (() => {
                    const freedomDate = new Date(currentDate);
                    freedomDate.setMonth(freedomDate.getMonth() + results.momentum.term);
                    const savingsVsDoNothing = results.currentPath.totalCost - results.momentum.totalCost;
                    const timeSaved = results.currentPath.term - results.momentum.term;
                    
                    return (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 w-full md:max-w-sm">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <div className="font-semibold text-blue-700 text-sm">Momentum Plan</div>
                          </div>
                        </div>
                        <div className="space-y-1 mb-2">
                          {/* Monthly Payment Bar */}
                          <div className="relative">
                            <div className="text-xs text-blue-600 mb-1">Monthly Payment:</div>
                            <div 
                              className="h-5 bg-gradient-to-r from-blue-500 to-blue-600 rounded flex items-center justify-center text-white font-medium text-xs shadow-sm"
                              style={{ 
                                width: `${Math.max((results.momentum.monthlyPayment / maxPayment) * 33, 10)}%`,
                                minWidth: '80px'
                              }}
                            >
                              {formatCurrency(results.momentum.monthlyPayment)}/mo
                            </div>
                          </div>
                          {/* Time Bar */}
                          <div className="relative">
                            <div className="text-xs text-blue-600 mb-1">Time to Freedom:</div>
                            <div 
                              className="h-4 bg-gradient-to-r from-blue-400 to-blue-500 rounded flex items-center justify-center text-white font-medium text-xs shadow-sm"
                              style={{ 
                                width: `${(results.momentum.term / maxTerm) * 100}%`,
                                minWidth: '60px'
                              }}
                            >
                              {Math.round(results.momentum.term / 12)} years
                            </div>
                          </div>
                          {/* Cost Bar */}
                          <div className="relative">
                            <div className="text-xs text-blue-600 mb-1">Total Program Cost:</div>
                            <div 
                              className="h-4 bg-gradient-to-r from-blue-300 to-blue-400 rounded flex items-center justify-center text-white font-medium text-xs shadow-sm"
                              style={{ 
                                width: `${(results.momentum.totalCost / maxCost) * 100}%`,
                                minWidth: '60px'
                              }}
                            >
                              {formatCurrency(results.momentum.totalCost)}
                            </div>
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-blue-600 font-medium text-xs">
                            Save {formatCurrency(savingsVsDoNothing)} vs doing nothing
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Personal Loan Option */}
                  {!qualification.hideColumns.includes('personalLoan') && results.personalLoan.isEligible && (() => {
                    const freedomDate = new Date(currentDate);
                    freedomDate.setMonth(freedomDate.getMonth() + results.personalLoan.term);
                    const savingsVsDoNothing = results.currentPath.totalCost - results.personalLoan.totalCost;
                    const timeSaved = results.currentPath.term - results.personalLoan.term;
                    
                    return (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 w-full md:max-w-sm">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <div className="font-semibold text-gray-800 text-sm">Personal Loan</div>
                          </div>
                        </div>
                        <div className="space-y-1 mb-2">
                          {/* Monthly Payment Bar */}
                          <div className="relative">
                            <div className="text-xs text-gray-600 mb-1">Monthly Payment:</div>
                            <div 
                              className="h-5 bg-gradient-to-r from-gray-500 to-gray-600 rounded flex items-center justify-center text-white font-medium text-xs shadow-sm"
                              style={{ 
                                width: `${Math.max((results.personalLoan.monthlyPayment / maxPayment) * 33, 10)}%`,
                                minWidth: '80px'
                              }}
                            >
                              {formatCurrency(results.personalLoan.monthlyPayment)}/mo
                            </div>
                          </div>
                          {/* Time Bar */}
                          <div className="relative">
                            <div className="text-xs text-gray-600 mb-1">Time to Freedom:</div>
                            <div 
                              className="h-4 bg-gradient-to-r from-gray-400 to-gray-500 rounded flex items-center justify-center text-white font-medium text-xs shadow-sm"
                              style={{ 
                                width: `${(results.personalLoan.term / maxTerm) * 100}%`,
                                minWidth: '60px'
                              }}
                            >
                              {Math.round(results.personalLoan.term / 12)} years
                            </div>
                          </div>
                          {/* Cost Bar */}
                          <div className="relative">
                            <div className="text-xs text-gray-600 mb-1">Total Program Cost:</div>
                            <div 
                              className="h-4 bg-gradient-to-r from-gray-300 to-gray-400 rounded flex items-center justify-center text-white font-medium text-xs shadow-sm"
                              style={{ 
                                width: `${(results.personalLoan.totalCost / maxCost) * 100}%`,
                                minWidth: '60px'
                              }}
                            >
                              {formatCurrency(results.personalLoan.totalCost)}
                            </div>
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-gray-600 font-medium text-xs">
                            {savingsVsDoNothing > 0 ? `Save ${formatCurrency(savingsVsDoNothing)} vs doing nothing` : `Costs ${formatCurrency(Math.abs(savingsVsDoNothing))} more vs doing nothing`}
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Do Nothing Option */}
                  {(() => {
                    const neverFreeDate = "Never (debt keeps growing)";
                    
                    return (
                      <div className="bg-gray-50 border border-gray-300 rounded-lg p-3 w-full md:max-w-sm">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900 text-sm">Current Path</div>
                          </div>
                        </div>
                        <div className="space-y-1 mb-2">
                          {/* Monthly Payment Bar */}
                          <div className="relative">
                            <div className="text-xs text-gray-700 mb-1">Monthly Payment:</div>
                            <div 
                              className="h-5 bg-gradient-to-r from-gray-500 to-gray-600 rounded flex items-center justify-center text-white font-medium text-xs shadow-sm"
                              style={{ 
                                width: `${Math.max((results.currentPath.monthlyPayment / maxPayment) * 33, 10)}%`,
                                minWidth: '80px'
                              }}
                            >
                              {formatCurrency(results.currentPath.monthlyPayment)}/mo
                            </div>
                          </div>
                          {/* Time Bar */}
                          <div className="relative">
                            <div className="text-xs text-gray-700 mb-1">Time to Freedom:</div>
                            <div 
                              className="h-4 bg-gradient-to-r from-gray-600 to-gray-700 rounded flex items-center justify-center text-white font-medium text-xs shadow-sm relative overflow-hidden"
                              style={{ width: '100%' }}
                            >
                              <div className="absolute inset-0 bg-gray-800 opacity-30 animate-pulse"></div>
                              <span className="relative z-10">{Math.round(results.currentPath.term / 12)}+ years (debt grows)</span>
                            </div>
                          </div>
                          {/* Cost Bar */}
                          <div className="relative">
                            <div className="text-xs text-gray-700 mb-1">Total Program Cost:</div>
                            <div 
                              className="h-4 bg-gradient-to-r from-gray-600 to-gray-700 rounded flex items-center justify-center text-white font-medium text-xs shadow-sm relative overflow-hidden"
                              style={{ width: '100%' }}
                            >
                              <div className="absolute inset-0 bg-gray-800 opacity-30 animate-pulse"></div>
                              <span className="relative z-10">{formatCurrency(results.currentPath.totalCost)}+ (keeps growing)</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-gray-700 font-medium text-xs">
                            Costliest option
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </>
              );
            })()}
          </div>
        </CardContent>
      </Card>

      {/* Momentum Score Section */}
      {qualification.showScore && (
        <Card className="mt-8">
          <CardHeader className="pb-4 text-center">
            <h3 className="text-xl font-bold">Momentum Score: {momentumScore.score}/95</h3>
            <CardDescription>
              Take all assessments to see if settlement is right for you
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Smart Estimator Chart - First */}
              <div className="flex flex-col items-center space-y-2">
                <h4 className="text-base font-semibold">Smart Estimator</h4>
                <ChartContainer
                  config={{
                    score: { label: "Score", color: "hsl(221, 83%, 53%)" },
                    remaining: { label: "Remaining", color: "hsl(210, 40%, 90%)" }
                  } satisfies ChartConfig}
                  className="mx-auto aspect-square w-full max-w-[150px]"
                >
                  <RadialBarChart
                    data={[{ score: momentumScore.score, remaining: 50 - momentumScore.score }]}
                    endAngle={180}
                    innerRadius={60}
                    outerRadius={90}
                  >
                    <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                      <Label
                        content={({ viewBox }) => {
                          if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                            return (
                              <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                                <tspan
                                  x={viewBox.cx}
                                  y={(viewBox.cy || 0) - 16}
                                  className="fill-foreground text-2xl font-bold"
                                >
                                  {momentumScore.score}
                                </tspan>
                                <tspan
                                  x={viewBox.cx}
                                  y={(viewBox.cy || 0) + 4}
                                  className="fill-muted-foreground"
                                >
                                  of 50
                                </tspan>
                              </text>
                            )
                          }
                        }}
                      />
                    </PolarRadiusAxis>
                    <RadialBar
                      dataKey="score"
                      stackId="a"
                      cornerRadius={5}
                      fill="var(--color-score)"
                      className="stroke-transparent stroke-2"
                    />
                    <RadialBar
                      dataKey="remaining"
                      fill="var(--color-remaining)"
                      stackId="a"
                      cornerRadius={5}
                      className="stroke-transparent stroke-2"
                    />
                  </RadialBarChart>
                </ChartContainer>
                <p className="text-xs text-center text-muted-foreground">
                  Current assessment score
                </p>
              </div>

              {/* Readiness Chart - Second */}
              <div className="flex flex-col items-center space-y-2">
                <h4 className="text-base font-semibold">Readiness</h4>
                <ChartContainer
                  config={{
                    score: { label: "Score", color: "hsl(142, 76%, 36%)" },
                    remaining: { label: "Remaining", color: "hsl(210, 40%, 90%)" }
                  } satisfies ChartConfig}
                  className="mx-auto aspect-square w-full max-w-[150px]"
                >
                  <RadialBarChart
                    data={[{ score: 0, remaining: 50 }]}
                    endAngle={180}
                    innerRadius={60}
                    outerRadius={90}
                  >
                    <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                      <Label
                        content={({ viewBox }) => {
                          if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                            return (
                              <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                                <tspan
                                  x={viewBox.cx}
                                  y={(viewBox.cy || 0) - 16}
                                  className="fill-foreground text-2xl font-bold"
                                >
                                  0
                                </tspan>
                                <tspan
                                  x={viewBox.cx}
                                  y={(viewBox.cy || 0) + 4}
                                  className="fill-muted-foreground"
                                >
                                  of 50
                                </tspan>
                              </text>
                            )
                          }
                        }}
                      />
                    </PolarRadiusAxis>
                    <RadialBar
                      dataKey="score"
                      stackId="a"
                      cornerRadius={5}
                      fill="var(--color-score)"
                      className="stroke-transparent stroke-2"
                    />
                    <RadialBar
                      dataKey="remaining"
                      fill="var(--color-remaining)"
                      stackId="a"
                      cornerRadius={5}
                      className="stroke-transparent stroke-2"
                    />
                  </RadialBarChart>
                </ChartContainer>
                <Button asChild size="sm" className="mt-2">
                  <Link href="/readiness-tool">Take Assessment</Link>
                </Button>
              </div>

              {/* Creditor Profile Chart - Third */}
              <div className="flex flex-col items-center space-y-2">
                <h4 className="text-base font-semibold">Creditor Profile</h4>
                <ChartContainer
                  config={{
                    score: { label: "Score", color: "hsl(262, 83%, 58%)" },
                    remaining: { label: "Remaining", color: "hsl(210, 40%, 90%)" }
                  } satisfies ChartConfig}
                  className="mx-auto aspect-square w-full max-w-[150px]"
                >
                  <RadialBarChart
                    data={[{ score: 0, remaining: 50 }]}
                    endAngle={180}
                    innerRadius={60}
                    outerRadius={90}
                  >
                    <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                      <Label
                        content={({ viewBox }) => {
                          if (viewBox.cx && viewBox.cy) {
                            return (
                              <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                                <tspan
                                  x={viewBox.cx}
                                  y={(viewBox.cy || 0) - 16}
                                  className="fill-foreground text-2xl font-bold"
                                >
                                  0
                                </tspan>
                                <tspan
                                  x={viewBox.cx}
                                  y={(viewBox.cy || 0) + 4}
                                  className="fill-muted-foreground"
                                >
                                  of 50
                                </tspan>
                              </text>
                            )
                          }
                        }}
                      />
                    </PolarRadiusAxis>
                    <RadialBar
                      dataKey="score"
                      stackId="a"
                      cornerRadius={5}
                      fill="var(--color-score)"
                      className="stroke-transparent stroke-2"
                    />
                    <RadialBar
                      dataKey="remaining"
                      fill="var(--color-remaining)"
                      stackId="a"
                      cornerRadius={5}
                      className="stroke-transparent stroke-2"
                    />
                  </RadialBarChart>
                </ChartContainer>
                <Button asChild size="sm" className="mt-2">
                  <Link href="/creditor-profile">Take Assessment</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      <div className="mt-8 text-center">
        <Button asChild onClick={handleRestart} variant="link">
          <Link href="/smart-estimator/step-1">Start Over</Link>
        </Button>
      </div>
      
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

      <Card className="mt-8">
        <CardHeader>
          <h3 className="text-base font-semibold">Testing &amp; Debugging Information</h3>
          <CardDescription>This section is for testing purposes only.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold">Collected Form Data</h4>
            <pre className="mt-2 rounded-md bg-slate-100 p-4 text-sm">
              <code>{JSON.stringify(allFormData, null, 2)}</code>
            </pre>
          </div>
          <div>
            <h4 className="font-semibold">Calculation Results</h4>
            <pre className="mt-2 rounded-md bg-slate-100 p-4 text-sm">
              <code>{JSON.stringify(results, null, 2)}</code>
            </pre>
          </div>
          <div>
            <h4 className="font-semibold">Qualification Rules Applied</h4>
            <pre className="mt-2 rounded-md bg-slate-100 p-4 text-sm">
              <code>{JSON.stringify(qualification, null, 2)}</code>
            </pre>
          </div>
          <div>
            <h4 className="font-semibold">Momentum Score Details</h4>
            <pre className="mt-2 rounded-md bg-slate-100 p-4 text-sm">
              <code>{JSON.stringify(momentumScore, null, 2)}</code>
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
