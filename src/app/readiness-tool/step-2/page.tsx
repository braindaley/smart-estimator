"use client";

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { useReadinessStore } from '@/lib/readiness-store';
import { ReadinessStepNavigation } from '@/components/readiness-step-navigation';

const options = [
  { label: "Very", value: "very" },
  { label: "Somewhat", value: "somewhat" },
  { label: "Not important", value: "not_important" },
  { label: "Can't afford any drop", value: "no_drop" },
];

export default function Step2() {
  const router = useRouter();
  const { setFormData } = useReadinessStore();

  const handleSelection = (value: string) => {
    setFormData('step2', { credit_score_importance: value });
    router.push('/readiness-tool/step-3');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>How important is it to you to keep your credit score high in the next year or two?</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4 max-w-md mx-auto">
          {options.map((option) => (
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
        <ReadinessStepNavigation currentStep={2} totalSteps={10} showNext={false} />
      </CardFooter>
    </Card>
  );
}
