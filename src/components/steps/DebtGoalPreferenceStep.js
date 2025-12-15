'use client';

import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

const debtGoalOptions = [
  {
    label: "Getting Debt-Free Faster",
    value: "faster",
    description: "Optimize your plan to pay off debt in the shortest time possible"
  },
  {
    label: "Lowering Your Monthly Payments",
    value: "lower_payments",
    description: "Keep your monthly payments as low as possible"
  },
];

export default function DebtGoalPreferenceStep({ onComplete, onBack }) {
  const handleSelection = (preference) => {
    onComplete({ preference });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 mb-4">
            <svg
              className="h-8 w-8 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>
          <CardTitle className="text-2xl">Which option is more important to you?</CardTitle>
          <CardDescription className="text-base mt-2">
            This helps us customize your debt settlement plan to match your goals.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4 max-w-md mx-auto">
            {debtGoalOptions.map((option) => (
              <Button
                key={option.value}
                onClick={() => handleSelection(option.value)}
                variant="outline"
                size="lg"
                className="justify-start h-auto py-4 px-6 text-left"
              >
                <div>
                  <div className="font-semibold">{option.label}</div>
                  <div className="text-sm text-muted-foreground font-normal mt-1">
                    {option.description}
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
        <CardFooter className="w-full">
          <div className="flex w-full mt-4 justify-start">
            <Button variant="outline" onClick={onBack}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
