
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

const ProgressCircle = ({ score, maxScore, label, color, status }: { score: number, maxScore: number, label: string, color: string, status?: string }) => {
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const offset = status === "Not Started" ? circumference : circumference - (score / maxScore) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="120" height="120" viewBox="0 0 120 120" className="transform -rotate-90">
        <circle
          cx="60"
          cy="60"
          r={radius}
          strokeWidth="10"
          className="text-gray-200"
          fill="transparent"
          stroke="currentColor"
        />
        <circle
          cx="60"
          cy="60"
          r={radius}
          strokeWidth="10"
          className={status === "Not Started" ? "text-gray-200" : color}
          fill="transparent"
          stroke="currentColor"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
        />
        <text
          x="60"
          y="60"
          textAnchor="middle"
          dy=".3em"
          className="transform rotate-90 origin-center fill-current text-foreground font-bold"
          style={{ fontSize: status ? '14px' : '24px' }}
        >
          {status ? status : score}
        </text>
      </svg>
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
    </div>
  );
};


export default function Results() {
  const { formData, reset } = useEstimatorStore();
  const [allFormData, setAllFormData] = React.useState<any>(null);
  const [results, setResults] = React.useState<any>(null);
  const [qualification, setQualification] = React.useState<Qualification | null>(null);
  const [momentumScore, setMomentumScore] = React.useState<any>(null);

  React.useEffect(() => {
    const collectedData = Object.values(formData).reduce((acc, curr) => ({ ...acc, ...curr }), {});
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
    
    setResults({
      debtAmountEstimate,
      momentum: {
        monthlyPayment: momentumMonthlyPayment,
        term: momentumTerm,
        isEligible: debtAmountEstimate >= 15000,
      },
      standard: {
        monthlyPayment: standardMonthlyPayment,
        term: standardTerm,
        isEligible: debtAmountEstimate >= 10000,
      },
      personalLoan: {
        monthlyPayment: personalLoanMonthlyPayment,
        term: 36,
        apr: personalLoanApr,
        actualLoanAmount: actualLoanAmount, // FIX: Add actual loan amount
        maxAvailable: maxLoanAmount,        // FIX: Add max available
        isEligible: canGetLoan,
      }
    });

  }, [formData]);

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
    reset();
  }

  const handleCTAClick = (cta: string) => {
    // Placeholder for CTA handling
    console.log(`${cta} button clicked`);
  };

  const renderCtas = () => {
    if (!qualification) return null;
    return (
      <div className="cta-buttons flex flex-col items-center gap-4">
        <Button onClick={() => handleCTAClick(qualification.primaryCTA)} size="lg">
          {qualification.primaryCTA}
        </Button>
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
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Here are your results</CardTitle>
          <div className="pt-4">
             <Alert>
                <AlertTitle>{qualification.status}</AlertTitle>
                <AlertDescription>{qualification.message}</AlertDescription>
            </Alert>
          </div>
        </CardHeader>
        <CardContent>
          {qualification.showScore && (
            <div className="momentum-score-section" style={{
              backgroundColor: '#f8f9fa',
              padding: '24px',
              borderRadius: '12px',
              marginBottom: '32px',
              textAlign: 'center'
            }}>
              <div className="score-header">
                <h3 style={{margin: '0 0 16px', fontSize: '24px', color: '#2c3e50'}}>
                  Your Momentum Score
                </h3>
                <div className="score-display" style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  justifyContent: 'center',
                  gap: '8px',
                  marginBottom: '20px'
                }}>
                  <span className="current-score" style={{
                    fontSize: '48px',
                    fontWeight: 'bold',
                    color: '#3498db'
                  }}>
                    {momentumScore.totalScore}
                  </span>
                  <span className="max-score" style={{
                    fontSize: '24px',
                    color: '#7f8c8d'
                  }}>
                    / 95
                  </span>
                </div>
              </div>
              
              <div className="score-bar" style={{
                position: 'relative',
                height: '12px',
                backgroundColor: '#e9ecef',
                borderRadius: '6px',
                marginBottom: '16px',
                overflow: 'hidden'
              }}>
                <div 
                  className="progress-fill" 
                  style={{
                    height: '100%',
                    backgroundColor: '#3498db',
                    width: `${(momentumScore.totalScore / 95) * 100}%`,
                    transition: 'width 0.3s ease'
                  }}
                />
                <div className="milestone milestone-50" style={{
                  position: 'absolute',
                  top: '-25px',
                  left: '52.6%',
                  transform: 'translateX(-50%)',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  color: '#7f8c8d'
                }}>
                  50
                </div>
                <div className="milestone milestone-75" style={{
                  position: 'absolute', 
                  top: '-25px',
                  left: '78.9%',
                  transform: 'translateX(-50%)',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  color: '#7f8c8d'
                }}>
                  75
                </div>
              </div>
               <div className="score-message" style={{
                padding: '16px',
                backgroundColor: momentumScore.totalScore >= 35 ? '#d4edda' : '#fff3cd',
                border: `1px solid ${momentumScore.totalScore >= 35 ? '#c3e6cb' : '#ffeaa7'}`,
                borderRadius: '8px',
                marginTop: '16px',
                marginBottom: '16px',
              }}>
                <h4 style={{margin: '0 0 8px', color: momentumScore.totalScore >= 35 ? '#155724' : '#856404'}}>
                  {momentumScore.totalScore >= 35 ? "Good Progress!" : "Let's Build Your Score"}
                </h4>
                <p style={{margin: '0', color: momentumScore.totalScore >= 35 ? '#155724' : '#856404'}}>
                  {qualification.scoreMessage}
                </p>
              </div>
              <div className="flex justify-around items-center p-4">
                <ProgressCircle
                  score={momentumScore.breakdown.financialHardship}
                  maxScore={40}
                  label="Assessment"
                  color="text-blue-500"
                />
                <ProgressCircle
                  score={0}
                  maxScore={30}
                  label="Readiness"
                  color="text-green-500"
                  status="Not Started"
                />
                <ProgressCircle
                  score={0}
                  maxScore={30}
                  label="Means"
                  color="text-purple-500"
                  status="Not Started"
                />
              </div>
            </div>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                {!qualification.hideColumns.includes('momentum') && <TableHead className="w-1/3 text-center text-lg font-semibold">Momentum Plan</TableHead>}
                {!qualification.hideColumns.includes('personalLoan') && <TableHead className="w-1/3 text-center text-lg font-semibold border-x">Personal Loan</TableHead>}
                {!qualification.hideColumns.includes('standard') && <TableHead className="w-1/3 text-center text-lg font-semibold">Standard Plan</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                 {!qualification.hideColumns.includes('momentum') && 
                    <TableCell className="text-center">
                      {results.momentum.isEligible ? <p className="text-3xl font-bold">{formatCurrency(results.momentum.monthlyPayment)}/mo</p> : <p className="text-muted-foreground">Not Eligible</p>}
                    </TableCell>
                 }
                {!qualification.hideColumns.includes('personalLoan') && 
                    <TableCell className="text-center border-x">
                      {results.personalLoan.isEligible ? <p className="text-3xl font-bold">{formatCurrency(results.personalLoan.monthlyPayment)}/mo</p> : <p className="text-muted-foreground">Not Eligible</p>}
                    </TableCell>
                }
                {!qualification.hideColumns.includes('standard') && 
                    <TableCell className="text-center">
                    {results.standard.isEligible ? <p className="text-3xl font-bold">{formatCurrency(results.standard.monthlyPayment)}/mo</p> : <p className="text-muted-foreground">Not Eligible</p>}
                    </TableCell>
                }
              </TableRow>
              <TableRow>
                {!qualification.hideColumns.includes('momentum') && <TableCell className="text-center">{results.momentum.isEligible ? `${results.momentum.term} Month Program` : '-'}</TableCell>}
                {!qualification.hideColumns.includes('personalLoan') && <TableCell className="text-center border-x">{results.personalLoan.isEligible ? `${results.personalLoan.term} Month Program` : '-'}</TableCell>}
                {!qualification.hideColumns.includes('standard') && <TableCell className="text-center">{results.standard.isEligible ? `${results.standard.term} Month Program` : '-'}</TableCell>}
              </TableRow>
              {/* FIX: Updated "Debt Covered" row with proper personal loan logic */}
              <TableRow>
                {!qualification.hideColumns.includes('momentum') && 
                  <TableCell className="text-center">
                    {formatCurrency(results.debtAmountEstimate)} Debt Covered
                  </TableCell>
                }
                {!qualification.hideColumns.includes('personalLoan') && 
                  <TableCell className="text-center border-x">
                    {results.personalLoan.isEligible ? (
                      <div>
                        {formatCurrency(results.personalLoan.actualLoanAmount)} Debt Covered
                        {results.personalLoan.actualLoanAmount < results.debtAmountEstimate && (
                          <div className="text-xs text-amber-600 mt-1">
                            ⚠️ Covers {Math.round((results.personalLoan.actualLoanAmount / results.debtAmountEstimate) * 100)}% of total debt
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Not Available</span>
                    )}
                  </TableCell>
                }
                {!qualification.hideColumns.includes('standard') && 
                  <TableCell className="text-center">
                    {formatCurrency(results.debtAmountEstimate)} Debt Covered
                  </TableCell>
                }
              </TableRow>
               <TableRow>
                {!qualification.hideColumns.includes('momentum') && <TableCell className="text-center">Pay off debt faster with a lower monthly payment.</TableCell>}
                {!qualification.hideColumns.includes('personalLoan') && <TableCell className="text-center border-x">Consolidate into one payment, but with high interest.</TableCell>}
                {!qualification.hideColumns.includes('standard') && <TableCell className="text-center">A longer program term that might be easier to manage.</TableCell>}
              </TableRow>
              <TableRow>
                {!qualification.hideColumns.includes('momentum') && 
                    <TableCell className="text-center text-xs text-muted-foreground">
                    <p className="font-bold">Why it matters:</p>A shorter term means you're debt-free sooner.
                    </TableCell>
                }
                {!qualification.hideColumns.includes('personalLoan') && 
                    <TableCell className="text-center text-xs text-muted-foreground border-x">
                    <p className="font-bold">Why it matters:</p> High APRs can significantly increase the total amount you repay.
                    </TableCell>
                }
                {!qualification.hideColumns.includes('standard') && 
                    <TableCell className="text-center text-xs text-muted-foreground">
                    <p className="font-bold">Why it matters:</p> Lower payments can provide budget flexibility, but may cost more over time.
                    </TableCell>
                }
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
            <p className="text-sm text-muted-foreground">The Momentum Plan is designed to get you out of debt as quickly as possible. By negotiating with your creditors, we can often reduce the total amount you owe, leading to significant savings and a faster path to financial freedom.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Why Loans Can Backfire</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">While a personal loan can consolidate your payments, it often comes with high interest rates, especially for lower credit scores. This can trap you in a new cycle of debt, making it harder to pay off your balances and potentially costing you more in the long run.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Why Standard Plans Lag</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Standard debt management plans offer lower monthly payments but extend the repayment period. While this can provide temporary relief, it often means paying more over time and staying in debt for longer than necessary.</p>
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
