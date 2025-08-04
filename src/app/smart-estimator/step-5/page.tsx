"use client";

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { useEstimatorStore } from '@/lib/estimator-store';
import { StepNavigation } from '@/components/step-navigation';

const paymentStatusOptions = [
  { label: "Current", value: "Current" },
  { label: "Late on payments", value: "Late on payments" },
  { label: "In collections", value: "In collections" },
];

export default function Step5() {
  const router = useRouter();
  const { setFormData } = useEstimatorStore();

  const handleSelection = (currentPaymentStatus: string) => {
    setFormData('step5', { currentPaymentStatus });
    router.push('/smart-estimator/step-6');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Step 5</CardTitle>
        <CardDescription>What is the current status of your payments?</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
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
        <StepNavigation currentStep={5} totalSteps={6} showNext={false} />
      </CardFooter>
    </Card>
  );
}
