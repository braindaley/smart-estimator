"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface StepNavigationProps {
  currentStep: number;
  totalSteps: number;
  onNext?: () => void;
  showNext?: boolean;
}

export function StepNavigation({ currentStep, totalSteps, onNext, showNext = true }: StepNavigationProps) {
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
      router.back();
    } else {
      router.push('/');
    }
  };

  return (
    <div className={`flex mt-8 ${showNext ? 'justify-between' : 'justify-start'}`}>
      <Button variant="outline" onClick={handleBack}>
        <ChevronLeft className="mr-2 h-4 w-4" />
        Back
      </Button>
      {showNext && (
        <Button onClick={handleNext}>
          {currentStep === totalSteps ? 'Finish' : 'Next'}
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
