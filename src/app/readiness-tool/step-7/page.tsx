"use client";

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { useReadinessStore } from '@/lib/readiness-store';
import { ReadinessStepNavigation } from '@/components/readiness-step-navigation';

const options = [
  { label: "Cut expenses", value: "cut_expenses" },
  { label: "Second job", value: "second_job" },
  { label: "Borrowed from friends/family", value: "borrowed" },
  { label: "Debt consolidation loan", value: "consolidation_loan" },
];

export default function Step7() {
  const router = useRouter();
  const { setFormData } = useReadinessStore();

  const handleSelection = (value: string) => {
    setFormData('step7', { ruled_out_options: value });
    router.push('/readiness-tool/step-8');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Have you already tried any of these and decided they won’t work?</CardTitle>
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
        <ReadinessStepNavigation currentStep={7} totalSteps={10} showNext={false} />
      </CardFooter>
    </Card>
  );
}
