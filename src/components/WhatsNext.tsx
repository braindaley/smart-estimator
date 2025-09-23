'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useReadinessToolLink } from '@/hooks/useReadinessToolLink';

interface WhatsNextProps {
  hasSteadyIncome: boolean;
  userFicoScoreEstimate: number;
  momentumScore?: number;
}

function calculateLetterGrade(score: number, maxScore: number = 35): string {
  const percentage = Math.round((score / maxScore) * 100);

  if (percentage >= 90) return 'A';
  if (percentage >= 80) return 'B';
  if (percentage >= 70) return 'C';
  if (percentage >= 60) return 'D';
  return 'F';
}

export default function WhatsNext({
  hasSteadyIncome,
  userFicoScoreEstimate,
  momentumScore = 0
}: WhatsNextProps) {
  const readinessToolLink = useReadinessToolLink();

  // Calculate the letter grade
  const letterGrade = calculateLetterGrade(momentumScore);

  // Determine which scenario to show based on the conditions
  // Condition 1: No steady income
  const showNonPaymentOptions = hasSteadyIncome === false;

  // Condition 3: Steady income AND credit score > 580 AND momentum score > 29
  const showDebtSettlementPlan = hasSteadyIncome === true &&
                                 userFicoScoreEstimate > 580 &&
                                 momentumScore > 29;

  // Condition 2: Steady income AND credit score > 580 (but momentum score <= 29)
  const showReadinessQuiz = hasSteadyIncome === true &&
                            userFicoScoreEstimate > 580 &&
                            !showDebtSettlementPlan;

  return (
    <Card className="mt-8">
      <CardHeader className="pb-4 text-center">
        <CardTitle className="text-xl font-bold">What's next?</CardTitle>
        <CardDescription>
          Your current momentum score is a {letterGrade}. Take the next step to improve it.
        </CardDescription>
        <CardDescription className="text-sm mt-2">
          {showNonPaymentOptions
            ? "There are non-payment based relief options available."
            : showDebtSettlementPlan
              ? "Let's verify debt settlement is right for you by verifying your financial situation."
              : "Let's verify debt settlement is right for you by taking a quick quiz."
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        {showNonPaymentOptions ? (
          <Button asChild size="lg">
            <Link href="/resources/legal-aid-partners">Legal aid partner</Link>
          </Button>
        ) : showDebtSettlementPlan ? (
          <Button asChild size="lg">
            <Link href="/your-plan">See your plan</Link>
          </Button>
        ) : (
          <Button asChild size="lg">
            <Link href={readinessToolLink}>Test your readiness</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}