"use client";

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { useReadinessStore } from '@/lib/readiness-store';
import { ReadinessStepNavigation } from '@/components/readiness-step-navigation';

const options = [
  { label: "Put on credit card", value: "credit_card", points: 1 },
  { label: "Cut personal budget", value: "cut_budget", points: 3 },
  { label: "Use emergency fund", value: "emergency_fund", points: 3 },
  { label: "Ask for payment flexibility", value: "payment_flexibility", points: 2 },
];

export default function Step7() {
  const router = useRouter();
  const { setFormData } = useReadinessStore();

  const handleSelection = (value: string, points: number) => {
    setFormData('step7', { emergency_expense_handling: value, points });
    router.push('/readiness-tool/step-8');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>How would you handle a $500 emergency expense?</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4 max-w-md mx-auto">
          {options.map((option) => (
            <Button
              key={option.value}
              onClick={() => handleSelection(option.value, option.points)}
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
        <ReadinessStepNavigation currentStep={7} totalSteps={9} showNext={false} />
      </CardFooter>
    </Card>
  );
}