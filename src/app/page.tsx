import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Logo } from '@/components/logo';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-10 w-full border-b bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 max-w-7xl items-center px-4">
          <Logo />
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center">
        <div className="container mx-auto max-w-7xl px-4 text-center">
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
            Smart Estimator
          </h1>
          <p className="mb-8 text-lg text-muted-foreground sm:text-xl">
            Get an estimate for your project in just a few steps.
          </p>
          <Button asChild size="lg">
            <Link href="/smart-estimator/step-1">Start Smart Estimator</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
