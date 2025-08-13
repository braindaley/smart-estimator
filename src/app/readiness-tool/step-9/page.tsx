"use client";

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { useReadinessStore } from '@/lib/readiness-store';
import { ReadinessStepNavigation } from '@/components/readiness-step-navigation';

const options = [
  { label: "Proactively research solutions and stick to plan", value: "proactive", points: 3 },
  { label: "Try to address but sometimes overwhelmed", value: "try_overwhelmed", points: 2 },
  { label: "Tend to avoid until escalate", value: "avoid", points: 1 },
];

export default function Step9() {
  const router = useRouter();
  const { setFormData } = useReadinessStore();

  const handleSelection = (value: string, points: number) => {
    setFormData('step9', { stress_management_approach: value, points });
    router.push('/readiness-tool/results');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>What's your approach to managing financial stress?</CardTitle>
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
        <ReadinessStepNavigation currentStep={9} totalSteps={9} showNext={false} />
      </CardFooter>
    </Card>
  );
}