'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { useEstimatorStore } from '@/lib/estimator-store';
import { StepNavigation } from '@/components/step-navigation';

const paymentStatusOptions = [
  { label: "I'm current on all my payments", value: "current" },
  { label: "I'm late on one or more payments", value: "late" },
  { label: "My accounts are in collections", value: "collections" },
];

export default function Step3() {
  const router = useRouter();
  const { setFormData } = useEstimatorStore();

  const handleSelection = (debtPaymentStatus: string) => {
    setFormData('step-3', { debtPaymentStatus });
    router.push('/smart-estimator/step-4');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>What's the current status of your debt payments?</CardTitle>
        <CardDescription>This helps us understand the urgency of your situation.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4 max-w-md mx-auto">
          {paymentStatusOptions.map((option) => (
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
        <StepNavigation currentStep={3} totalSteps={5} showNext={false} />
      </CardFooter>
    </Card>
  );
}