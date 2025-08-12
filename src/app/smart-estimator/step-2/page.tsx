"use client";

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { useEstimatorStore } from '@/lib/estimator-store';
import { StepNavigation } from '@/components/step-navigation';

const creditorOptions = [
  { label: "1–2", value: 1.5 },
  { label: "3–5", value: 4 },
  { label: "6–10", value: 8 },
  { label: "10+", value: 15 },
];

export default function Step2() {
  const router = useRouter();
  const { setFormData } = useEstimatorStore();

  const handleSelection = (creditorCountEstimate: number) => {
    setFormData('step2', { creditorCountEstimate });
    router.push('/smart-estimator/step-3');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>How many different companies do you owe money to?</CardTitle>
        <CardDescription>Think credit cards, lenders, or finance companies.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4 max-w-md mx-auto">
          {creditorOptions.map((option) => (
            <Button
              key={option.value}
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
        <StepNavigation currentStep={2} totalSteps={5} showNext={false} />
      </CardFooter>
    </Card>
  );
}
