'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useReadinessStore } from '@/lib/readiness-store';
import { useEstimatorStore } from '@/lib/estimator-store';
import { calculateMomentumScore } from '@/lib/calculations';
import Link from 'next/link';
import { Play, CheckCircle } from 'lucide-react';
import MomentumScoreSection from '@/components/MomentumScoreSection';
import ReadinessAssessmentResult from '@/components/ReadinessAssessmentResult';
import ReadinessWhatsNext from '@/components/ReadinessWhatsNext';
import { ChartContainer, ChartConfig } from "@/components/ui/chart";
import { Label, PolarRadiusAxis, RadialBar, RadialBarChart } from "recharts";

type VideoRecommendation = {
  title: string;
  points: 1;
  watched: boolean;
};

const defaultVideos = [
  "Debt Settlement vs. Consolidation",
  "Dealing with Debt Collectors", 
  "Debt Relief Checklist",
  "What Is a Debt Settlement Plan"
];

export default function Results() {
  const router = useRouter();
  const { formData, setFormData, _hasHydrated } = useReadinessStore();
  const { formData: estimatorFormData } = useEstimatorStore();
  const [baseScore, setBaseScore] = useState(0);
  const [bonusPoints, setBonusPoints] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [watchedVideos, setWatchedVideos] = useState<Set<string>>(new Set());
  const [smartEstimatorScore, setSmartEstimatorScore] = useState(0);
  const [hasSmartEstimatorData, setHasSmartEstimatorData] = useState(false);

  useEffect(() => {
    // Wait for the store to be hydrated before doing anything
    if (!_hasHydrated) {
      return;
    }

    // Calculate base score from all steps
    let score = 0;
    for (let i = 1; i <= 9; i++) {
      const stepData = formData[`step${i}`];
      if (stepData && stepData.points) {
        score += stepData.points;
      }
    }
    
    setBaseScore(score);
    updateTotalScore(score, bonusPoints);

    // Check Smart Estimator completion and calculate score
    const hasResultsData = estimatorFormData ? Object.keys(estimatorFormData).filter(k => k.startsWith('step')).length >= 5 : false;
    setHasSmartEstimatorData(hasResultsData);

    if (hasResultsData && estimatorFormData) {
      try {
        const momentumScore = calculateMomentumScore({
          debtAmountEstimate: estimatorFormData.step1?.debtAmountEstimate || 0,
          creditorCountEstimate: estimatorFormData.step2?.creditorCountEstimate || 0,
          debtPaymentStatus: estimatorFormData.step3?.debtPaymentStatus || 'current',
          hasSteadyIncome: estimatorFormData.step4?.hasSteadyIncome || false,
          userFicoScoreEstimate: estimatorFormData.step5?.userFicoScoreEstimate || 550
        });
        setSmartEstimatorScore(momentumScore.score);
      } catch (error) {
        console.error('Error calculating momentum score:', error);
        setSmartEstimatorScore(0);
      }
    } else {
      setSmartEstimatorScore(0);
    }
  }, [_hasHydrated, formData, estimatorFormData, bonusPoints]);

  // Separate effect to store the readiness score only when it changes and isn't already stored
  useEffect(() => {
    if (baseScore > 0 && !formData.readinessScore) {
      setFormData('readinessScore', { 
        score: baseScore,
        calculatedAt: new Date().toISOString()
      });
    }
  }, [baseScore, formData.readinessScore, setFormData]);

  const updateTotalScore = (base: number, bonus: number) => {
    const total = base + bonus;
    setTotalScore(total);
  };

  const handleWatchVideo = (videoTitle: string) => {
    if (!watchedVideos.has(videoTitle) && bonusPoints < 5) {
      const newWatchedVideos = new Set(watchedVideos);
      newWatchedVideos.add(videoTitle);
      setWatchedVideos(newWatchedVideos);
      
      const newBonusPoints = Math.min(bonusPoints + 1, 5);
      setBonusPoints(newBonusPoints);
      updateTotalScore(baseScore, newBonusPoints);
      
      // Store bonus points in form data
      setFormData('videos', { bonusPoints: newBonusPoints, watchedVideos: Array.from(newWatchedVideos) });
    }
  };



  if (!_hasHydrated) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Results...</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Please wait while we load your readiness score.</p>
        </CardContent>
      </Card>
    );
  }

  const getScoreColor = () => {
    if (totalScore >= 25) return "text-green-600";
    if (totalScore >= 18) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-8">
      {/* Main Header */}
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold">Your Readiness Estimate</h1>
        <p className="text-muted-foreground mt-2">Review the following results to understand if debt settlement may be a good choice for you.</p>
        
        {/* Mini Readiness Graph */}
        <div className="flex justify-center mt-6">
          <div className="w-[150px] h-[80px]">
            <ChartContainer
              config={{
                score: { label: "Score", color: "hsl(142, 76%, 36%)" },
                remaining: { label: "Remaining", color: "hsl(210, 40%, 90%)" }
              } satisfies ChartConfig}
              className="w-full h-full"
            >
              <RadialBarChart
                width={150}
                height={80}
                data={[{ score: totalScore, remaining: Math.max(0, 35 - totalScore) }]}
                endAngle={180}
                innerRadius={35}
                outerRadius={55}
              >
                <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                  <Label
                    content={({ viewBox }: any) => {
                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                        return (
                          <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) - 8}
                              className="fill-foreground text-xl font-bold"
                            >
                              {totalScore}
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) + 8}
                              className="fill-muted-foreground text-xs"
                            >
                              of 35
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
                  cornerRadius={4}
                  fill="var(--color-score)"
                  className="stroke-transparent stroke-1"
                />
                <RadialBar
                  dataKey="remaining"
                  fill="var(--color-remaining)"
                  stackId="a"
                  cornerRadius={4}
                  className="stroke-transparent stroke-1"
                />
              </RadialBarChart>
            </ChartContainer>
          </div>
        </div>
      </div>

      {/* Readiness Assessment Results */}
      <div className="max-w-3xl mx-auto">
        
        <ReadinessAssessmentResult 
          totalScore={totalScore} 
          questionScores={Object.keys(formData).reduce((acc, key) => {
            if (key.startsWith('step') && formData[key]?.points !== undefined) {
              acc[key] = formData[key].points;
            }
            return acc;
          }, {} as { [key: string]: number })}
        />
        
        {/* What's Next Section */}
        <ReadinessWhatsNext readinessScore={totalScore} />
      </div>

      {/* Video Recommendations - Full Width Section */}
      <div className="w-full max-w-screen-xl mx-auto px-4">
        <Card className="border-0 shadow-none">
        <CardHeader className="px-0">
          <CardTitle>Recommended Videos</CardTitle>
          <CardDescription>
            Watch these videos to learn more and earn up to 5 bonus points!
            {bonusPoints > 0 && ` (${bonusPoints}/5 earned)`}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {defaultVideos.map((videoTitle) => {
              const isWatched = watchedVideos.has(videoTitle);
              return (
                <Card key={videoTitle} className={`border-0 shadow-none ${isWatched ? "opacity-75" : ""}`}>
                  <CardContent className="p-0">
                    <div className="aspect-[9/16] bg-muted rounded-lg mb-3 flex items-center justify-center relative">
                      {isWatched && (
                        <div className="absolute top-2 right-2">
                          <CheckCircle className="h-6 w-6 text-green-600" />
                        </div>
                      )}
                      <Play className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <h4 className="font-medium text-sm mb-2">{videoTitle}</h4>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
      </div>

      <div className="max-w-3xl mx-auto space-y-8">



      {/* Momentum Score Section */}
      <MomentumScoreSection
        smartEstimatorScore={smartEstimatorScore}
        readinessScore={totalScore}
        totalPossibleScore={70}
        hasSmartEstimatorData={hasSmartEstimatorData}
        showScore={true}
      />

      {/* Testing & Debugging Information */}
      <Card>
        <CardHeader>
          <CardTitle>Testing &amp; Debugging Information</CardTitle>
          <CardDescription>This section is for testing purposes only.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((step) => {
              const stepData = formData[`step${step}`];
              const points = stepData?.points || 0;
              return (
                <div key={step} className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm">Question {step}</span>
                  <span className="font-medium">{points} points</span>
                </div>
              );
            })}
            {bonusPoints > 0 && (
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm">Video Bonus</span>
                <span className="font-medium text-green-600">+{bonusPoints} points</span>
              </div>
            )}
            <div className="flex justify-between items-center py-2 font-bold">
              <span>Total Score</span>
              <span className={getScoreColor()}>{totalScore} / 35</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      </div>

    </div>
  );
}