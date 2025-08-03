"use client";

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { useEstimatorStore } from '@/lib/estimator-store';

const incomeStatusOptions = [
  { label: "Yes", value: true },
  { label: "No", value: false },
];

export default function Step6() {
  const router = useRouter();
  const { setFormData } = useEstimatorStore();

  const handleSelection = (hasSteadyIncome: boolean) => {
    setFormData('step6', { hasSteadyIncome });
    router.push('/smart-estimator/step-7');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Step 6</CardTitle>
        <CardDescription>Do you currently have a steady source of income?</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          {incomeStatusOptions.map((option) => (
            <Button
              key={option.label}
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
    </Card>
  );
}