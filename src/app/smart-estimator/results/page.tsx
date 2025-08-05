"use client";

import * as React from 'react';
import { useEstimatorStore } from '@/lib/estimator-store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  calculateMonthlyMomentumPayment,
  calculateMonthlyStandardPayment,
  calculatePersonalLoanPayment,
  getMomentumTermLength,
  getStandardTermLength,
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

function getQualificationStatus(formData: any, momentumScore: any): Qualification {
  const { debtAmountEstimate, hasSteadyIncome, userFicoScoreEstimate } = formData;

  // Initialize column hiding array
  const hideColumns: string[] = [];
  
  // STEP 1: Check income first
  if (hasSteadyIncome === false) {
    hideColumns.push("personalLoan"); // Disable loan offer
    
    return {
      status: "No Income - Limited Options",
      hideColumns: hideColumns,
      primaryCTA: "See Non-Payment Based Solutions",
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
      primaryCTA: "Review Settlement Options",
      secondaryCTA: "Review How It Works",
      message: "Most clients in this range succeed through settlement. Based on your credit profile, debt settlement is typically the most effective path forward.",
      showScore: true,
      scoreMessage: "Settlement programs are designed for your credit range."
    };
  }

  // FICO 630-659 AND debt > $15K
  if (userFicoScoreEstimate >= 630 && userFicoScoreEstimate <= 659 && debtAmountEstimate > 15000) {
    // Highlight Settlement (show all columns but emphasize settlement)
    return {
      status: "Compare Options - Loan Approval Low",
      hideColumns: hideColumns,
      primaryCTA: "Compare Your Options",
      secondaryCTA: "Estimate Your Savings",
      message: "Compare plan options — loans may not help. Your credit may qualify for loans, but settlement often provides better savings for your situation.",
      showScore: true,
      scoreMessage: "Loan approval rates are lower in this credit range - settlement may save more."
    };
  }

  // FICO 660-719 AND debt > $10K
  if (userFicoScoreEstimate >= 660 && userFicoScoreEstimate <= 719 && debtAmountEstimate > 10000) {
    // Show All 3 Columns
    return {
      status: "Multiple Options Available",
      hideColumns: hideColumns,
      primaryCTA: "Explore Both Paths",
      secondaryCTA: "Use Smart Estimator",
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
      primaryCTA: "Choose Your Best-Fit Plan",
      secondaryCTA: "Apply Now or Speak With Us",
      message: "Loan + settlement comparison — choose what fits best. Your excellent credit qualifies you for the best rates and terms across all programs.",
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
  const [isReady, setIsReady] = React.useState(false);


  const [allFormData, setAllFormData] = React.useState<any>(null);
  const [results, setResults] = React.useState<any>(null);
  const [qualification, setQualification] = React.useState<Qualification | null>(null);
  const [momentumScore, setMomentumScore] = React.useState<any>(null);

  React.useEffect(() => {
      if (store._hasHydrated) {
          setIsReady(true);
      }
  }, [store._hasHydrated]);

  React.useEffect(() => {
    // Wait for the store to be hydrated before doing anything.
    if (!isReady) {
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
      'monthlyIncomeEstimate',
      'hasSteadyIncome',
      'monthlyPaymentEstimate',
      'currentPaymentStatus',
      'userFicoScoreEstimate',
    ];

    const hasAllData = requiredKeys.every(key => key in collectedData && collectedData[key] !== undefined);

    if (!hasAllData) {
      router.push('/smart-estimator/step-1');
      return;
    }

    try {
      setAllFormData(collectedData);
        
      const { 
        debtAmountEstimate, 
        userFicoScoreEstimate,
        hasSteadyIncome,
        monthlyIncomeEstimate,
        monthlyPaymentEstimate,
        creditorCountEstimate,
      } = collectedData;

      // Calculate Momentum Score
      const momentumScoreData = calculateMomentumScore({
          debtAmountEstimate,
          monthlyIncomeEstimate,
          monthlyPaymentEstimate,
          creditorCountEstimate
      });
      setMomentumScore(momentumScoreData);

      // Get qualification status
      const qualificationStatus = getQualificationStatus(collectedData, momentumScoreData);
      setQualification(qualificationStatus);
      
      // Calculate Momentum and Standard payments
      const momentumMonthlyPayment = calculateMonthlyMomentumPayment(debtAmountEstimate);
      const momentumTerm = getMomentumTermLength(debtAmountEstimate);
      
      const standardMonthlyPayment = calculateMonthlyStandardPayment(debtAmountEstimate);
      const standardTerm = getStandardTermLength(debtAmountEstimate);

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
        standard: {
          monthlyPayment: standardMonthlyPayment,
          term: standardTerm,
          isEligible: debtAmountEstimate >= 10000,
          totalCost: standardMonthlyPayment * standardTerm,
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
  }, [isReady, store.formData, router]);

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
      if (qualification.primaryCTA === "See Non-Payment Based Solutions") {
        return (
          <Button asChild size="lg">
            <Link href="/resources/income-free-debt-options">{qualification.primaryCTA}</Link>
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
        if (qualification.secondaryCTA === "Schedule Call") {
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
        <h1 className="text-3xl font-bold">You are building momentum!</h1>
        <p className="text-muted-foreground">Here are your results</p>
      </div>

      {qualification.showScore && (
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Momentum Score</CardTitle>
            <CardDescription>You've added {momentumScore.totalScore} points to your score!!</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="momentum-score-section flex flex-col items-center text-center">
              <div
                className="score-bar relative mb-4 h-3 rounded-full bg-gray-200"
                style={{ maxWidth: '384px', width: '100%' }}
              >
                <div
                  className="progress-fill h-full rounded-full bg-primary transition-all"
                  style={{
                    width: `${(momentumScore.totalScore / 95) * 100}%`,
                  }}
                />
                <div
                  className="absolute -top-6 -translate-x-1/2 rounded-md bg-primary px-2 py-1 text-xs font-bold text-primary-foreground"
                  style={{
                    left: `${(momentumScore.totalScore / 95) * 100}%`,
                  }}
                >
                  {momentumScore.totalScore}
                </div>
              </div>
              <div
                className="milestones relative mb-8 text-xs text-muted-foreground"
                style={{ maxWidth: '384px', width: '100%' }}
              >
                {[50, 70, 75].map((milestone) => (
                  <div
                    key={milestone}
                    className="absolute -translate-x-1/2"
                    style={{ left: `${(milestone / 95) * 100}%` }}
                  >
                    {milestone}
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center">
                <p className="text-sm text-muted-foreground">Earn more Momentum points</p>
                <div className="mt-2 flex justify-center gap-4">
                  <Button asChild variant="link">
                    <Link href="/readiness-tool">Readiness Tool</Link>
                  </Button>
                  <Button asChild variant="link">
                    <Link href="/customize-plan">Customize Plan</Link>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="text-center">
          <CardTitle>Plans that fit your situation</CardTitle>
            <CardDescription>
              These plans are designed to help with an estimated debt of{' '}
              <span className="font-bold text-foreground">{formatCurrency(results.debtAmountEstimate)}</span>.
            </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                {!qualification.hideColumns.includes('momentum') && <TableHead className="w-1/4 pb-4 text-center align-top">
                    <p className="text-lg font-semibold">Momentum Plan</p>
                    <p className="text-xs text-muted-foreground">Pay off debt faster with a lower monthly payment.</p>
                </TableHead>}
                {!qualification.hideColumns.includes('personalLoan') && <TableHead className="w-1/4 border-x pb-4 text-center align-top">
                    <p className="text-lg font-semibold">Personal Loan</p>
                    <p className="text-xs text-muted-foreground">Consolidate into one payment, but with high interest.</p>
                    {results.personalLoan.isEligible && results.personalLoan.actualLoanAmount < results.debtAmountEstimate && (
                      <div className="mt-1 text-xs font-normal text-amber-600">
                        ⚠️ Covers only {formatCurrency(results.personalLoan.actualLoanAmount)} ({Math.round((results.personalLoan.actualLoanAmount / results.debtAmountEstimate) * 100)}%) of your total debt.
                      </div>
                    )}
                </TableHead>}
                {!qualification.hideColumns.includes('standard') && <TableHead className="w-1/4 border-x pb-4 text-center align-top">
                    <p className="text-lg font-semibold">Standard Plan</p>
                    <p className="text-xs text-muted-foreground">A longer program term that might be easier to manage.</p>
                </TableHead>}
                <TableHead className="w-1/4 bg-red-50 pb-4 text-center align-top">
                    <p className="text-lg font-semibold text-red-700">Current Path</p>
                    <p className="text-xs text-red-600">Keep making minimum payments at 24% APR.</p>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                {!qualification.hideColumns.includes('momentum') && 
                    <TableCell className="text-center align-top">
                      {results.momentum.isEligible ? <p className="text-3xl font-bold">{formatCurrency(results.momentum.monthlyPayment)}/mo</p> : <p className="text-muted-foreground">Not Eligible</p>}
                    </TableCell>
                }
                {!qualification.hideColumns.includes('personalLoan') && 
                    <TableCell className="border-x text-center align-top">
                      {results.personalLoan.isEligible ? (
                        <>
                          <p className="text-3xl font-bold">{formatCurrency(results.personalLoan.monthlyPayment)}/mo</p>
                        </>
                        ) : (
                          <p className="text-muted-foreground">Not Eligible</p>
                        )}
                    </TableCell>
                }
                {!qualification.hideColumns.includes('standard') && 
                    <TableCell className="border-x text-center align-top">
                    {results.standard.isEligible ? <p className="text-3xl font-bold">{formatCurrency(results.standard.monthlyPayment)}/mo</p> : <p className="text-muted-foreground">Not Eligible</p>}
                    </TableCell>
                }
                <TableCell className="bg-red-50 text-center align-top">
                  <p className="text-3xl font-bold text-red-700">{formatCurrency(results.currentPath.monthlyPayment)}/mo</p>
                  <p className="mt-1 text-xs text-red-600">Then decreasing</p>
                </TableCell>
              </TableRow>
              <TableRow>
                {!qualification.hideColumns.includes('momentum') && <TableCell className="text-center align-top">{results.momentum.isEligible ? `${results.momentum.term} Month Program` : '-'}</TableCell>}
                {!qualification.hideColumns.includes('personalLoan') && <TableCell className="border-x text-center align-top">{results.personalLoan.isEligible ? `${results.personalLoan.term} Month Program` : '-'}</TableCell>}
                {!qualification.hideColumns.includes('standard') && <TableCell className="border-x text-center align-top">{results.standard.isEligible ? `${results.standard.term} Month Program` : '-'}</TableCell>}
                <TableCell className="bg-red-50 text-center align-top">
                  <span className="text-red-700">{results.currentPath.term} Months</span>
                  <p className="mt-1 text-xs text-red-600">({Math.round(results.currentPath.term / 12)} years)</p>
                </TableCell>
              </TableRow>
              <TableRow>
                {!qualification.hideColumns.includes('momentum') && <TableCell className="text-center align-top">{results.momentum.isEligible ? `Total Cost: ${formatCurrency(results.momentum.totalCost)}` : '-'}</TableCell>}
                {!qualification.hideColumns.includes('personalLoan') && <TableCell className="border-x text-center align-top">{results.personalLoan.isEligible ? `Total Cost: ${formatCurrency(results.personalLoan.totalCost)}` : '-'}</TableCell>}
                {!qualification.hideColumns.includes('standard') && <TableCell className="border-x text-center align-top">{results.standard.isEligible ? `Total Cost: ${formatCurrency(results.standard.totalCost)}` : '-'}</TableCell>}
                <TableCell className="bg-red-50 text-center align-top">
                  <span className="font-semibold text-red-700">Total Cost: {formatCurrency(results.currentPath.totalCost)}</span>
                  <p className="mt-1 text-xs text-red-600">({Math.round((results.currentPath.totalCost / results.debtAmountEstimate) * 10) / 10}x your debt!)</p>
                </TableCell>
              </TableRow>
              <TableRow>
                  {!qualification.hideColumns.includes('momentum') && (
                    <TableCell className="text-center text-xs text-muted-foreground align-top">
                      <p className="font-bold">Why it matters:</p>Shorter term = Faster freedom + Less total cost (lower direct &amp; 3rd-party fees).
                    </TableCell>
                  )}
                  {!qualification.hideColumns.includes('personalLoan') && (
                    <TableCell className="border-x text-center text-xs text-muted-foreground align-top">
                      {results.personalLoan.isEligible ? (
                        <>
                          <p className="font-bold">Why it matters:</p> Requires strong credit; total payback can exceed current balances.
                        </>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                  )}
                  {!qualification.hideColumns.includes('standard') && (
                    <TableCell className="border-x text-center text-xs text-muted-foreground align-top">
                      <p className="font-bold">Why it matters:</p> Lower payments can provide budget flexibility, but may cost more over time.
                    </TableCell>
                  )}
                  <TableCell className="bg-red-50 text-center text-xs text-red-600 align-top">
                    <p className="font-bold">Why it's dangerous:</p>
                    You'll pay {Math.round((results.currentPath.totalCost / results.debtAmountEstimate) * 10) / 10}x your original debt over {Math.round(results.currentPath.term / 12)} years - that's {formatCurrency(results.currentPath.totalCost - results.debtAmountEstimate)} in interest alone!
                  </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Alert>
        <AlertTitle>{qualification.status}</AlertTitle>
        <AlertDescription>{qualification.message}</AlertDescription>
      </Alert>
      
      <div className="mt-8 space-y-4 text-center">
            <div className="cta-buttons flex flex-row items-center justify-center gap-4">
              {renderCtas()}
            </div>
            <Button asChild onClick={handleRestart} variant="link">
              <Link href="/smart-estimator/step-1">Start Over</Link>
            </Button>
        </div>
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Why Momentum May Be Better</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Low monthly cost, shorter term = less stress + faster recovery.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Why Loans Can Backfire</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Higher APRs mean you might repay more than you owe today — even if it looks smaller monthly.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Why Current Path is Dangerous</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              At 24% APR with minimum payments, you'll pay {Math.round((results.currentPath.totalCost / results.debtAmountEstimate) * 10) / 10}x your original debt and stay trapped for {Math.round(results.currentPath.term / 12)} years - wasting {formatCurrency(results.currentPath.totalCost - results.debtAmountEstimate)} on interest.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Testing &amp; Debugging Information</CardTitle>
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
