'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useReadinessStore } from '@/lib/readiness-store';
import { useEstimatorStore } from '@/lib/estimator-store';
import { calculateMomentumScore } from '@/lib/calculations';
import Link from 'next/link';
import { ArrowRight, Calculator, CheckCircle2, AlertCircle } from 'lucide-react';
import MomentumScoreSection from '@/components/MomentumScoreSection';

type ScoreBand = {
  range: [number, number];
  label: string;
  description: string;
  cta: string;
  ctaLink: string;
};

const readinessScoreBands: ScoreBand[] = [
  {
    range: [25, 35],
    label: "HIGH READINESS",
    description: "You're well-prepared for debt settlement.",
    cta: "Start Your Application",
    ctaLink: "/apply",
  },
  {
    range: [18, 24],
    label: "MODERATE READINESS", 
    description: "You have good potential with additional preparation.",
    cta: "Explore Options",
    ctaLink: "/explore-options",
  },
  {
    range: [0, 17],
    label: "LOW READINESS",
    description: "Consider exploring other debt relief options.",
    cta: "Explore Alternatives", 
    ctaLink: "/alternatives",
  }
];

export default function ScorePage() {
  const { formData: readinessData, _hasHydrated: readinessHydrated } = useReadinessStore();
  const { formData: estimatorData, _hasHydrated: estimatorHydrated } = useEstimatorStore();
  
  const [readinessScore, setReadinessScore] = useState(0);
  const [smartEstimatorScore, setSmartEstimatorScore] = useState(0);
  const [smartEstimatorBreakdown, setSmartEstimatorBreakdown] = useState<any>(null);
  const [hasReadinessData, setHasReadinessData] = useState(false);
  const [hasEstimatorData, setHasEstimatorData] = useState(false);
  const [readinessScoreBand, setReadinessScoreBand] = useState<ScoreBand | null>(null);

  useEffect(() => {
    if (!readinessHydrated || !estimatorHydrated) return;

    // Calculate Readiness Tool score
    let readinessTotal = 0;
    const hasReadinessSteps = Object.keys(readinessData).filter(k => k.startsWith('step')).length >= 9;
    setHasReadinessData(hasReadinessSteps);

    if (hasReadinessSteps) {
      for (let i = 1; i <= 9; i++) {
        const stepData = readinessData[`step${i}`];
        if (stepData && stepData.points) {
          readinessTotal += stepData.points;
        }
      }
      
      // Add video bonus points if available
      if (readinessData.videos?.bonusPoints) {
        readinessTotal += readinessData.videos.bonusPoints;
      }
    }
    
    setReadinessScore(readinessTotal);

    // Find readiness score band
    const band = readinessScoreBands.find(b => readinessTotal >= b.range[0] && readinessTotal <= b.range[1]);
    setReadinessScoreBand(band || readinessScoreBands[2]);

    // Calculate Smart Estimator score
    const hasEstimatorSteps = Object.keys(estimatorData).filter(k => k.startsWith('step')).length >= 5;
    setHasEstimatorData(hasEstimatorSteps);

    if (hasEstimatorSteps) {
      try {
        const momentumScore = calculateMomentumScore({
          debtAmountEstimate: estimatorData.step1?.debtAmountEstimate || 0,
          creditorCountEstimate: estimatorData.step2?.creditorCountEstimate || 0,
          debtPaymentStatus: estimatorData.step3?.debtPaymentStatus || 'current',
          hasSteadyIncome: estimatorData.step4?.hasSteadyIncome || false,
          userFicoScoreEstimate: estimatorData.step5?.userFicoScoreEstimate || 550
        });
        setSmartEstimatorScore(momentumScore.score);
        setSmartEstimatorBreakdown(momentumScore.breakdown);
      } catch (error) {
        console.error('Error calculating momentum score:', error);
        setSmartEstimatorScore(0);
        setSmartEstimatorBreakdown(null);
      }
    }
  }, [readinessHydrated, estimatorHydrated, readinessData, estimatorData]);

  if (!readinessHydrated || !estimatorHydrated) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Loading Your Scores...</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Please wait while we load your assessment results.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalPossibleScore = 70;
  const overallScore = readinessScore + smartEstimatorScore;

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Your Assessment Overview</h1>
        <p className="text-muted-foreground text-lg">
          Complete overview of your debt settlement readiness and financial profile
        </p>
      </div>

      {/* Overall Score Summary */}
      <Card className="border-2 border-primary/20">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Overall Momentum Score</CardTitle>
          <div className="text-6xl font-bold text-primary my-4">
            {overallScore}/{totalPossibleScore}
          </div>
          <CardDescription>
            Combined score from Smart Estimator and Readiness Tool assessments
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Score Calculation Breakdown */}
      <div className="space-y-6">
        
        {/* Smart Estimator Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calculator className="h-6 w-6 text-blue-600" />
              <CardTitle className="text-xl">Smart Estimator Score Calculation</CardTitle>
            </div>
            <CardDescription>
              Financial profile assessment (35 points maximum)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {hasEstimatorData ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <span className="font-medium">Total Smart Estimator Score:</span>
                  <div className="text-2xl font-bold text-blue-600">
                    {smartEstimatorScore}/35
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">Score Breakdown by Factor:</h4>
                  <div className="grid gap-2 text-sm">
                    <div className="flex justify-between items-center p-2 bg-background rounded">
                      <span>Debt Amount: ${estimatorData.step1?.debtAmountEstimate?.toLocaleString() || '0'}</span>
                      <span className="font-medium">{smartEstimatorBreakdown?.debtAmount || 0}/11 points</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-background rounded">
                      <span>Number of Creditors: {estimatorData.step2?.creditorCountEstimate || 0}</span>
                      <span className="font-medium">{smartEstimatorBreakdown?.creditors || 0}/8 points</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-background rounded">
                      <span>Payment Status: {estimatorData.step3?.debtPaymentStatus || 'N/A'}</span>
                      <span className="font-medium">{smartEstimatorBreakdown?.paymentStatus || 0}/8 points</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-background rounded">
                      <span>Steady Income: {estimatorData.step4?.hasSteadyIncome ? 'Yes' : 'No'}</span>
                      <span className="font-medium">{smartEstimatorBreakdown?.income || 0}/6 points</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-background rounded">
                      <span>Credit Score: {estimatorData.step5?.userFicoScoreEstimate || 'N/A'}</span>
                      <span className="font-medium">{smartEstimatorBreakdown?.creditScore || 0}/2 points</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-4 p-8">
                <div className="flex items-center justify-center gap-2 text-amber-600">
                  <AlertCircle className="h-5 w-5" />
                  <span>Smart Estimator not completed</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Complete the assessment to see detailed score calculation
                </p>
                <Button asChild>
                  <Link href="/smart-estimator">Take Smart Estimator</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Readiness Tool Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
              <CardTitle className="text-xl">Readiness Tool Score Calculation</CardTitle>
            </div>
            <CardDescription>
              Mindset and situational readiness (35 points maximum)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {hasReadinessData ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <span className="font-medium">Total Readiness Score:</span>
                  <div className="text-2xl font-bold text-green-600">
                    {readinessScore}/35
                  </div>
                </div>
                
                {readinessScoreBand && (
                  <div className="flex items-center justify-between p-3 bg-background rounded-lg border">
                    <span className="font-medium">Readiness Level:</span>
                    <Badge 
                      variant={readinessScore >= 25 ? "default" : readinessScore >= 18 ? "secondary" : "destructive"}
                    >
                      {readinessScoreBand.label}
                    </Badge>
                  </div>
                )}
                
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">Score Breakdown by Question:</h4>
                  <div className="grid gap-2 text-sm">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((step) => {
                      const stepData = readinessData[`step${step}`];
                      const points = stepData?.points || 0;
                      // Most readiness questions have a maximum of 4-5 points, using 5 as general max
                      const maxPoints = 5;
                      return (
                        <div key={step} className="flex justify-between items-center p-2 bg-background rounded">
                          <span>Question {step}</span>
                          <span className="font-medium">{points}/{maxPoints} points</span>
                        </div>
                      );
                    })}
                    {readinessData.videos?.bonusPoints > 0 && (
                      <div className="flex justify-between items-center p-2 bg-green-50 rounded border border-green-200">
                        <span className="text-green-700">Video Bonus Points</span>
                        <span className="font-medium text-green-700">+{readinessData.videos.bonusPoints}/5 points</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-4 p-8">
                <div className="flex items-center justify-center gap-2 text-amber-600">
                  <AlertCircle className="h-5 w-5" />
                  <span>Readiness Tool not completed</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Complete the assessment to see detailed score breakdown
                </p>
                <Button asChild>
                  <Link href="/readiness-tool">Take Readiness Tool</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Momentum Score Breakdown */}
      {(hasReadinessData || hasEstimatorData) && (
        <MomentumScoreSection
          smartEstimatorScore={smartEstimatorScore}
          readinessScore={readinessScore}
          totalPossibleScore={totalPossibleScore}
          hasSmartEstimatorData={hasEstimatorData}
          showScore={true}
        />
      )}

      {/* Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
          <CardDescription>
            Continue your journey toward financial freedom
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {!hasEstimatorData && (
              <Button asChild variant="outline" className="h-auto p-4">
                <Link href="/smart-estimator" className="text-left">
                  <div>
                    <div className="font-semibold">Complete Smart Estimator</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Get your financial profile assessment
                    </div>
                  </div>
                </Link>
              </Button>
            )}
            
            {!hasReadinessData && (
              <Button asChild variant="outline" className="h-auto p-4">
                <Link href="/readiness-tool" className="text-left">
                  <div>
                    <div className="font-semibold">Complete Readiness Tool</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Assess your debt settlement readiness
                    </div>
                  </div>
                </Link>
              </Button>
            )}

            <Button asChild variant="outline" className="h-auto p-4">
              <Link href="/customize-plan" className="text-left">
                <div>
                  <div className="font-semibold">Customize Your Plan</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Tailor your debt settlement approach
                  </div>
                </div>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}