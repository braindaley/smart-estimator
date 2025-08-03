import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StepNavigation } from '@/components/step-navigation';

export default function Step3() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Step 3</CardTitle>
        <CardDescription>This is the third step.</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Form fields for step 3 will go here */}
        <p>Step 3 content goes here.</p>
        <StepNavigation currentStep={3} totalSteps={7} />
      </CardContent>
    </Card>
  );
}
