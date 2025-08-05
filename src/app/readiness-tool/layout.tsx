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
  const showProgress = !pathname.includes('/results');

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 py-8">
        <div className="container mx-auto max-w-3xl px-4">
          {showProgress && <ReadinessToolProgress />}
          <div className={showProgress ? "mt-8" : ""}>{children}</div>
        </div>
      </main>
    </div>
  );
}
