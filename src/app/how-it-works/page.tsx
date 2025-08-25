'use client';

import { useState } from 'react';
import { Header } from '@/components/header';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { useEstimatorStore } from '@/lib/estimator-store';
import { useSmartEstimatorLink } from '@/hooks/useSmartEstimatorLink';
import { CheckCircle, Calculator, Shield, TrendingUp, DollarSign, Users, ArrowRight, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

export default function HowItWorks() {
  const [zipCode, setZipCode] = useState('92660');
  const [zipError, setZipError] = useState('');
  const router = useRouter();
  const setFormData = useEstimatorStore((state) => state.setFormData);
  const smartEstimatorLink = useSmartEstimatorLink();

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
    
    // Navigate to appropriate smart estimator page
    router.push(smartEstimatorLink);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/* Hero Section - Full Image Banner */}
        <section className="relative h-96 bg-gray-100">
          <Image
            src="https://placehold.co/1200x400.png"
            alt="Momentum changes everything banner"
            fill
            className="object-cover"
            data-ai-hint="financial growth and success"
          />
          <div className="absolute inset-0 bg-black/40">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="container mx-auto max-w-4xl px-4 text-center text-white">
                <h1 className="text-4xl font-bold mb-4 sm:text-5xl lg:text-6xl">
                  Momentum Changes Everything
                </h1>
                <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
                  Personalized plans to improve your quality of life
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Main Process Section */}
        <section className="py-10">
          <div className="container mx-auto max-w-7xl px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-foreground mb-4">See if Momentum is right for you</h2>
              <p className="text-lg text-muted-foreground">
                Get your personalized debt settlement plan in just 3 simple steps
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              {/* Step 1 */}
              <Card className="text-center border-2 hover:border-primary/20 transition-colors">
                <CardContent className="p-8">
                  <h3 className="text-xl font-semibold text-foreground mb-3">Smart Estimator</h3>
                  <p className="text-muted-foreground mb-4">
                    Answer quick questions about your debt situation for accurate savings estimates.
                  </p>
                  <div className="text-sm text-primary font-medium">
                    Takes 2-3 minutes
                  </div>
                </CardContent>
              </Card>

              {/* Step 2 */}
              <Card className="text-center border-2 hover:border-primary/20 transition-colors">
                <CardContent className="p-8">
                  <h3 className="text-xl font-semibold text-foreground mb-3">Readiness Assessment</h3>
                  <p className="text-muted-foreground mb-4">
                    Complete our readiness quiz to determine if debt settlement is right for you.
                  </p>
                  <div className="text-sm text-primary font-medium">
                    Takes 1-2 minutes
                  </div>
                </CardContent>
              </Card>

              {/* Step 3 */}
              <Card className="text-center border-2 hover:border-primary/20 transition-colors">
                <CardContent className="p-8">
                  <h3 className="text-xl font-semibold text-foreground mb-3">Get Your Plan</h3>
                  <p className="text-muted-foreground mb-4">
                    Review your personalized debt settlement plan with savings projections.
                  </p>
                  <div className="text-sm text-primary font-medium">
                    Instant results
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>


        {/* Why Choose Momentum */}
        <section className="py-10">
          <div className="container mx-auto max-w-6xl px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">Why Choose Momentum?</h2>
              <p className="text-lg text-muted-foreground">
                Our data-driven approach delivers better results than traditional debt settlement companies
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="text-center">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-2">Faster Results</h3>
                  <p className="text-muted-foreground text-sm">
                    Shorter program length means you get out of debt sooner
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-2">Data-Driven</h3>
                  <p className="text-muted-foreground text-sm">
                    Personalized approach based on your actual financial data
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-2">Lower Costs</h3>
                  <p className="text-muted-foreground text-sm">
                    Transparent pricing with lower fees than traditional companies
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-2">Transparent</h3>
                  <p className="text-muted-foreground text-sm">
                    No hidden fees or surprise charges - know exactly what you'll pay
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-2">Expert Support</h3>
                  <p className="text-muted-foreground text-sm">
                    Dedicated team of debt settlement specialists guiding you
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-2">Proven Results</h3>
                  <p className="text-muted-foreground text-sm">
                    Thousands of families have successfully eliminated their debt with us
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-10 bg-primary/5">
          <div className="container mx-auto max-w-4xl px-4 text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Ready to start your debt-free journey?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Get your personalized debt settlement estimate in just 3 minutes. No calls, no paperwork required.
            </p>
            
            <div className="flex flex-col items-center gap-4 max-w-md mx-auto">
              <p className="text-sm text-muted-foreground">
                Enter your zip code to get started
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
                <Button onClick={handleStartEstimator} size="lg" className="group">
                  Get My Estimate
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
              <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground mt-4">
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  Free estimate
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  No commitments
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  Takes 3 minutes
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
