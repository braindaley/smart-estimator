'use client';

import { useEstimatorStore } from '@/lib/estimator-store';

export function useSmartEstimatorLink() {
  const { formData, _hasHydrated } = useEstimatorStore();

  // If not hydrated yet, default to step-1
  if (!_hasHydrated) {
    return '/smart-estimator/step-1';
  }

  // Check if assessment is completed by verifying all required data exists
  const collectedData = Object.values(formData).reduce(
    (acc, curr) => ({ ...acc, ...curr }),
    {}
  );

  const requiredKeys = [
    'debtAmountEstimate',
    'creditorCountEstimate', 
    'userFicoScoreEstimate',
    'hasSteadyIncome',
    'debtPaymentStatus',
  ];

  const hasAllRequiredData = requiredKeys.every(
    key => collectedData.hasOwnProperty(key) && collectedData[key] !== undefined
  );


  // If assessment is complete, go to results; otherwise go to step-1
  return hasAllRequiredData ? '/smart-estimator/results' : '/smart-estimator/step-1';
}