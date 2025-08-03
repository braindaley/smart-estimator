import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StepNavigation } from '@/components/step-navigation';

export default function Step4() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Step 4</CardTitle>
        <CardDescription>This is the fourth step.</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Form fields for step 4 will go here */}
        <p>Step 4 content goes here.</p>
        <StepNavigation currentStep={4} totalSteps={7} />
      </CardContent>
    </Card>
  );
}
