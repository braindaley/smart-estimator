import { Header } from '@/components/header';
import { SmartEstimatorProgress } from '@/components/smart-estimator-progress';

export default function SmartEstimatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 py-8">
        <div className="container mx-auto max-w-3xl px-4">
          <SmartEstimatorProgress />
          <div className="mt-8">{children}</div>
        </div>
      </main>
    </div>
  );
}
