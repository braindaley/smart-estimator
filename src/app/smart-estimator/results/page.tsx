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
  getMaximumPersonalLoanAmount
} from '@/lib/calculations';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

type QualificationStatus = "Qualified" | "Not Qualified - Too Little Debt" | "Needs Specialist Consultation" | "Not Qualified - No Income";

export default function Results() {
  const { formData, reset } = useEstimatorStore();
  const [results, setResults] = React.useState<any>(null);
  const [qualificationStatus, setQualificationStatus] = React.useState<QualificationStatus | null>(null);

  React.useEffect(() => {
    const allFormData = Object.values(formData).reduce((acc, curr) => ({ ...acc, ...curr }), {});
    
    const { 
      debtAmountEstimate = 0, 
      userFicoScoreEstimate = 0,
      hasSteadyIncome,
    } = allFormData;

    // Qualification Logic
    let status: QualificationStatus;
    if (debtAmountEstimate < 15000 && debtAmountEstimate >= 10000) {
      status = "Not Qualified - Too Little Debt";
    } else if (debtAmountEstimate >= 50000) {
        status = "Needs Specialist Consultation";
    } else if (hasSteadyIncome === false) {
      status = "Not Qualified - No Income";
    } else {
      status = "Qualified";
    }
    setQualificationStatus(status);
    
    const momentumMonthlyPayment = calculateMonthlyMomentumPayment(debtAmountEstimate);
    const momentumTerm = getMomentumTermLength(debtAmountEstimate);
    
    const standardMonthlyPayment = calculateMonthlyStandardPayment(debtAmountEstimate);
    const standardTerm = getStandardTermLength(debtAmountEstimate);

    const personalLoanApr = getPersonalLoanApr(userFicoScoreEstimate);
    const maxLoanAmount = getMaximumPersonalLoanAmount(userFicoScoreEstimate);
    const canGetLoan = debtAmountEstimate <= maxLoanAmount;
    const personalLoanMonthlyPayment = canGetLoan ? calculatePersonalLoanPayment(debtAmountEstimate, personalLoanApr) : 0;
    
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
        isEligible: canGetLoan && userFicoScoreEstimate >= 620 && hasSteadyIncome !== false,
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
  
  if (!results || !qualificationStatus) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Calculating Results...</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Please wait while we calculate your smart estimator results.</p>
        </CardContent>
      </Card>
    );
  }

  const handleRestart = () => {
    reset();
  }

  const renderQualificationMessage = () => {
    switch (qualificationStatus) {
      case "Not Qualified - Too Little Debt":
        return (
          <Alert variant="destructive">
            <AlertTitle>Not Qualified - Too Little Debt</AlertTitle>
            <AlertDescription>Your estimated debt is below the minimum required for our primary programs. Explore other options that may better suit your needs.</AlertDescription>
          </Alert>
        );
      case "Needs Specialist Consultation":
        return (
          <Alert>
            <AlertTitle>Needs Specialist Consultation</AlertTitle>
            <AlertDescription>Your estimated debt amount requires a personalized review. Please schedule a consultation to discuss your options with one of our specialists.</AlertDescription>
          </Alert>
        );
      case "Not Qualified - No Income":
        return (
          <Alert variant="destructive">
            <AlertTitle>Not Qualified - No Income</AlertTitle>
            <AlertDescription>A steady source of income is required for some of our options. Please see income-free options to find a suitable solution.</AlertDescription>
          </Alert>
        );
      case "Qualified":
        return (
           <Alert>
            <AlertTitle>Congratulations, you have options!</AlertTitle>
            <AlertDescription>Based on the information you provided, here are some potential options.</AlertDescription>
          </Alert>
        );
      default:
        return null;
    }
  };

  const renderCtas = () => {
    switch (qualificationStatus) {
      case "Not Qualified - Too Little Debt":
        return <Button>Explore Other Options</Button>;
      case "Needs Specialist Consultation":
        return <Button>Schedule Consultation</Button>;
      case "Not Qualified - No Income":
        return <Button>See Income-Free Options</Button>;
      case "Qualified":
        return (
          <div className="flex gap-4">
            <Button>Get My Personalized Plan</Button>
            <Button variant="secondary">Apply Now</Button>
          </div>
        );
      default:
        return null;
    }
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Here are your smart estimator results</CardTitle>
          <div className="pt-4">{renderQualificationMessage()}</div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                {qualificationStatus !== 'Not Qualified - Too Little Debt' && <TableHead className="w-1/3 text-center text-lg font-semibold">Momentum Plan</TableHead>}
                {qualificationStatus !== 'Not Qualified - No Income' && <TableHead className="w-1/3 text-center text-lg font-semibold border-x">Personal Loan</TableHead>}
                <TableHead className="w-1/3 text-center text-lg font-semibold">Standard Plan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                 {qualificationStatus !== 'Not Qualified - Too Little Debt' && 
                    <TableCell className="text-center">
                      {results.momentum.isEligible ? <p className="text-3xl font-bold">{formatCurrency(results.momentum.monthlyPayment)}/mo</p> : <p className="text-muted-foreground">Not Eligible</p>}
                    </TableCell>
                 }
                {qualificationStatus !== 'Not Qualified - No Income' && 
                    <TableCell className="text-center border-x">
                      {results.personalLoan.isEligible ? <p className="text-3xl font-bold">{formatCurrency(results.personalLoan.monthlyPayment)}/mo</p> : <p className="text-muted-foreground">Not Eligible</p>}
                    </TableCell>
                }
                <TableCell className="text-center">
                  {results.standard.isEligible ? <p className="text-3xl font-bold">{formatCurrency(results.standard.monthlyPayment)}/mo</p> : <p className="text-muted-foreground">Not Eligible</p>}
                </TableCell>
              </TableRow>
              <TableRow>
                {qualificationStatus !== 'Not Qualified - Too Little Debt' && <TableCell className="text-center">{results.momentum.isEligible ? `${results.momentum.term} Month Program` : '-'}</TableCell>}
                {qualificationStatus !== 'Not Qualified - No Income' && <TableCell className="text-center border-x">{results.personalLoan.isEligible ? `${results.personalLoan.term} Month Program` : '-'}</TableCell>}
                <TableCell className="text-center">{results.standard.isEligible ? `${results.standard.term} Month Program` : '-'}</TableCell>
              </TableRow>
              <TableRow>
                {qualificationStatus !== 'Not Qualified - Too Little Debt' && <TableCell className="text-center">{formatCurrency(results.debtAmountEstimate)} Debt Covered</TableCell>}
                {qualificationStatus !== 'Not Qualified - No Income' && <TableCell className="text-center border-x">{formatCurrency(results.debtAmountEstimate)} Debt Covered</TableCell>}
                <TableCell className="text-center">{formatCurrency(results.debtAmountEstimate)} Debt Covered</TableCell>
              </TableRow>
               <TableRow>
                {qualificationStatus !== 'Not Qualified - Too Little Debt' && <TableCell className="text-center">Pay off debt faster with a lower monthly payment.</TableCell>}
                {qualificationStatus !== 'Not Qualified - No Income' && <TableCell className="text-center border-x">Consolidate into one payment, but with high interest.</TableCell>}
                <TableCell className="text-center">A longer program term that might be easier to manage.</TableCell>
              </TableRow>
              <TableRow>
                {qualificationStatus !== 'Not Qualified - Too Little Debt' && 
                    <TableCell className="text-center text-xs text-muted-foreground">
                    <p className="font-bold">Why it matters:</p>A shorter term means you're debt-free sooner.
                    </TableCell>
                }
                {qualificationStatus !== 'Not Qualified - No Income' && 
                    <TableCell className="text-center text-xs text-muted-foreground border-x">
                    <p className="font-bold">Why it matters:</p> High APRs can significantly increase the total amount you repay.
                    </TableCell>
                }
                <TableCell className="text-center text-xs text-muted-foreground">
                   <p className="font-bold">Why it matters:</p> Lower payments can provide budget flexibility, but may cost more over time.
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
       <div className="text-center mt-8 space-y-4">
            {renderCtas()}
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
    </div>
  );
}

    