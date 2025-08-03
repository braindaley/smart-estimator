import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StepNavigation } from '@/components/step-navigation';

export default function Step1() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Step 1</CardTitle>
        <CardDescription>This is the first step of the estimator. Please fill out the details below.</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Form fields for step 1 will go here */}
        <p>Step 1 content goes here.</p>
        <StepNavigation currentStep={1} totalSteps={7} />
      </CardContent>
    </Card>
  );
}
