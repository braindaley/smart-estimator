"use client";

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { useEstimatorStore } from '@/lib/estimator-store';
import { StepNavigation } from '@/components/step-navigation';

const ficoScoreOptions = [
  { label: "Yes, it's under 630", value: 600 },
  { label: "Yes, it's between 630-660", value: 645 },
  { label: "Yes, it's between 660-720", value: 690 },
  { label: "Yes, it's above 720", value: 750 },
  { label: "No, I'm not sure", value: 645 },
];

export default function Step6() {
  const router = useRouter();
  const { setFormData } = useEstimatorStore();

  const handleSelection = (userFicoScoreEstimate: number) => {
    setFormData('step6', { userFicoScoreEstimate });
    router.push('/smart-estimator/results');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Do you happen to know your credit score?</CardTitle>
        <CardDescription>If you are not sure, we can run your credit for free if you would like.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mx-auto flex max-w-md flex-col space-y-4">
          {ficoScoreOptions.map((option) => (
            <Button
              key={option.label}
              onClick={() => handleSelection(option.value)}
              variant="outline"
              size="lg"
              className="justify-start"
            >
              {option.label}
            </Button>
          ))}
        </div>
      </CardContent>
      <CardFooter className="w-full">
        <StepNavigation currentStep={6} totalSteps={6} showNext={false} />
      </CardFooter>
    </Card>
  );
}
