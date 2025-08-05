"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ReadinessStepNavigationProps {
  currentStep: number;
  totalSteps: number;
  onNext?: () => void;
  showNext?: boolean;
}

export function ReadinessStepNavigation({ currentStep, totalSteps, onNext, showNext = true }: ReadinessStepNavigationProps) {
  const router = useRouter();

  const handleNext = () => {
    if(onNext) {
        onNext();
    }
    if (currentStep < totalSteps) {
      router.push(`/readiness-tool/step-${currentStep + 1}`);
    } else {
      router.push('/readiness-tool/results');
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      router.back();
    } else {
      router.push('/readiness-tool');
    }
  };

  return (
    <div className={`flex w-full mt-8 ${showNext ? 'justify-between' : 'justify-start'}`}>
      <Button variant="outline" onClick={handleBack}>
        <ChevronLeft className="mr-2 h-4 w-4" />
        Back
      </Button>
      {showNext && (
        <Button type="submit" onClick={handleNext}>
          {currentStep === totalSteps ? 'Finish' : 'Next'}
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
