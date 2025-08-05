

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

  // NEW APPROACH: Check all disqualifying factors first
  const hideColumns: string[] = [];
  
  // Check all disqualifying factors
  const tooLittleDebt = debtAmountEstimate < 15000;
  const tooMuchDebt = debtAmountEstimate >= 50000;
  const noIncome = hasSteadyIncome === false;
  const poorCredit = userFicoScoreEstimate < 620;
  
  // Apply column hiding rules
  if (tooLittleDebt) hideColumns.push("momentum");
  if (noIncome || poorCredit) hideColumns.push("personalLoan");
  
  // Determine primary status based on most restrictive condition
  if (tooMuchDebt) {
    return {
      status: "Needs Specialist Consultation",
      hideColumns: hideColumns,
      primaryCTA: "Schedule Consultation",
      message: "For debt over $50,000, let's discuss your custom options.",
      showScore: true,
      scoreMessage: "High debt amounts require personalized consultation."
    };
  }
  
  // Handle multiple qualification issues
  if (tooLittleDebt && noIncome) {
    return {
      status: "Multiple Qualification Issues",
      hideColumns: hideColumns, // Both momentum and personalLoan hidden
      primaryCTA: "Explore Other Options",
      message: "Debt below $15,000 and income requirements limit most program options.",
      showScore: true,
      scoreMessage: "Standard debt management may be your best current option."
    };
  }
  
  if (tooLittleDebt && poorCredit) {
    return {
      status: "Multiple Qualification Issues",
      hideColumns: hideColumns, // Both momentum and personalLoan hidden  
      primaryCTA: "Explore Other Options",
      message: "Debt below $15,000 and credit requirements limit most program options.",
      showScore: true,
      scoreMessage: "Focus on building credit and consider debt consolidation alternatives."
    };
  }
  
  // Single disqualifying factors
  if (tooLittleDebt) {
    return {
      status: "Not Qualified - Too Little Debt",
      hideColumns: hideColumns,
      primaryCTA: "Explore Other Options",
      message: "Momentum programs start at $15,000. Here are other solutions:",
      showScore: true,
      scoreMessage: "Your score shows potential, but debt amount is below our minimum."
    };
  }
  
  if (noIncome) {
    return {
      status: "Not Qualified - No Income",
      hideColumns: hideColumns,
      primaryCTA: "See Income-Free Options",
      secondaryCTA: "Schedule a call",
      message: "We understand income challenges. Here are alternative resources:",
      showScore: true,
      scoreMessage: "Steady income is required for most debt relief programs."
    };
  }
  
  if (poorCredit) {
    return {
      status: "Poor Credit - Limited Options",
      hideColumns: hideColumns,
      primaryCTA: "Build My Score",
      secondaryCTA: "Learn About Debt Relief",
      message: "Credit score below 620 limits personal loan options. Focus on debt settlement programs.",
      showScore: true,
      scoreMessage: "Improve your credit and complete our assessment for more options."
    };
  }
  
  // Score-based qualification for fully qualified users
  if (momentumScore.totalScore >= 35) {
    return {
      status: "Qualified - Good Progress",
      hideColumns: hideColumns,
      primaryCTA: "Get My Personalized Plan",
      secondaryCTA: "Continue Full Assessment",
      message: "You're showing strong potential for debt relief success.",
      showScore: true,
      scoreMessage: "Complete our full assessment to potentially reach 75+ points and qualify for VIP enrollment."
    };
  }
  
  return {
    status: "Needs Assessment",
    hideColumns: hideColumns,
    primaryCTA: "Build My Score",
    secondaryCTA: "Learn About Debt Relief",
    message: "Complete our readiness assessment to determine your best options.",
    showScore: true,
    scoreMessage: "Your score shows room for improvement. Our assessment will help identify the best path forward."
  };
}

