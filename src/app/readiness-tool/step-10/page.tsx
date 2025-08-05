"use client";

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { useReadinessStore } from '@/lib/readiness-store';
import { ReadinessStepNavigation } from '@/components/readiness-step-navigation';

const options = [
  { label: "Laid off or work related", value: "work_related" },
  { label: "Disability or personal injury", value: "disability_injury" },
  { label: "Loss of financial provider or divorce", value: "loss_or_divorce" },
  { label: "Medical expenses", value: "medical_expenses" },
];

export default function Step10() {
  const router = useRouter();
  const { setFormData } = useReadinessStore();

  const handleSelection = (value: string) => {
    setFormData('step10', { hardship_reason: value });
    router.push('/readiness-tool/results');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>What is the main reason for your financial hardship?</CardTitle>
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
        <ReadinessStepNavigation currentStep={10} totalSteps={10} showNext={false} />
      </CardFooter>
    </Card>
  );
}
