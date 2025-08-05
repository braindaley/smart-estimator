"use client";

import { usePathname } from 'next/navigation';
import { Progress } from '@/components/ui/progress';

const TOTAL_STEPS = 5;

export function SmartEstimatorProgress() {
  const pathname = usePathname();
  const stepMatch = pathname.match(/step-(\d+)/);
  const currentStep = stepMatch ? parseInt(stepMatch[1], 10) : 0;
  const progress = currentStep > 0 ? (currentStep / TOTAL_STEPS) * 100 : 0;

  if (currentStep === 0) return null;

  return (
    <div className="w-full">
      <p className="mb-2 text-center text-sm text-muted-foreground">
        Step {currentStep} of {TOTAL_STEPS}
      </p>
      <Progress value={progress} className="w-full" />
    </div>
  );
}
