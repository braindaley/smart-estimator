"use client";

import * as React from 'react';
import { useEstimatorStore } from '@/lib/estimator-store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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

export default function Results() {
  const { formData, reset } = useEstimatorStore();
  const [results, setResults] = React.useState<any>(null);

  React.useEffect(() => {
    // Flatten form data from all steps
    const allFormData = Object.values(formData).reduce((acc, curr) => ({ ...acc, ...curr }), {});
    
    const { 
      debtAmountEstimate = 0, 
      userFicoScoreEstimate = 0,
    } = allFormData;

    // Perform calculations
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
        isEligible: canGetLoan && userFicoScoreEstimate >= 620,
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
  
  if (!results) {
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

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Here are your smart estimator results</CardTitle>
          <CardDescription>Based on the information you provided, here are some potential options.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/3 text-center text-lg font-semibold">Momentum Plan</TableHead>
                <TableHead className="w-1/3 text-center text-lg font-semibold border-x">Personal Loan</TableHead>
                <TableHead className="w-1/3 text-center text-lg font-semibold">Standard Plan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="text-center">
                  {results.momentum.isEligible ? <p className="text-3xl font-bold">{formatCurrency(results.momentum.monthlyPayment)}/mo</p> : <p className="text-muted-foreground">Not Eligible</p>}
                </TableCell>
                <TableCell className="text-center border-x">
                  {results.personalLoan.isEligible ? <p className="text-3xl font-bold">{formatCurrency(results.personalLoan.monthlyPayment)}/mo</p> : <p className="text-muted-foreground">Not Eligible</p>}
                </TableCell>
                <TableCell className="text-center">
                  {results.standard.isEligible ? <p className="text-3xl font-bold">{formatCurrency(results.standard.monthlyPayment)}/mo</p> : <p className="text-muted-foreground">Not Eligible</p>}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="text-center">{results.momentum.isEligible ? `${results.momentum.term} Month Program` : '-'}</TableCell>
                <TableCell className="text-center border-x">{results.personalLoan.isEligible ? `${results.personalLoan.term} Month Program` : '-'}</TableCell>
                <TableCell className="text-center">{results.standard.isEligible ? `${results.standard.term} Month Program` : '-'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="text-center">{formatCurrency(results.debtAmountEstimate)} Debt Covered</TableCell>
                <TableCell className="text-center border-x">{formatCurrency(results.debtAmountEstimate)} Debt Covered</TableCell>
                <TableCell className="text-center">{formatCurrency(results.debtAmountEstimate)} Debt Covered</TableCell>
              </TableRow>
               <TableRow>
                <TableCell className="text-center">Pay off debt faster with a lower monthly payment.</TableCell>
                <TableCell className="text-center border-x">Consolidate into one payment, but with high interest.</TableCell>
                <TableCell className="text-center">A longer program term that might be easier to manage.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="text-center text-xs text-muted-foreground">
                  <p className="font-bold">Why it matters:</p>A shorter term means you're debt-free sooner.
                </TableCell>
                <TableCell className="text-center text-xs text-muted-foreground border-x">
                   <p className="font-bold">Why it matters:</p> High APRs can significantly increase the total amount you repay.
                </TableCell>
                <TableCell className="text-center text-xs text-muted-foreground">
                   <p className="font-bold">Why it matters:</p> Lower payments can provide budget flexibility, but may cost more over time.
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
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

       <div className="text-center mt-8">
            <Button asChild onClick={handleRestart}>
              <Link href="/smart-estimator/step-1">Start Over</Link>
            </Button>
        </div>
    </div>
  );
}
