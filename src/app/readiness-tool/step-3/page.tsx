"use client";

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { useReadinessStore } from '@/lib/readiness-store';
import { ReadinessStepNavigation } from '@/components/readiness-step-navigation';

const options = [
  { label: "Multiple approaches (tried several options)", value: "multiple_approaches", points: 3 },
  { label: "Tried borrowing or loans", value: "borrowing_loans", points: 2 },
  { label: "Basic budgeting only", value: "basic_budgeting", points: 1 },
  { label: "Haven't explored other options yet", value: "not_explored", points: 1 },
];

export default function Step3() {
  const router = useRouter();
  const { setFormData } = useReadinessStore();

  const handleSelection = (value: string, points: number) => {
    setFormData('step3', { explored_options: value, points });
    router.push('/readiness-tool/step-4');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Which best describes the options you've already explored?</CardTitle>
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
        <ReadinessStepNavigation currentStep={3} totalSteps={9} showNext={false} />
      </CardFooter>
    </Card>
  );
}