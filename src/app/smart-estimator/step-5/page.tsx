import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StepNavigation } from '@/components/step-navigation';

export default function Step5() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Step 5</CardTitle>
        <CardDescription>This is the fifth step.</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Form fields for step 5 will go here */}
        <p>Step 5 content goes here.</p>
        <StepNavigation currentStep={5} totalSteps={7} />
      </CardContent>
    </Card>
  );
}
