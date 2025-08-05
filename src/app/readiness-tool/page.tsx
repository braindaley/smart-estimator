import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, AlertTriangle, CalendarClock, TrendingUp } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const readinessFactors = [
  {
    title: "It's a Multi-Year Journey",
    description: "Debt settlement isn't a quick fix. Most programs take around 3 years to complete. You'll need the patience to see it through.",
  },
  {
    title: "Consistency is Key",
    description: "You must be able to make consistent monthly payments into your settlement account. This is non-negotiable for success.",
  },
  {
    title: "Your Credit Will Fluctuate",
    description: "Your credit score will likely take a temporary dip before it starts to improve. You need to be prepared for this reality.",
  },
  {
    title: "It's a Mental Commitment",
    description: "Beyond the finances, you need the mental and emotional strength to stick with the plan, even when it gets challenging.",
  },
];

const whatToExpectItems = [
    {
        icon: CalendarClock,
        title: "Monthly Commitment",
        description: "You’ll make a monthly payment into a dedicated account.",
    },
    {
        icon: AlertTriangle,
        title: "Hard Choices Ahead",
        description: "Some accounts may go into collections temporarily.",
    },
    {
        icon: TrendingUp,
        title: "Long-Term Impact",
        description: "Debt-free in 2–4 years if you stay the course.",
    }
]

const toolBenefits = [
    {
        text: "Personalized feedback based on your situation",
        icon: CheckCircle2,
    },
    {
        text: "Tips to improve readiness if you’re not quite there yet",
        icon: CheckCircle2,
    },
    {
        text: "Free educational videos to earn Momentum Points and boost your score",
        icon: CheckCircle2,
    }
]

export default function ReadinessToolPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-1 items-center gap-12 py-12 md:grid-cols-2 md:py-24">
            <div className="flex flex-col items-start text-left">
              <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
                Are You Ready to Change Your Financial Future?
              </h1>
              <p className="mb-8 text-lg text-muted-foreground sm:text-xl">
                Debt settlement takes commitment—but if you’re ready, this tool will help you find out.
              </p>
              <Button asChild size="lg">
                <Link href="/readiness-tool/step-1">Start the Readiness Check</Link>
              </Button>
            </div>
            <div className="flex items-center justify-center">
              <Image
                src="https://placehold.co/600x400.png"
                alt="Placeholder image"
                width={600}
                height={400}
                className="rounded-lg"
                data-ai-hint="abstract dots"
              />
            </div>
          </div>
          
          <div className="py-12 md:py-24 bg-muted rounded-lg">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">How This Tool Helps You Prepare</h2>
                </div>
                <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                    {toolBenefits.map((item) => (
                        <div key={item.text} className="flex items-start gap-4">
                            <item.icon className="h-6 w-6 flex-shrink-0 text-primary mt-1" />
                            <p className="text-lg text-foreground">{item.text}</p>
                        </div>
                    ))}
                </div>
            </div>
          </div>

          <div className="py-12 md:py-24">
             <div className="text-center mb-12">
                <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Why Readiness Matters</h2>
                <p className="mt-4 text-lg text-muted-foreground">Understanding the commitment is the first step to success.</p>
             </div>
            <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
               <div className="flex items-center justify-center">
                <Image
                    src="https://placehold.co/600x400.png"
                    alt="Placeholder image"
                    width={600}
                    height={400}
                    className="rounded-lg"
                    data-ai-hint="checklist checkmark"
                />
              </div>
              <div className="space-y-6">
                {readinessFactors.map((factor) => (
                    <div key={factor.title} className="flex items-start gap-4">
                        <CheckCircle2 className="h-6 w-6 flex-shrink-0 text-primary mt-1" />
                        <div>
                            <h3 className="text-lg font-semibold">{factor.title}</h3>
                            <p className="text-muted-foreground">{factor.description}</p>
                        </div>
                    </div>
                ))}
              </div>
            </div>
          </div>

          <div className="py-12 md:py-24">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">What to Expect on the Journey</h2>
              <p className="mt-4 text-lg text-muted-foreground">The path has challenges, but the destination is worth it.</p>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                {whatToExpectItems.map((item) => (
                    <Card key={item.title}>
                        <CardHeader className="items-center text-center">
                            <div className="rounded-full bg-primary/10 p-3">
                                <item.icon className="h-8 w-8 text-primary" />
                            </div>
                            <CardTitle>{item.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="text-center">
                            <p className="text-muted-foreground">{item.description}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
          </div>
        </div>
        <div className="bg-muted py-12 mt-12">
          <div className="container mx-auto max-w-7xl px-4 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Ready to see where you stand?
            </h2>
            <Button asChild size="lg" className="mt-6">
              <Link href="/readiness-tool/step-1">Start the Readiness Tool</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
