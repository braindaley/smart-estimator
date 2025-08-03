import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StepNavigation } from '@/components/step-navigation';

export default function Step2() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Step 2</CardTitle>
        <CardDescription>This is the second step.</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Form fields for step 2 will go here */}
        <p>Step 2 content goes here.</p>
        <StepNavigation currentStep={2} totalSteps={7} />
      </CardContent>
    </Card>
  );
}