export default function Results() {
  const store = useEstimatorStore();
  const [isInitialized, setIsInitialized] = React.useState(false);

  const [allFormData, setAllFormData] = React.useState<any>(null);
  const [results, setResults] = React.useState<any>(null);
  const [qualification, setQualification] = React.useState<Qualification | null>(null);
  const [momentumScore, setMomentumScore] = React.useState<any>(null);

  React.useEffect(() => {
    if (store && !isInitialized && store._hasHydrated) {
      const { formData } = store;
      const collectedData = Object.keys(formData).length > 0
        ? Object.values(formData).reduce((acc, curr) => ({ ...acc, ...curr }), {})
        : {};
      
      if (Object.keys(collectedData).length === 0) {
        return;
      }
      
      setAllFormData(collectedData);
      
      const { 
        debtAmountEstimate = 0, 
        userFicoScoreEstimate = 0,
        hasSteadyIncome,
        monthlyIncomeEstimate = 0,
        monthlyPaymentEstimate = 0,
        creditorCountEstimate = 0,
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
      const actualLoanAmount = Math.min(debtAmountEstimate, maxLoanAmount); // FIX: Use actual available amount
      const canGetLoan = actualLoanAmount >= 1000 && userFicoScoreEstimate >= 620 && hasSteadyIncome !== false;
      const personalLoanMonthlyPayment = canGetLoan ? calculatePersonalLoanPayment(actualLoanAmount, personalLoanApr) : 0; // FIX: Use actual amount
      
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
          actualLoanAmount: actualLoanAmount, // FIX: Add actual loan amount
          maxAvailable: maxLoanAmount,        // FIX: Add max available
          isEligible: canGetLoan,
          totalCost: personalLoanMonthlyPayment * 36,
        }
      };
      setResults(resultsData);
      setIsInitialized(true);
    }
  }, [store, isInitialized]);

  const formatCurrency = (value: number) => {
    if (typeof value !== 'number' || isNaN(value)) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };
  
  if (!results || !qualification || !momentumScore || !allFormData) {
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
  }

  const handleCTAClick = (cta: string) => {
    // Placeholder for CTA handling
    console.log(`${cta} button clicked`);
  };

  const renderCtas = () => {
    if (!qualification) return null;

    const primaryCTAComponent = () => {
      if (qualification.primaryCTA === "See Income-Free Options") {
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

    return (
      <div className="cta-buttons flex flex-col items-center gap-4">
        {primaryCTAComponent()}
        {qualification.secondaryCTA && (
          <Button onClick={() => handleCTAClick(qualification.secondaryCTA)} variant="secondary">
            {qualification.secondaryCTA}
          </Button>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Here are your results</h1>
        <Alert>
          <AlertTitle>{qualification.status}</AlertTitle>
          <AlertDescription>{qualification.message}</AlertDescription>
        </Alert>
      </div>

      {qualification.showScore && (
        <Card>
          <CardHeader>
            <CardTitle>Your Momentum Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="momentum-score-section text-center">
              <div className="score-display mb-5 flex items-baseline justify-center gap-2">
                <span className="text-5xl font-bold text-primary">
                  {momentumScore.totalScore}
                </span>
                <span className="text-2xl text-muted-foreground">/ 95</span>
              </div>

              <div className="score-bar relative mb-4 h-3 rounded-full bg-gray-200">
                <div
                  className="progress-fill h-full rounded-full bg-primary transition-all"
                  style={{
                    width: `${(momentumScore.totalScore / 95) * 100}%`,
                  }}
                />
                <div className="milestone absolute top-[-25px] left-[52.6%] -translate-x-1/2 text-xs font-bold text-muted-foreground">
                  50
                </div>
                <div className="milestone absolute top-[-25px] left-[78.9%] -translate-x-1/2 text-xs font-bold text-muted-foreground">
                  75
                </div>
              </div>
              <div className="score-message rounded-lg border p-4 my-4 bg-secondary">
                  <h4 className="font-semibold mb-2 text-secondary-foreground">
                    {momentumScore.totalScore >= 35 ? "Good Progress!" : "Let's Build Your Score"}
                  </h4>
                  <p className="text-sm text-secondary-foreground">
                    {qualification.scoreMessage}
                  </p>
              </div>

            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
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
                {!qualification.hideColumns.includes('momentum') && <TableHead className="w-1/3 text-center pb-4 align-top">
                    <p className="text-lg font-semibold">Momentum Plan</p>
                    <p className="text-xs text-muted-foreground">Pay off debt faster with a lower monthly payment.</p>
                </TableHead>}
                {!qualification.hideColumns.includes('personalLoan') && <TableHead className="w-1/3 text-center border-x pb-4 align-top">
                    <p className="text-lg font-semibold">Personal Loan</p>
                    <p className="text-xs text-muted-foreground">Consolidate into one payment, but with high interest.</p>
                    {results.personalLoan.isEligible && results.personalLoan.actualLoanAmount < results.debtAmountEstimate && (
                      <div className="text-amber-600 mt-1 text-xs font-normal">
                        ⚠️ Covers only {formatCurrency(results.personalLoan.actualLoanAmount)} ({Math.round((results.personalLoan.actualLoanAmount / results.debtAmountEstimate) * 100)}%) of your total debt.
                      </div>
                    )}
                </TableHead>}
                {!qualification.hideColumns.includes('standard') && <TableHead className="w-1/3 text-center pb-4 align-top">
                    <p className="text-lg font-semibold">Standard Plan</p>
                    <p className="text-xs text-muted-foreground">A longer program term that might be easier to manage.</p>
                </TableHead>}
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
                    <TableCell className="text-center border-x align-top">
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
                    <TableCell className="text-center align-top">
                    {results.standard.isEligible ? <p className="text-3xl font-bold">{formatCurrency(results.standard.monthlyPayment)}/mo</p> : <p className="text-muted-foreground">Not Eligible</p>}
                    </TableCell>
                }
              </TableRow>
              <TableRow>
                {!qualification.hideColumns.includes('momentum') && <TableCell className="text-center align-top">{results.momentum.isEligible ? `${results.momentum.term} Month Program` : '-'}</TableCell>}
                {!qualification.hideColumns.includes('personalLoan') && <TableCell className="text-center border-x align-top">{results.personalLoan.isEligible ? `${results.personalLoan.term} Month Program` : '-'}</TableCell>}
                {!qualification.hideColumns.includes('standard') && <TableCell className="text-center align-top">{results.standard.isEligible ? `${results.standard.term} Month Program` : '-'}</TableCell>}
              </TableRow>
              <TableRow>
                {!qualification.hideColumns.includes('momentum') && <TableCell className="text-center align-top">{results.momentum.isEligible ? `Total Cost: ${formatCurrency(results.momentum.totalCost)}` : '-'}</TableCell>}
                {!qualification.hideColumns.includes('personalLoan') && <TableCell className="text-center border-x align-top">{results.personalLoan.isEligible ? `Total Cost: ${formatCurrency(results.personalLoan.totalCost)}` : '-'}</TableCell>}
                {!qualification.hideColumns.includes('standard') && <TableCell className="text-center align-top">{results.standard.isEligible ? `Total Cost: ${formatCurrency(results.standard.totalCost)}` : '-'}</TableCell>}
              </TableRow>
              <TableRow>
                  {!qualification.hideColumns.includes('momentum') && (
                    <TableCell className="text-center text-xs text-muted-foreground align-top">
                      <p className="font-bold">Why it matters:</p>Shorter term = Faster freedom + Less total cost (lower direct & 3rd-party fees).
                    </TableCell>
                  )}
                  {!qualification.hideColumns.includes('personalLoan') && (
                    <TableCell className="text-center text-xs text-muted-foreground border-x align-top">
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
                    <TableCell className="text-center text-xs text-muted-foreground align-top">
                      <p className="font-bold">Why it matters:</p> Lower payments can provide budget flexibility, but may cost more over time.
                    </TableCell>
                  )}
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <div className="text-center mt-8 space-y-4">
            {renderCtas()}
            {qualification.showScore && qualification.scoreMessage && (
                <div className="score-context" style={{
                    fontSize: '14px',
                    color: '#6c757d',
                    marginTop: '12px',
                    fontStyle: 'italic'
                }}>
                    {qualification.scoreMessage}
                </div>
            )}
            <Button asChild onClick={handleRestart} variant="link">
              <Link href="/smart-estimator/step-1">Start Over</Link>
            </Button>
        </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            <CardTitle>Why Standard Plans Lag</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Low payment, but longer payoff. You wait months longer at increased cost and risk for financial freedom.</p>
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
