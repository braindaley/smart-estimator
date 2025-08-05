import { Header } from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";

const resourceLinks = [
  {
    title: "Nonprofit Credit Counseling",
    description: "Get free or low-cost help from a certified credit counselor to understand your options, create a budget, and negotiate with creditors.",
    href: "#",
    icon: CheckCircle2,
  },
  {
    title: "Debt Management Plans (DMPs)",
    description: "Consolidate your debts into a single monthly payment, often with lower interest rates, through a credit counseling agency.",
    href: "#",
    icon: CheckCircle2,
  },
  {
    title: "Government Assistance Programs",
    description: "Explore local, state, and federal programs that may offer grants or assistance for housing, utilities, and other essential expenses.",
    href: "#",
    icon: CheckCircle2,
  },
  {
    title: "Debt Validation",
    description: "Request that debt collectors prove you actually owe the money they are trying to collect. This can sometimes lead to debt dismissal.",
    href: "#",
    icon: CheckCircle2,
  }
];

export default function IncomeFreeDebtOptionsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 py-12">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Debt Options Without Steady Income
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Financial challenges don't have to be a roadblock. Here are some effective strategies to manage debt even without a consistent income.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {resourceLinks.map((resource) => (
              <Card key={resource.title}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <resource.icon className="h-8 w-8 text-primary" />
                    <CardTitle>{resource.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>{resource.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>

           <div className="mt-12 text-center">
                <p className="text-muted-foreground">
                    This information is for educational purposes only. For personalized financial advice, please consult with a qualified professional.
                </p>
            </div>
        </div>
      </main>
    </div>
  );
}

    