'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
import { useSmartEstimatorLink } from '@/hooks/useSmartEstimatorLink';
import { useReadinessToolLink } from '@/hooks/useReadinessToolLink';
import { useEffect, useState } from 'react';

export function Header() {
  const router = useRouter();
  const smartEstimatorLink = useSmartEstimatorLink();
  const readinessToolLink = useReadinessToolLink();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // This effect runs only on the client, after the component mounts
    setIsClient(true);
  }, []);

  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const MobileNav = () => (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
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
          <button
            onClick={() => {
              setIsSheetOpen(false);
              setTimeout(() => router.push('/'), 150);
            }}
            className="flex items-center gap-2 text-lg font-semibold text-muted-foreground hover:text-foreground text-left"
          >
            Home
          </button>
          <button
            onClick={() => {
              setIsSheetOpen(false);
              setTimeout(() => router.push('/how-it-works'), 150);
            }}
            className="flex items-center gap-2 text-lg font-semibold text-muted-foreground hover:text-foreground text-left"
          >
            How it works
          </button>
          <button
            onClick={() => {
              setIsSheetOpen(false);
              setTimeout(() => router.push(smartEstimatorLink), 150);
            }}
            className="flex items-center gap-2 text-lg font-semibold text-muted-foreground hover:text-foreground text-left"
          >
            Smart Estimator
          </button>
          <button
            onClick={() => {
              setIsSheetOpen(false);
              setTimeout(() => router.push(readinessToolLink), 150);
            }}
            className="flex items-center gap-2 text-lg font-semibold text-muted-foreground hover:text-foreground text-left"
          >
            Readiness Tool
          </button>
          <button
            onClick={() => {
              setIsSheetOpen(false);
              setTimeout(() => router.push('/your-plan'), 150);
            }}
            className="flex items-center gap-2 text-lg font-semibold text-muted-foreground hover:text-foreground text-left"
          >
            Your Plan
          </button>
          <button
            onClick={() => {
              setIsSheetOpen(false);
              setTimeout(() => router.push('/login'), 150);
            }}
            className="flex items-center gap-2 text-lg font-semibold text-muted-foreground hover:text-foreground text-left"
          >
            Sign in
          </button>
          <button
            onClick={() => {
              setIsSheetOpen(false);
              setTimeout(() => router.push('/admin'), 150);
            }}
            className="flex items-center gap-2 text-lg font-semibold text-muted-foreground hover:text-foreground text-left"
          >
            Admin
          </button>
        </nav>
      </SheetContent>
    </Sheet>
  );

  const DesktopNav = () => (
    <>
      <nav className="hidden absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 items-center gap-6 text-sm font-medium md:flex">
        <Link
          href="/how-it-works"
          className="transition-colors hover:text-foreground/80 text-foreground/60"
        >
          How it works
        </Link>
        <Link
          href={smartEstimatorLink}
          className="transition-colors hover:text-foreground/80 text-foreground/60"
        >
          Get Started
        </Link>
      </nav>
      <div className="flex items-center gap-4">
        <Button variant="ghost" asChild className="hidden lg:flex">
          <Link href="/login">Sign in</Link>
        </Button>
        <MobileNav />
      </div>
    </>
  );

  const NavPlaceholder = () => (
    <>
      <nav className="hidden absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 items-center gap-6 text-sm font-medium md:flex">
        <div className="h-6 w-24 rounded-md bg-muted animate-pulse" />
        <div className="h-6 w-24 rounded-md bg-muted animate-pulse" />
      </nav>
      <div className="flex items-center gap-4">
        <div className="hidden h-10 w-20 rounded-md bg-muted animate-pulse lg:block" />
        <div className="h-10 w-10 rounded-md bg-muted animate-pulse" />
      </div>
    </>
  );

  return (
    <header className="sticky top-0 z-10 w-full border-b bg-background/95 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 relative">
        <Link href="/">
          <Logo />
        </Link>
        {/* Add suppressHydrationWarning to prevent hydration mismatch error */}
        <div suppressHydrationWarning={true}>
          {isClient ? <DesktopNav /> : <NavPlaceholder />}
        </div>
      </div>
    </header>
  );
}