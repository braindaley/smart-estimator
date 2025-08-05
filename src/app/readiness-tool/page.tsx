import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

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
                <Link href="#">Start the Readiness Check</Link>
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
        </div>
      </main>
    </div>
  );
}
