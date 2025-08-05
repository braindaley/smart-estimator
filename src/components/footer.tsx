import Link from 'next/link';
import { Logo } from '@/components/logo';

export function Footer() {
  return (
    <footer className="bg-muted text-muted-foreground">
      <div className="container mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 mb-8 md:col-span-1 md:mb-0">
            <Link href="/" className="inline-block">
              <Logo />
            </Link>
            <p className="mt-4 text-sm">
              Get in. Get out. Get on with life.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Solutions</h3>
            <ul className="mt-4 space-y-2">
              <li><Link href="/smart-estimator/step-1" className="hover:text-foreground">Smart Estimator</Link></li>
              <li><Link href="/readiness-tool" className="hover:text-foreground">Readiness Tool</Link></li>
              <li><Link href="/customize-plan" className="hover:text-foreground">Customize Plan</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Company</h3>
            <ul className="mt-4 space-y-2">
              <li><Link href="/how-it-works" className="hover:text-foreground">How It Works</Link></li>
              <li><Link href="/contact-us" className="hover:text-foreground">Contact Us</Link></li>
              <li><Link href="/login" className="hover:text-foreground">Sign In</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-border pt-8 flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-sm">© {new Date().getFullYear()} Momentum. All rights reserved.</p>
            <div className="flex gap-4 text-sm">
                <Link href="#" className="hover:text-foreground">Privacy Policy</Link>
                <Link href="#" className="hover:text-foreground">Terms of Service</Link>
                <Link href="#" className="hover:text-foreground">Accessibility</Link>
            </div>
        </div>
      </div>
    </footer>
  );
}
