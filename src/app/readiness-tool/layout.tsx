"use client";

import { Header } from '@/components/header';
import { ReadinessToolProgress } from '@/components/readiness-tool-progress';
import { usePathname } from 'next/navigation';

export default function ReadinessToolLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isStepPage = /^\/readiness-tool\/step-\d+$/.test(pathname);
  const isResultsPage = pathname.includes('/results');

  // Apply the narrow layout only to step pages
  if (isStepPage) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex-1 py-8">
          <div className="container mx-auto max-w-3xl px-4">
            <ReadinessToolProgress />
            <div className="mt-8">{children}</div>
          </div>
        </main>
      </div>
    );
  }

  // Results page gets full width layout
  if (isResultsPage) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex-1 py-8">
          <div className="container mx-auto px-4">
            {children}
          </div>
        </main>
      </div>
    );
  }

  // For the main /readiness-tool page, render children directly without the narrow container
  return (
    <>
      {children}
    </>
  );
}
