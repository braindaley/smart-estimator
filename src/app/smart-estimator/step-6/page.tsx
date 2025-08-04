"use client";

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { useEstimatorStore } from '@/lib/estimator-store';
import { StepNavigation } from '@/components/step-navigation';

const ficoScoreOptions = [
  { label: "Yes, it's under 630", value: 600 },
  { label: "Yes, it's between 630-660", value: 645 },
  { label: "660-719", value: 690 },
  { label: "Greater than 720", value: 750 },
  { label: "I don't know", value: 645 },
];

export default function Step6() {
  const router = useRouter();
  const { setFormData } = useEstimatorStore();

  const handleSelection = (userFicoScoreEstimate: number) => {
    setFormData('step7', { userFicoScoreEstimate });
    router.push('/smart-estimator/results');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Do you happen to know your credit score?</CardTitle>
        <CardDescription>Even a rough range helps us better understand your options.</CardDescription>
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
      <CardFooter className="w-full">
        <StepNavigation currentStep={6} totalSteps={6} showNext={false} />
      </CardFooter>
    </Card>
  );
}
