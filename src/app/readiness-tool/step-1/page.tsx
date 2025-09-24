"use client";

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { useReadinessStore } from '@/lib/readiness-store';
import { ReadinessStepNavigation } from '@/components/readiness-step-navigation';

const options = [
  { label: "Job loss (laid-off, temporary loss, pay cut)", value: "job_loss", points: 5 },
  { label: "Medical/disability (illness, injury, disability)", value: "medical_disability", points: 4 },
  { label: "Life changes (divorce, loss of provider)", value: "life_changes", points: 4 },
  { label: "Business slowdown", value: "business_slowdown", points: 2 },
  { label: "Other", value: "other", points: 3 },
];

export default function Step1() {
  const router = useRouter();
  const { setFormData } = useReadinessStore();

  const handleSelection = (value: string, points: number) => {
    setFormData('step1', { primary_challenge: value, points });
    router.push('/readiness-tool/step-2');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>What is the primary challenge causing your financial stress?</CardTitle>
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
        <ReadinessStepNavigation currentStep={1} totalSteps={9} showNext={false} />
      </CardFooter>
    </Card>
  );
}
