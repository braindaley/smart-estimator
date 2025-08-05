"use client";

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { useReadinessStore } from '@/lib/readiness-store';
import { ReadinessStepNavigation } from '@/components/readiness-step-navigation';

const options = [
  { label: "I'm barely keeping up with payments", value: "barely_keeping_up" },
  { label: "I've missed payments or received a collection notice", value: "missed_payments" },
  { label: "I’ve been denied for new credit recently", value: "denied_credit" },
  { label: "None of the above", value: "none" },
];

export default function Step6() {
  const router = useRouter();
  const { setFormData } = useReadinessStore();

  const handleSelection = (value: string) => {
    setFormData('step6', { current_situation: value });
    router.push('/readiness-tool/step-7');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Which of these sounds most like your current situation?</CardTitle>
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
        <ReadinessStepNavigation currentStep={6} totalSteps={10} showNext={false} />
      </CardFooter>
    </Card>
  );
}
