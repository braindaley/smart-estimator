'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { checkDisqualification, getDisqualificationMessage, type ReadinessFormData } from '@/lib/readiness-disqualification';

interface ReadinessAssessmentResultProps {
  totalScore: number;
  questionScores: { [key: string]: number };
  formData?: ReadinessFormData;
}

type ReadinessLevel = {
  range: [number, number];
  title: string;
  message: string;
  strengths: string;
  recommendations: string;
  likelihood: string;
};

const readinessLevels: ReadinessLevel[] = [
  {
    range: [37, 52],
    title: "High Readiness",
    message: "You demonstrate strong readiness for debt settlement. Your responses show good financial discipline, realistic expectations, and preparation for the challenges ahead.",
    strengths: "Strong payment confidence, good stress management, prepared for process challenges",
    recommendations: "Proceed with confidence, maintain your emergency planning, stay committed to your payment schedule",
    likelihood: "High - You have the key factors for successful completion"
  },
  {
    range: [26, 36],
    title: "Moderate Readiness",
    message: "You show moderate readiness for debt settlement with some areas to address. Additional preparation will improve your chances of success.",
    strengths: "Good motivation and understanding of the process, some financial preparation",
    recommendations: "Strengthen payment confidence, improve stress management strategies, ensure better emergency planning",
    likelihood: "Moderate - Success possible with additional preparation"
  },
  {
    range: [0, 25],
    title: "Low Readiness",
    message: "Your readiness for debt settlement is limited. Several important factors need attention before proceeding.",
    strengths: "Recognition of debt problem, some motivation to address it",
    recommendations: "Build emergency fund, improve payment stability, develop stress management plan, explore all options",
    likelihood: "Low - Significant preparation needed before proceeding"
  }
];

const disqualifiedLevel: ReadinessLevel = {
  range: [0, 0],
  title: "Not Eligible",
  message: "Based on your current situation, debt settlement is not recommended at this time.",
  strengths: "Recognition of debt challenges and willingness to seek solutions",
  recommendations: "Address the specific concerns identified, then reassess your readiness for debt settlement",
  likelihood: "Not Recommended - Critical factors need resolution first"
};

const strengthIndicators: { [key: string]: string } = {
  'step1': "Clear understanding of financial hardship",
  'step2': "Strong personal motivation for debt freedom",
  'step3': "Thoroughly explored alternative solutions",
  'step4': "Realistic expectations about credit impact",
  'step5': "Full household support for decision",
  'step6': "High confidence in payment ability",
  'step7': "Good emergency expense management",
  'step8': "Prepared for collection call challenges",
  'step9': "Proactive stress management approach"
};

const concernIndicators: { [key: string]: string } = {
  'step1': "May need to address underlying financial causes",
  'step2': "Motivation level may affect commitment",
  'step3': "Should explore more alternatives before proceeding",
  'step4': "Credit score concerns may cause stress during process",
  'step5': "Lack of household support could create challenges",
  'step6': "Payment confidence needs improvement",
  'step7': "Emergency planning needs strengthening",
  'step8': "Need better preparation for collection calls",
  'step9': "Stress management skills need development"
};

const criticalConcernRecommendations: { [key: string]: string } = {
  'step4': "Consider waiting if credit score is critically important short-term",
  'step5': "Get household alignment before proceeding",
  'step6': "Stabilize income/expenses before starting program",
  'step7': "Build $500+ emergency fund first",
  'step8': "Prepare mentally for increased collection activity"
};

const moderateConcernRecommendations: { [key: string]: string } = {
  'step3': "Ensure you've fully explored debt consolidation options",
  'step4': "Understand credit will be impacted but recovers after completion",
  'step6': "Create detailed monthly budget to increase payment confidence",
  'step8': "Develop a plan for handling collection calls"
};

export default function ReadinessAssessmentResult({
  totalScore,
  questionScores,
  formData
}: ReadinessAssessmentResultProps) {
  // Check for disqualification first
  const disqualificationCheck = formData ? checkDisqualification(formData) : { isDisqualified: false, disqualificationReasons: [] };

  // Find the appropriate readiness level - force to disqualified if necessary
  const readinessLevel = disqualificationCheck.isDisqualified
    ? disqualifiedLevel
    : (readinessLevels.find(level =>
        totalScore >= level.range[0] && totalScore <= level.range[1]
      ) || readinessLevels[2]); // Default to "Low Readiness"

  // Generate dynamic strengths and concerns
  const dynamicStrengths: string[] = [];
  const dynamicConcerns: string[] = [];
  const criticalRecommendations: string[] = [];
  const moderateRecommendations: string[] = [];

  Object.entries(questionScores).forEach(([step, score]) => {
    if ((score >= 4 || (step === 'step3' && score >= 4) || (step === 'step4' && score >= 3)) && strengthIndicators[step]) {
      dynamicStrengths.push(strengthIndicators[step]);
    }
    if (score <= 1 && concernIndicators[step]) {
      dynamicConcerns.push(concernIndicators[step]);
      if (criticalConcernRecommendations[step]) {
        criticalRecommendations.push(criticalConcernRecommendations[step]);
      }
    }
    if (score === 2 && moderateConcernRecommendations[step]) {
      moderateRecommendations.push(moderateConcernRecommendations[step]);
    }
  });

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">
          {readinessLevel.title}
        </CardTitle>
        <CardDescription className="text-base mt-4">
          {disqualificationCheck.isDisqualified
            ? getDisqualificationMessage(disqualificationCheck.disqualificationReasons)
            : readinessLevel.message
          }
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Strengths and Concerns Side by Side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Strengths Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your Strengths</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">{readinessLevel.strengths}</p>
                {dynamicStrengths.length > 0 && (
                  <ul className="list-disc list-inside text-sm space-y-1 ml-4">
                    {dynamicStrengths.map((strength, index) => (
                      <li key={index}>{strength}</li>
                    ))}
                  </ul>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Concerns Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Areas of Concern</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {disqualificationCheck.isDisqualified
                    ? "Critical factors that prevent debt settlement eligibility:"
                    : dynamicConcerns.length > 0
                      ? "These areas may need attention to improve your debt settlement readiness"
                      : "No specific concerns identified based on your responses"
                  }
                </p>
                {disqualificationCheck.isDisqualified && (
                  <ul className="list-disc list-inside text-sm space-y-1 ml-4 text-red-600 font-medium">
                    {disqualificationCheck.disqualificationReasons.map((reason, index) => (
                      <li key={index}>{reason}</li>
                    ))}
                  </ul>
                )}
                {!disqualificationCheck.isDisqualified && dynamicConcerns.length > 0 && (
                  <ul className="list-disc list-inside text-sm space-y-1 ml-4">
                    {dynamicConcerns.map((concern, index) => (
                      <li key={index}>{concern}</li>
                    ))}
                  </ul>
                )}
              </div>
            </CardContent>
          </Card>
        </div>


      </CardContent>
    </Card>
  );
}