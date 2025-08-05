"use client";

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { useEstimatorStore } from '@/lib/estimator-store';
import { StepNavigation } from '@/components/step-navigation';

const debtOptions = [
  { label: "Less than $15,000", value: 14999 },
  { label: "$15,000-$25,000", value: 20000 },
  { label: "$25,000-$50,000", value: 37500 },
  { label: "Over $50,000", value: 50001 },
];

export default function Step1() {
  const router = useRouter();
  const { setFormData } = useEstimatorStore();

  const handleSelection = (debtAmountEstimate: number) => {
    setFormData('step1', { debtAmountEstimate });
    router.push('/smart-estimator/step-2');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>About how much debt are you carrying right now?</CardTitle>
        <CardDescription>Just a ballpark is fine - no need to be exact.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4 max-w-md mx-auto">
          {debtOptions.map((option) => (
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
        <StepNavigation currentStep={1} totalSteps={6} showNext={false} />
      </CardFooter>
    </Card>
  );
}
