import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function Results() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Results</CardTitle>
        <CardDescription>Here are your smart estimator results.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>The results will be displayed here.</p>
      </CardContent>
    </Card>
  );
}
