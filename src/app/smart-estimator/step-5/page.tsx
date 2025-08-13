"use client";

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { useEstimatorStore } from '@/lib/estimator-store';
import { StepNavigation } from '@/components/step-navigation';

const ficoOptions = [
  { label: "Prime 720+", value: 740 },
  { label: "Good 690-719", value: 705 },
  { label: "Fair 580-689", value: 635 },
  { label: "Subprime <580", value: 550 },
];

export default function Step5() {
  const router = useRouter();
  const { setFormData } = useEstimatorStore();

  const handleSelection = (userFicoScoreEstimate: number) => {
    setFormData('step5', { userFicoScoreEstimate });
    router.push('/smart-estimator/results');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>What is your best estimate of your credit score?</CardTitle>
        <CardDescription>This helps us determine which loan options you might qualify for.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4 max-w-md mx-auto">
          {ficoOptions.map((option) => (
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
        <StepNavigation currentStep={5} totalSteps={5} showNext={false} />
      </CardFooter>
    </Card>
  );
}
