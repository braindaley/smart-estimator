"use client";

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { useReadinessStore } from '@/lib/readiness-store';
import { ReadinessStepNavigation } from '@/components/readiness-step-navigation';

const options = [
  { label: "Yes", value: "yes" },
  { label: "No", value: "no" },
];

export default function Step8() {
  const router = useRouter();
  const { setFormData } = useReadinessStore();

  const handleSelection = (value: string) => {
    setFormData('step8', { discussed_with_family: value });
    router.push('/readiness-tool/step-9');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Have you discussed a debt settlement solution with family or friends?</CardTitle>
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
        <ReadinessStepNavigation currentStep={8} totalSteps={10} showNext={false} />
      </CardFooter>
    </Card>
  );
}
