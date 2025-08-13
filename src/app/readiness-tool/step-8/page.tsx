"use client";

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { useReadinessStore } from '@/lib/readiness-store';
import { ReadinessStepNavigation } from '@/components/readiness-step-navigation';

const options = [
  { label: "Prepared, understand it's part of process", value: "prepared", points: 3 },
  { label: "Nervous but can manage with plan", value: "nervous_manage", points: 2 },
  { label: "Not prepared for increase", value: "not_prepared", points: 1 },
];

export default function Step8() {
  const router = useRouter();
  const { setFormData } = useReadinessStore();

  const handleSelection = (value: string, points: number) => {
    setFormData('step8', { collection_calls_preparedness: value, points });
    router.push('/readiness-tool/step-9');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Are you prepared for collection calls during the process?</CardTitle>
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
        <ReadinessStepNavigation currentStep={8} totalSteps={9} showNext={false} />
      </CardFooter>
    </Card>
  );
}