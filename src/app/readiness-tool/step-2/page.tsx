"use client";

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { useReadinessStore } from '@/lib/readiness-store';
import { ReadinessStepNavigation } from '@/components/readiness-step-navigation';

const options = [
  { label: "Peace of mind/reduce stress", value: "peace_of_mind", points: 5 },
  { label: "Save for major goal", value: "save_goal", points: 4 },
  { label: "Better life for family", value: "better_life", points: 4 },
  { label: "Stop collection calls", value: "stop_calls", points: 3 },
];

export default function Step2() {
  const router = useRouter();
  const { setFormData } = useReadinessStore();

  const handleSelection = (value: string, points: number) => {
    setFormData('step2', { primary_motivation: value, points });
    router.push('/readiness-tool/step-3');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>What is your primary motivation for becoming debt-free?</CardTitle>
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
        <ReadinessStepNavigation currentStep={2} totalSteps={9} showNext={false} />
      </CardFooter>
    </Card>
  );
}