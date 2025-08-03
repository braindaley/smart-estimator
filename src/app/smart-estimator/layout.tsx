import { Logo } from '@/components/logo';
import { SmartEstimatorProgress } from '@/components/smart-estimator-progress';

export default function SmartEstimatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-10 w-full border-b bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 max-w-7xl items-center px-4">
          <Logo />
        </div>
      </header>
      <main className="flex-1 py-8">
        <div className="container mx-auto max-w-3xl px-4">
          <SmartEstimatorProgress />
          <div className="mt-8">{children}</div>
        </div>
      </main>
    </div>
  );
}
