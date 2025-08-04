"use client";

import { Header } from '@/components/header';
import { SmartEstimatorProgress } from '@/components/smart-estimator-progress';
import { usePathname } from 'next/navigation';

export default function SmartEstimatorLayout({
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
          {showProgress && <SmartEstimatorProgress />}
          <div className={showProgress ? "mt-8" : ""}>{children}</div>
        </div>
      </main>
    </div>
  );
}
