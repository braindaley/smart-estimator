'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/header';
import Image from 'next/image';
import { useEstimatorStore } from '@/lib/estimator-store';

export default function Home() {
  const [zipCode, setZipCode] = useState('92660');
  const [zipError, setZipError] = useState('');
  const router = useRouter();
  const setFormData = useEstimatorStore((state) => state.setFormData);

  const handleStartEstimator = () => {
    // Validate zip code
    if (!zipCode) {
      setZipError('Zip code is required');
      return;
    }
    
    // Validate exactly 5 digits
    const zipRegex = /^\d{5}$/;
    if (!zipRegex.test(zipCode)) {
      setZipError('Please enter exactly 5 digits');
      return;
    }

    // Clear any errors
    setZipError('');
    
    // Store zip code in the estimator store
    setFormData('step-0', { zipCode });
    
    // Navigate to step 1
    router.push('/smart-estimator/step-1');
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-1 items-center gap-12 py-12 md:grid-cols-2 md:py-24">
            <div className="flex flex-col items-start text-left">
              <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
                Momentum changes everything
              </h1>
              <p className="mb-8 text-lg text-muted-foreground sm:text-xl">
                Get in. Get out. Get on with life.
              </p>
              <div className="flex w-full flex-col items-start gap-4">
                <p className="text-sm text-muted-foreground">
                  Start your debt-free plan. Takes 2 minutes.
                </p>
                <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-start">
                  <div className="flex flex-col">
                    <Input
                      type="text"
                      placeholder="Enter zip code"
                      value={zipCode}
                      onChange={(e) => {
                        // Only allow numbers and max 5 characters
                        const value = e.target.value.replace(/\D/g, '').slice(0, 5);
                        setZipCode(value);
                        setZipError('');
                      }}
                      maxLength={5}
                      pattern="\d{5}"
                      inputMode="numeric"
                      className="w-full sm:w-48"
                      aria-label="Zip code"
                      required
                    />
                    {zipError && (
                      <span className="mt-1 text-sm text-red-600">{zipError}</span>
                    )}
                  </div>
                  <Button onClick={handleStartEstimator} size="lg">
                    Smart Estimator
                  </Button>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <Image
                src="https://placehold.co/600x400.png"
                alt="Placeholder image with blue lines"
                width={600}
                height={400}
                className="rounded-lg"
                data-ai-hint="abstract lines"
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
