"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface StepNavigationProps {
  currentStep: number;
  totalSteps: number;
  onNext?: () => void;
}

export function StepNavigation({ currentStep, totalSteps, onNext }: StepNavigationProps) {
  const router = useRouter();

  const handleNext = () => {
    if(onNext) {
        onNext();
    }
    if (currentStep < totalSteps) {
      router.push(`/smart-estimator/step-${currentStep + 1}`);
    } else {
      router.push('/smart-estimator/results');
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      router.push(`/smart-estimator/step-${currentStep - 1}`);
    } else {
      router.push('/');
    }
  };

  return (
    <div className="flex justify-between mt-8">
      <Button variant="outline" onClick={handleBack}>
        <ChevronLeft className="mr-2 h-4 w-4" />
        Back
      </Button>
      <Button onClick={handleNext}>
        {currentStep === totalSteps ? 'Finish' : 'Next'}
        <ChevronRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
}
