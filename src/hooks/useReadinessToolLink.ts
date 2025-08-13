'use client';

import { useReadinessStore } from '@/lib/readiness-store';

export function useReadinessToolLink() {
  const { formData, _hasHydrated } = useReadinessStore();

  // If not hydrated yet, default to step-1
  if (!_hasHydrated) {
    return '/readiness-tool/step-1';
  }

  // Check if assessment is completed by verifying all 9 steps have data
  const requiredSteps = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  const completedSteps = requiredSteps.filter(step => {
    const stepData = formData[`step${step}`];
    return stepData && stepData.points !== undefined;
  });
  
  // Also check if we already have a readinessScore stored (indicates completion)
  const hasStoredScore = formData.readinessScore && formData.readinessScore.score > 0;
  
  const hasAllRequiredData = completedSteps.length === requiredSteps.length || hasStoredScore;


  // If assessment is complete, go to results; otherwise go to step-1
  return hasAllRequiredData ? '/readiness-tool/results' : '/readiness-tool/step-1';
}