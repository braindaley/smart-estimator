"use client";

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { useReadinessStore } from '@/lib/readiness-store';
import { ReadinessStepNavigation } from '@/components/readiness-step-navigation';

const options = [
  { label: "Very Confident", value: "very_confident", points: 3 },
  { label: "Somewhat Confident", value: "somewhat_confident", points: 2 },
  { label: "Not Confident", value: "not_confident", points: 1 },
];

export default function Step6() {
  const router = useRouter();
  const { setFormData } = useReadinessStore();

  const handleSelection = (value: string, points: number) => {
    setFormData('step6', { payment_confidence: value, points });
    router.push('/readiness-tool/step-7');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>How confident are you in making monthly payments?</CardTitle>
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
        <ReadinessStepNavigation currentStep={6} totalSteps={9} showNext={false} />
      </CardFooter>
    </Card>
  );
}