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

export function Header() {
  return (
    <header className="sticky top-0 z-10 w-full border-b bg-background/95 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Logo />
        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          <Link
            href="/how-it-works"
            className="transition-colors hover:text-foreground/80 text-foreground/60"
          >
            How it works
          </Link>
          <Link
            href="/apply"
            className="transition-colors hover:text-foreground/80 text-foreground/60"
          >
            Apply
          </Link>
        </nav>
        <div className="flex items-center gap-4">
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
                    <Logo />
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
                  href="/apply"
                  className="flex items-center gap-2 text-lg font-semibold text-muted-foreground hover:text-foreground"
                >
                  Apply
                </Link>
                <Link
                  href="/smart-estimator/step-1"
                  className="flex items-center gap-2 text-lg font-semibold text-muted-foreground hover:text-foreground"
                >
                  Estimator
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
