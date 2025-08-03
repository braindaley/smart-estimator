"use client";

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { useEstimatorStore } from '@/lib/estimator-store';
import { StepNavigation } from '@/components/step-navigation';

const ficoScoreOptions = [
  { label: "Less than 630", value: 600 },
  { label: "630-659", value: 645 },
  { label: "660-719", value: 690 },
  { label: "Greater than 720", value: 750 },
  { label: "I don't know", value: 645 },
];

export default function Step7() {
  const router = useRouter();
  const { setFormData } = useEstimatorStore();

  const handleSelection = (userFicoScoreEstimate: number) => {
    setFormData('step7', { userFicoScoreEstimate });
    router.push('/smart-estimator/results');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Step 7</CardTitle>
        <CardDescription>Do you know your FICO score?</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
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
      <CardFooter>
        <StepNavigation currentStep={7} totalSteps={7} showNext={false} />
      </CardFooter>
    </Card>
  );
}
