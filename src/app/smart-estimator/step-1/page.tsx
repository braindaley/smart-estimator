"use client";

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { useEstimatorStore } from '@/lib/estimator-store';
import { StepNavigation } from '@/components/step-navigation';

const debtOptions = [
  { label: "$5K–$10K", value: 7500 },
  { label: "$10K–$14.9K", value: 12500 },
  { label: "$15K–$24.9K", value: 20000 },
  { label: "$25K–$49.9K", value: 37500 },
  { label: "$50K+", value: 60000 },
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
        <CardTitle>Step 1</CardTitle>
        <CardDescription>Estimated total amount of debt</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          {debtOptions.map((option) => (
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
      <CardFooter>
        <StepNavigation currentStep={1} totalSteps={7} showNext={false} />
      </CardFooter>
    </Card>
  );
}
