"use client";

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { useReadinessStore } from '@/lib/readiness-store';
import { ReadinessStepNavigation } from '@/components/readiness-step-navigation';

const options = [
  { label: "Yes", value: "yes" },
  { label: "No", value: "no" },
  { label: "Not sure", value: "not_sure" },
];

export default function Step1() {
  const router = useRouter();
  const { setFormData } = useReadinessStore();

  const handleSelection = (value: string) => {
    setFormData('step1', { debt_reduction_goal: value });
    router.push('/readiness-tool/step-2');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Are you currently trying to find a way to lower or get rid of your debt?</CardTitle>
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
        <ReadinessStepNavigation currentStep={1} totalSteps={10} showNext={false} />
      </CardFooter>
    </Card>
  );
}
