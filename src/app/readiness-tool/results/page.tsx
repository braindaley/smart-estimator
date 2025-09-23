'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
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




      </div>

      {/* Calculations Accordion */}
      <div className="max-w-3xl mx-auto">
        <Accordion type="single" collapsible className="mt-8">
          <AccordionItem value="calculations" className="border-0">
            <AccordionTrigger className="text-xs text-muted-foreground hover:text-muted-foreground py-2 px-0">Calculations</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-6">
                <Card>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold">Readiness Assessment Calculations</h4>
                      <div className="mt-2 rounded-md bg-slate-100 p-4 text-sm space-y-4">

                        <div>
                          <h5 className="font-medium">Readiness Score Breakdown:</h5>
                          <div className="ml-4 space-y-2 text-xs">
                            <div className="font-medium">Your Current Scores:</div>
                            <div className="ml-2 space-y-1">
                              <div>• Base Score: {baseScore} points</div>
                              <div>• Video Bonus Points: {bonusPoints} points</div>
                              <div>• <strong>Total Score: {totalScore} points</strong></div>
                            </div>

                            <div className="font-medium mt-3">Score by Question:</div>
                            <div className="ml-2 space-y-1">
                              {Object.keys(formData).filter(key => key.startsWith('step')).sort().map(stepKey => {
                                const stepData = formData[stepKey];
                                if (!stepData || stepData.points === undefined) return null;
                                const stepNumber = stepKey.replace('step', '');
                                return (
                                  <div key={stepKey}>• Step {stepNumber}: {stepData.points} points</div>
                                );
                              })}
                            </div>

                            <div className="font-medium mt-3">Video Bonus System:</div>
                            <div className="ml-2 space-y-1">
                              <div>• Each video watched: +1 point</div>
                              <div>• Maximum video bonus: 5 points</div>
                              <div>• Videos watched: {watchedVideos.size} / {Math.min(defaultVideos.length, 5)}</div>
                              <div>• Available videos: {defaultVideos.join(', ')}</div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h5 className="font-medium">Readiness Level Determination:</h5>
                          <div className="ml-4 space-y-2 text-xs">
                            <div className="font-medium">Score Ranges & Classifications:</div>
                            <div className="ml-2 space-y-1">
                              <div>• <span className="font-medium">High Readiness:</span> 25-35 points</div>
                              <div>• <span className="font-medium">Moderate Readiness:</span> 18-24 points</div>
                              <div>• <span className="font-medium">Low Readiness:</span> 0-17 points</div>
                            </div>

                            <div className="font-medium mt-3">Your Classification:</div>
                            <div className="ml-2 space-y-1">
                              <div>• Your Score: {totalScore} points</div>
                              <div>• Classification: <span className="font-medium">
                                {totalScore >= 25 ? 'High Readiness' : totalScore >= 18 ? 'Moderate Readiness' : 'Low Readiness'}
                              </span></div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h5 className="font-medium">Detailed Question Scoring Logic:</h5>
                          <div className="ml-4 space-y-2 text-xs">
                            <div className="font-medium">Step 1 - Primary Financial Challenge:</div>
                            <div className="ml-2 space-y-1">
                              <div>• Job loss (laid-off, temporary loss, pay cut): 3 points</div>
                              <div>• Medical/disability (illness, injury, disability): 3 points</div>
                              <div>• Life changes (divorce, loss of provider): 2 points</div>
                              <div>• Business slowdown: 2 points</div>
                              <div>• Other: 2 points</div>
                            </div>

                            <div className="font-medium mt-3">Step 2 - Motivation for Debt Freedom:</div>
                            <div className="ml-2 space-y-1">
                              <div>• Peace of mind/reduce stress: 3 points</div>
                              <div>• Save for major goal: 3 points</div>
                              <div>• Better life for family: 3 points</div>
                              <div>• Stop collection calls: 2 points</div>
                            </div>

                            <div className="font-medium mt-3">Step 3 - Options Already Explored:</div>
                            <div className="ml-2 space-y-1">
                              <div>• Multiple approaches (tried several options): 3 points</div>
                              <div>• Tried borrowing or loans: 2 points</div>
                              <div>• Basic budgeting only: 1 point</div>
                              <div>• Haven't explored other options yet: 1 point</div>
                            </div>

                            <div className="font-medium mt-3">Step 4 - Credit Score Importance (next 1-2 years):</div>
                            <div className="ml-2 space-y-1">
                              <div>• Very important, cannot afford drop: 1 point</div>
                              <div>• Somewhat important, debt is priority: 2 points</div>
                              <div>• Not important, understand it may get worse: 3 points</div>
                            </div>

                            <div className="font-medium mt-3">Step 5 - Spouse/Partner Involvement:</div>
                            <div className="ml-2 space-y-1">
                              <div>• Making decision together, full agreement: 3 points</div>
                              <div>• Aware and support: 3 points</div>
                              <div>• Not applicable: 2 points</div>
                              <div>• Not aware or disagree: 1 point</div>
                            </div>

                            <div className="font-medium mt-3">Step 6 - Payment Confidence:</div>
                            <div className="ml-2 space-y-1">
                              <div>• Very Confident: 3 points</div>
                              <div>• Somewhat Confident: 2 points</div>
                              <div>• Not Confident: 1 point</div>
                            </div>

                            <div className="font-medium mt-3">Step 7 - $500 Emergency Expense Handling:</div>
                            <div className="ml-2 space-y-1">
                              <div>• Cut personal budget: 3 points</div>
                              <div>• Use emergency fund: 3 points</div>
                              <div>• Ask for payment flexibility: 2 points</div>
                              <div>• Put on credit card: 1 point</div>
                            </div>

                            <div className="font-medium mt-3">Step 8 - Collection Calls Preparedness:</div>
                            <div className="ml-2 space-y-1">
                              <div>• Prepared, understand it's part of process: 3 points</div>
                              <div>• Nervous but can manage with plan: 2 points</div>
                              <div>• Not prepared for increase: 1 point</div>
                            </div>

                            <div className="font-medium mt-3">Step 9 - Financial Stress Management Approach:</div>
                            <div className="ml-2 space-y-1">
                              <div>• Proactively research solutions and stick to plan: 3 points</div>
                              <div>• Try to address but sometimes overwhelmed: 2 points</div>
                              <div>• Tend to avoid until escalate: 1 point</div>
                            </div>

                            <div className="font-medium mt-3">Maximum Possible Score:</div>
                            <div className="ml-2 space-y-1">
                              <div>• Base Assessment (Steps 1-9): 27 points max</div>
                              <div>• Video Bonus: 5 points max</div>
                              <div>• <strong>Total Possible: 32 points</strong></div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h5 className="font-medium">Strengths & Concerns Logic:</h5>
                          <div className="ml-4 space-y-2 text-xs">
                            <div className="font-medium">Your Strengths Section:</div>
                            <div className="ml-2 space-y-1">
                              <div>• Shows when step score ≥ 3 points</div>
                              <div>• Step 1 (≥3): "Clear understanding of financial hardship"</div>
                              <div>• Step 2 (≥3): "Strong personal motivation for debt freedom"</div>
                              <div>• Step 3 (≥3): "Thoroughly explored alternative solutions"</div>
                              <div>• Step 4 (≥3): "Realistic expectations about credit impact"</div>
                              <div>• Step 5 (≥3): "Full household support for decision"</div>
                              <div>• Step 6 (≥3): "High confidence in payment ability"</div>
                              <div>• Step 7 (≥3): "Good emergency expense management"</div>
                              <div>• Step 8 (≥3): "Prepared for collection call challenges"</div>
                              <div>• Step 9 (≥3): "Proactive stress management approach"</div>
                            </div>

                            <div className="font-medium mt-3">Areas of Concern Section:</div>
                            <div className="ml-2 space-y-1">
                              <div>• Shows when step score ≤ 1 point</div>
                              <div>• Step 1 (≤1): "May need to address underlying financial causes"</div>
                              <div>• Step 2 (≤1): "Motivation level may affect commitment"</div>
                              <div>• Step 3 (≤1): "Should explore more alternatives before proceeding"</div>
                              <div>• Step 4 (≤1): "Credit score concerns may cause stress during process"</div>
                              <div>• Step 5 (≤1): "Lack of household support could create challenges"</div>
                              <div>• Step 6 (≤1): "Payment confidence needs improvement"</div>
                              <div>• Step 7 (≤1): "Emergency planning needs strengthening"</div>
                              <div>• Step 8 (≤1): "Need better preparation for collection calls"</div>
                              <div>• Step 9 (≤1): "Stress management skills need development"</div>
                            </div>

                            <div className="font-medium mt-3">Critical Concern Recommendations:</div>
                            <div className="ml-2 space-y-1">
                              <div>• Step 4 (≤1): "Consider waiting if credit score is critically important short-term"</div>
                              <div>• Step 5 (≤1): "Get household alignment before proceeding"</div>
                              <div>• Step 6 (≤1): "Stabilize income/expenses before starting program"</div>
                              <div>• Step 7 (≤1): "Build $500+ emergency fund first"</div>
                              <div>• Step 8 (≤1): "Prepare mentally for increased collection activity"</div>
                            </div>

                            <div className="font-medium mt-3">Moderate Concern Recommendations:</div>
                            <div className="ml-2 space-y-1">
                              <div>• Step 3 (=2): "Ensure you've fully explored debt consolidation options"</div>
                              <div>• Step 4 (=2): "Understand credit will be impacted but recovers after completion"</div>
                              <div>• Step 6 (=2): "Create detailed monthly budget to increase payment confidence"</div>
                              <div>• Step 8 (=2): "Develop a plan for handling collection calls"</div>
                            </div>

                            <div className="font-medium mt-3">Your Current Strengths & Concerns:</div>
                            <div className="ml-2 space-y-1">
                              {Object.keys(formData).filter(key => key.startsWith('step')).map(stepKey => {
                                const stepData = formData[stepKey];
                                if (!stepData || stepData.points === undefined) return null;
                                const stepNumber = stepKey.replace('step', '');
                                const isStrength = stepData.points >= 3;
                                const isConcern = stepData.points <= 1;
                                const isModerateConcern = stepData.points === 2;

                                return (
                                  <div key={stepKey}>
                                    • Step {stepNumber} ({stepData.points} pts): {isStrength ? 'STRENGTH' : isConcern ? 'CONCERN' : isModerateConcern ? 'MODERATE CONCERN' : 'NEUTRAL'}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                        <div>
                          <h5 className="font-medium">Readiness What's Next Section Logic:</h5>
                          <div className="ml-4 space-y-2 text-xs">
                            <div className="font-medium">Letter Grade Calculation:</div>
                            <div className="ml-2 space-y-1">
                              <div>• Formula: (readiness score ÷ 35) × 100</div>
                              <div>• Max possible readiness score: 35 points</div>
                              <div>• Grade A: 90-100% (32-35 points)</div>
                              <div>• Grade B: 80-89% (28-31 points)</div>
                              <div>• Grade C: 70-79% (25-27 points)</div>
                              <div>• Grade D: 60-69% (21-24 points)</div>
                              <div>• Grade F: 0-59% (0-20 points)</div>
                              <div>• Your Grade: {(() => {
                                const percentage = Math.round((totalScore / 35) * 100);
                                if (percentage >= 90) return 'A';
                                if (percentage >= 80) return 'B';
                                if (percentage >= 70) return 'C';
                                if (percentage >= 60) return 'D';
                                return 'F';
                              })()} ({Math.round((totalScore / 35) * 100)}%)</div>
                            </div>

                            <div className="font-medium mt-3">Score Range Categories:</div>
                            <div className="ml-2 space-y-1">
                              <div>• High Readiness: 25-35 points</div>
                              <div>• Moderate Readiness: 18-24 points</div>
                              <div>• Low Readiness: 0-17 points</div>
                            </div>

                            <div className="font-medium mt-3">Message Logic by Score Range:</div>
                            <div className="ml-2 space-y-1">
                              <div>• High (25-35): "Let's verify debt settlement is right for you by verifying your financial situation."</div>
                              <div>• Moderate (18-24): "Improve your score by viewing the videos below. Once you have completed this task, you will be able to verify you financial situation."</div>
                              <div>• Low (0-17): "Debt settlement is likely not a good fit for you but we have resources available for you to improve your situation."</div>
                            </div>

                            <div className="font-medium mt-3">Button Logic by Score Range:</div>
                            <div className="ml-2 space-y-1">
                              <div>• High (25-35): "See your plan" → /your-plan</div>
                              <div>• Moderate (18-24): "See your plan" → /your-plan</div>
                              <div>• Low (0-17): "Resources" → /resources</div>
                            </div>

                            <div className="font-medium mt-3">Your Current Readiness Status:</div>
                            <div className="ml-2 space-y-1">
                              <div>• Readiness Score: {totalScore}/35 points</div>
                              <div>• Category: {totalScore >= 25 ? 'High Readiness' : totalScore >= 18 ? 'Moderate Readiness' : 'Low Readiness'}</div>
                              <div>• Letter Grade: {(() => {
                                const percentage = Math.round((totalScore / 35) * 100);
                                if (percentage >= 90) return 'A';
                                if (percentage >= 80) return 'B';
                                if (percentage >= 70) return 'C';
                                if (percentage >= 60) return 'D';
                                return 'F';
                              })()}</div>
                              <div>• Next Step: {totalScore >= 18 ? 'See your plan' : 'Resources'}</div>
                            </div>
                          </div>
                        </div>


                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

    </div>
  );
}