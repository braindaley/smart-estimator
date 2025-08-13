"use client";

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { useReadinessStore } from '@/lib/readiness-store';
import { ReadinessStepNavigation } from '@/components/readiness-step-navigation';

const options = [
  { label: "Making decision together, full agreement", value: "together_agree", points: 3 },
  { label: "Aware and support", value: "aware_support", points: 3 },
  { label: "Not aware or disagree", value: "not_aware", points: 1 },
  { label: "Not applicable", value: "not_applicable", points: 2 },
];

export default function Step5() {
  const router = useRouter();
  const { setFormData } = useReadinessStore();

  const handleSelection = (value: string, points: number) => {
    setFormData('step5', { spouse_involvement: value, points });
    router.push('/readiness-tool/step-6');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>How involved is your spouse/partner in this decision?</CardTitle>
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
        <ReadinessStepNavigation currentStep={5} totalSteps={9} showNext={false} />
      </CardFooter>
    </Card>
  );
}