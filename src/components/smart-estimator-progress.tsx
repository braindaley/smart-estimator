"use client";

import { usePathname } from 'next/navigation';
import { Progress } from '@/components/ui/progress';

const TOTAL_STEPS = 7;

export function SmartEstimatorProgress() {
  const pathname = usePathname();
  const stepMatch = pathname.match(/step-(\d+)/);
  const currentStep = stepMatch ? parseInt(stepMatch[1], 10) : 0;
  const progress = (currentStep / TOTAL_STEPS) * 100;

  return (
    <div className="w-full">
      <p className="text-center text-sm text-muted-foreground mb-2">
        Step {currentStep} of {TOTAL_STEPS}
      </p>
      <Progress value={progress} className="w-full" />
    </div>
  );
}
