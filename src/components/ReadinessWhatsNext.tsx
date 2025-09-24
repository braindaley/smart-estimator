'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { checkDisqualification, type ReadinessFormData } from '@/lib/readiness-disqualification';

interface ReadinessWhatsNextProps {
  readinessScore: number;
  momentumScore?: number;
  formData?: ReadinessFormData;
}

function calculateLetterGrade(score: number, maxScore: number): string {
  const percentage = Math.round((score / maxScore) * 100);

  if (percentage >= 90) return 'A';
  if (percentage >= 80) return 'B';
  if (percentage >= 70) return 'C';
  if (percentage >= 60) return 'D';
  return 'F';
}

export default function ReadinessWhatsNext({
  readinessScore,
  momentumScore,
  formData
}: ReadinessWhatsNextProps) {
  // Check for disqualification first
  const disqualificationCheck = formData ? checkDisqualification(formData) : { isDisqualified: false, disqualificationReasons: [] };

  // Use combined score if momentum score is available, otherwise use readiness only
  const totalScore = momentumScore !== undefined ? readinessScore + momentumScore : readinessScore;
  const maxScore = momentumScore !== undefined ? 87 : 52;

  // Determine score categories based on combined or readiness-only scoring
  // If disqualified, always treat as low/not eligible
  const isVeryHighScore = !disqualificationCheck.isDisqualified && (momentumScore !== undefined
    ? totalScore >= 72 && totalScore <= 87  // Combined high: ~83%+ of 87
    : readinessScore >= 37 && readinessScore <= 52); // Readiness high

  const isModerateScore = !disqualificationCheck.isDisqualified && (momentumScore !== undefined
    ? totalScore >= 57 && totalScore <= 71  // Combined moderate: ~65-82% of 87
    : readinessScore >= 26 && readinessScore <= 36); // Readiness moderate

  const isLowScore = disqualificationCheck.isDisqualified || (momentumScore !== undefined
    ? totalScore >= 0 && totalScore <= 56   // Combined low: <65% of 87
    : readinessScore >= 0 && readinessScore <= 25);  // Readiness low

  // Calculate the letter grade using combined or individual score
  const letterGrade = calculateLetterGrade(totalScore, maxScore);

  return (
    <Card className="mt-8">
      <CardHeader className="pb-4 text-center">
        <CardTitle className="text-xl font-bold">What's next?</CardTitle>
        <CardDescription>
          {disqualificationCheck.isDisqualified
            ? "Based on your responses, you are not eligible for debt settlement at this time. Please address the identified concerns before reconsidering this option."
            : `Your current Smart Estimator score is a ${letterGrade}. ${isVeryHighScore
                ? "Let's verify debt settlement is right for you by verifying your financial situation."
                : isModerateScore
                  ? "Improve your score by viewing the videos below. Once you have completed this task, you will be able to verify you financial situation."
                  : isLowScore
                    ? "Debt settlement is likely not a good fit for you but we have resources available for you to improve your situation."
                    : "Let's verify debt settlement is right for you by verifying your financial situation."
              }`
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        {disqualificationCheck.isDisqualified ? (
          <Button asChild size="lg" variant="outline">
            <Link href="/resources">View Resources</Link>
          </Button>
        ) : isVeryHighScore ? (
          <Button asChild size="lg">
            <Link href="/your-plan">See your plan</Link>
          </Button>
        ) : isModerateScore ? (
          <Button asChild size="lg">
            <Link href="/your-plan">See your plan</Link>
          </Button>
        ) : isLowScore ? (
          <Button asChild size="lg">
            <Link href="/resources">Resources</Link>
          </Button>
        ) : (
          <Button asChild size="lg">
            <Link href="/your-plan">See your plan</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}