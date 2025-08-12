'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { useEstimatorStore } from '@/lib/estimator-store';
import { StepNavigation } from '@/components/step-navigation';

const incomeOptions = [
  { label: "Yes", value: true },
  { label: "No", value: false },
];

export default function Step4() {
  const router = useRouter();
  const { setFormData } = useEstimatorStore();

  const handleSelection = (hasSteadyIncome: boolean) => {
    setFormData('step-4', { hasSteadyIncome });
    router.push('/smart-estimator/step-5');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Do you have a steady source of income?</CardTitle>
        <CardDescription>This helps us determine if a payment plan is possible for you.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4 max-w-md mx-auto">
          {incomeOptions.map((option) => (
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
        <StepNavigation currentStep={4} totalSteps={5} showNext={false} />
      </CardFooter>
    </Card>
  );
}