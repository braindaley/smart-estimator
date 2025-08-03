import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StepNavigation } from '@/components/step-navigation';

export default function Step6() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Step 6</CardTitle>
        <CardDescription>This is the sixth step.</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Form fields for step 6 will go here */}
        <p>Step 6 content goes here.</p>
        <StepNavigation currentStep={6} totalSteps={7} />
      </CardContent>
    </Card>
  );
}
