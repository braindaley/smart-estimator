import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Header } from '@/components/header';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-1 items-center gap-12 py-12 md:grid-cols-2 md:py-24">
            <div className="flex flex-col items-start text-left">
              <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
                Momentum changes everything
              </h1>
              <p className="mb-8 text-lg text-muted-foreground sm:text-xl">
                Answer a few questions. See your best path to financial freedom.
              </p>
              <div className="flex w-full flex-col items-start gap-4">
                <p className="text-sm text-muted-foreground">
                  Takes 2 minutes. No credit score impact.
                </p>
                <Button asChild size="lg">
                  <Link href="/smart-estimator/step-1">Explore plans</Link>
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <Image
                src="https://placehold.co/600x400.png"
                alt="Placeholder image with blue lines"
                width={600}
                height={400}
                className="rounded-lg"
                data-ai-hint="abstract lines"
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
