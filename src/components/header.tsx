
'use client';

import Link from 'next/link';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Logo } from '@/components/logo';
import { useEstimatorStore } from '@/lib/estimator-store';
import { useEffect, useState } from 'react';

export function Header() {
  const { formData } = useEstimatorStore();
  const [plansLink, setPlansLink] = useState('/smart-estimator/step-1');

  useEffect(() => {
    // Since the store is persisted, we need to check it on the client side.
    const hasData = Object.keys(formData).length > 0;
    const hasResultsData = Object.keys(formData).length >= 5;
    if (hasResultsData) {
      setPlansLink('/smart-estimator/results');
    } else if (hasData) {
        const lastStep = Math.max(0, ...Object.keys(formData).map(k => parseInt(k.replace('step', '') || '0', 10)));
        if(lastStep > 0 && lastStep < 6) {
            setPlansLink(`/smart-estimator/step-${lastStep}`);
        } else {
            setPlansLink('/smart-estimator/step-1');
        }
    } else {
        setPlansLink('/smart-estimator/step-1');
    }
  }, [formData]);


  return (
    <header className="sticky top-0 z-10 w-full border-b bg-background/95 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/">
          <Logo />
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          <Link
            href={plansLink}
            className="transition-colors hover:text-foreground/80 text-foreground/60"
          >
            Smart Estimator
          </Link>
          <Link
            href="/readiness-tool"
            className="transition-colors hover:text-foreground/80 text-foreground/60"
          >
            Readiness Tool
          </Link>
          <Link
            href="/customize-plan"
            className="transition-colors hover:text-foreground/80 text-foreground/60"
          >
            Customize Plan
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <Button asChild className="hidden md:flex">
            <Link href="/contact-us">Contact Us</Link>
          </Button>
          <Button variant="ghost" asChild className="hidden md:flex">
            <Link href="/login">Sign in</Link>
          </Button>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader className="mb-8">
                <SheetTitle>
                  <Link href="/">
                    <Logo />
                  </Link>
                </SheetTitle>
              </SheetHeader>
              <nav className="grid gap-6 text-lg font-medium">
                <Link
                  href="/"
                  className="flex items-center gap-2 text-lg font-semibold text-muted-foreground hover:text-foreground"
                >
                  Home
                </Link>
                <Link
                  href="/how-it-works"
                  className="flex items-center gap-2 text-lg font-semibold text-muted-foreground hover:text-foreground"
                >
                  How it works
                </Link>
                <Link
                  href="/customize-plan"
                  className="flex items-center gap-2 text-lg font-semibold text-muted-foreground hover:text-foreground"
                >
                  Customize Plan
                </Link>
                <Link
                  href={plansLink}
                  className="flex items-center gap-2 text-lg font-semibold text-muted-foreground hover:text-foreground"
                >
                  Smart Estimator
                </Link>
                 <Link
                  href="/readiness-tool"
                  className="flex items-center gap-2 text-lg font-semibold text-muted-foreground hover:text-foreground"
                >
                  Readiness Tool
                </Link>
                <Link
                  href="/contact-us"
                  className="flex items-center gap-2 text-lg font-semibold text-muted-foreground hover:text-foreground"
                >
                  Contact Us
                </Link>
                <Link
                  href="/login"
                  className="flex items-center gap-2 text-lg font-semibold text-muted-foreground hover:text-foreground"
                >
                  Sign in
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
