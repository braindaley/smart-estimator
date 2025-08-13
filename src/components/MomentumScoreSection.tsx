'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartContainer, ChartConfig } from "@/components/ui/chart";
import { Label, PolarRadiusAxis, RadialBar, RadialBarChart } from "recharts";
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useSmartEstimatorLink } from '@/hooks/useSmartEstimatorLink';
import { useReadinessToolLink } from '@/hooks/useReadinessToolLink';

interface MomentumScoreSectionProps {
  smartEstimatorScore: number;
  readinessScore: number;
  totalPossibleScore?: number;
  hasSmartEstimatorData?: boolean;
  showScore?: boolean;
}

export default function MomentumScoreSection({
  smartEstimatorScore,
  readinessScore,
  totalPossibleScore = 70,
  hasSmartEstimatorData = false,
  showScore = true
}: MomentumScoreSectionProps) {
  const smartEstimatorLink = useSmartEstimatorLink();
  const readinessToolLink = useReadinessToolLink();
  
  if (!showScore) return null;

  return (
    <Card className="mt-8">
      <CardHeader className="pb-4 text-center">
        <CardTitle className="text-xl font-bold">
          Momentum Score: {smartEstimatorScore + readinessScore}/{totalPossibleScore}
        </CardTitle>
        <CardDescription>
          Complete all assessments to get your full evaluation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Smart Estimator Chart - First */}
          <div className="flex flex-col items-center space-y-2">
            <h4 className="text-base font-semibold">Smart Estimator</h4>
            <ChartContainer
              config={{
                score: { label: "Score", color: "hsl(221, 83%, 53%)" },
                remaining: { label: "Remaining", color: "hsl(210, 40%, 90%)" }
              } satisfies ChartConfig}
              className="mx-auto aspect-square w-full max-w-[150px]"
            >
              <RadialBarChart
                data={[{ score: smartEstimatorScore, remaining: 35 - smartEstimatorScore }]}
                endAngle={180}
                innerRadius={60}
                outerRadius={90}
              >
                <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                  <Label
                    content={({ viewBox }: any) => {
                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                        return (
                          <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) - 16}
                              className="fill-foreground text-2xl font-bold"
                            >
                              {smartEstimatorScore}
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) + 4}
                              className="fill-muted-foreground"
                            >
                              of 35
                            </tspan>
                          </text>
                        )
                      }
                    }}
                  />
                </PolarRadiusAxis>
                <RadialBar
                  dataKey="score"
                  stackId="a"
                  cornerRadius={5}
                  fill="var(--color-score)"
                  className="stroke-transparent stroke-2"
                />
                <RadialBar
                  dataKey="remaining"
                  fill="var(--color-remaining)"
                  stackId="a"
                  cornerRadius={5}
                  className="stroke-transparent stroke-2"
                />
              </RadialBarChart>
            </ChartContainer>
            {!hasSmartEstimatorData ? (
              <Button asChild size="sm" className="mt-2">
                <Link href={smartEstimatorLink}>Take Assessment</Link>
              </Button>
            ) : (
              <p className="text-xs text-center text-muted-foreground">
                Current assessment score
              </p>
            )}
          </div>

          {/* Readiness Chart - Second */}
          <div className="flex flex-col items-center space-y-2">
            <h4 className="text-base font-semibold">Readiness</h4>
            <ChartContainer
              config={{
                score: { label: "Score", color: "hsl(142, 76%, 36%)" },
                remaining: { label: "Remaining", color: "hsl(210, 40%, 90%)" }
              } satisfies ChartConfig}
              className="mx-auto aspect-square w-full max-w-[150px]"
            >
              <RadialBarChart
                data={[{ score: readinessScore, remaining: 35 - readinessScore }]}
                endAngle={180}
                innerRadius={60}
                outerRadius={90}
              >
                <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                  <Label
                    content={({ viewBox }: any) => {
                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                        return (
                          <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) - 16}
                              className="fill-foreground text-2xl font-bold"
                            >
                              {readinessScore}
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) + 4}
                              className="fill-muted-foreground"
                            >
                              of 35
                            </tspan>
                          </text>
                        )
                      }
                    }}
                  />
                </PolarRadiusAxis>
                <RadialBar
                  dataKey="score"
                  stackId="a"
                  cornerRadius={5}
                  fill="var(--color-score)"
                  className="stroke-transparent stroke-2"
                />
                <RadialBar
                  dataKey="remaining"
                  fill="var(--color-remaining)"
                  stackId="a"
                  cornerRadius={5}
                  className="stroke-transparent stroke-2"
                />
              </RadialBarChart>
            </ChartContainer>
            {readinessScore === 0 ? (
              <Button asChild size="sm" className="mt-2">
                <Link href={readinessToolLink}>Take Assessment</Link>
              </Button>
            ) : (
              <p className="text-xs text-center text-muted-foreground">
                Current readiness score
              </p>
            )}
          </div>

          {/* Your Plan Chart - Third */}
          <div className="flex flex-col items-center space-y-2">
            <h4 className="text-base font-semibold">Your Plan</h4>
            <ChartContainer
              config={{
                score: { label: "Score", color: "hsl(262, 83%, 58%)" },
                remaining: { label: "Remaining", color: "hsl(210, 40%, 90%)" }
              } satisfies ChartConfig}
              className="mx-auto aspect-square w-full max-w-[150px]"
            >
              <RadialBarChart
                data={[{ score: 0, remaining: 35 }]}
                endAngle={180}
                innerRadius={60}
                outerRadius={90}
              >
                <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                  <Label
                    content={({ viewBox }: any) => {
                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                        return (
                          <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) - 16}
                              className="fill-foreground text-2xl font-bold"
                            >
                              0
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) + 4}
                              className="fill-muted-foreground"
                            >
                              of 35
                            </tspan>
                          </text>
                        )
                      }
                    }}
                  />
                </PolarRadiusAxis>
                <RadialBar
                  dataKey="score"
                  stackId="a"
                  cornerRadius={5}
                  fill="var(--color-score)"
                  className="stroke-transparent stroke-2"
                />
                <RadialBar
                  dataKey="remaining"
                  fill="var(--color-remaining)"
                  stackId="a"
                  cornerRadius={5}
                  className="stroke-transparent stroke-2"
                />
              </RadialBarChart>
            </ChartContainer>
            <Button asChild size="sm" className="mt-2">
              <Link href="/creditor-profile">Take Assessment</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}