'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface ReadinessWhatsNextProps {
  readinessScore: number;
}

function calculateLetterGrade(score: number, maxScore: number = 35): string {
  const percentage = Math.round((score / maxScore) * 100);

  if (percentage >= 90) return 'A';
  if (percentage >= 80) return 'B';
  if (percentage >= 70) return 'C';
  if (percentage >= 60) return 'D';
  return 'F';
}

export default function ReadinessWhatsNext({
  readinessScore
}: ReadinessWhatsNextProps) {
  const isVeryHighScore = readinessScore >= 25 && readinessScore <= 35;
  const isModerateScore = readinessScore >= 18 && readinessScore <= 24;
  const isLowScore = readinessScore >= 0 && readinessScore <= 17;

  // Calculate the letter grade
  const letterGrade = calculateLetterGrade(readinessScore);

  return (
    <Card className="mt-8">
      <CardHeader className="pb-4 text-center">
        <CardTitle className="text-xl font-bold">What's next?</CardTitle>
        <CardDescription>
          Your current momentum score is a {letterGrade}. {isVeryHighScore
            ? "Let's verify debt settlement is right for you by verifying your financial situation."
            : isModerateScore
              ? "Improve your score by viewing the videos below. Once you have completed this task, you will be able to verify you financial situation."
              : isLowScore
                ? "Debt settlement is likely not a good fit for you but we have resources available for you to improve your situation."
                : "Let's verify debt settlement is right for you by verifying your financial situation."
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        {isVeryHighScore ? (
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