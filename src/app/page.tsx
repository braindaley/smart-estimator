'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/header';
import Image from 'next/image';
import { useEstimatorStore } from '@/lib/estimator-store';
import { useSmartEstimatorLink } from '@/hooks/useSmartEstimatorLink';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Play, TrendingDown, DollarSign, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const defaultVideos = [
  {
    persona: {
      startingDebt: "$45,000",
      momentumDebt: "$18,000",
      reasonForHardship: "Job loss",
      timeToPayoff: "24 months"
    }
  },
  {
    persona: {
      startingDebt: "$62,000",
      momentumDebt: "$25,000",
      reasonForHardship: "Medical bills",
      timeToPayoff: "30 months"
    }
  },
  {
    persona: {
      startingDebt: "$38,500",
      momentumDebt: "$15,200",
      reasonForHardship: "Divorce",
      timeToPayoff: "18 months"
    }
  },
  {
    persona: {
      startingDebt: "$71,800",
      momentumDebt: "$28,700",
      reasonForHardship: "Business closure",
      timeToPayoff: "36 months"
    }
  }
];

export default function Home() {
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
        <div className="container mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-1 items-center gap-12 py-12 md:grid-cols-2 md:py-24">
            <div className="flex flex-col items-start text-left">
              <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
                Start your debt-free plan
              </h1>
              <p className="mb-8 text-lg text-muted-foreground sm:text-xl">
                Momentum changes everything.
              </p>
              <div className="flex w-full flex-col items-start gap-4">
                <p className="text-sm text-muted-foreground">
                  No calls, no paperwork. Only takes 3 minutes
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
                    Get started
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

        {/* Benefits Section */}
        <section className="py-10 bg-background">
          <div className="container mx-auto max-w-7xl px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">How we help you succeed</h2>
              <p className="text-lg text-muted-foreground">
                Our proven approach delivers real results for your financial future
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="border border-border shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-primary/10 rounded-full">
                      <TrendingDown className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Lower Monthly Payment</h3>
                  <p className="text-muted-foreground">
                    Reduce your monthly obligations and free up cash for other priorities
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border border-border shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-primary/10 rounded-full">
                      <DollarSign className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Reduce Total Debt</h3>
                  <p className="text-muted-foreground">
                    Negotiate settlements that significantly reduce what you owe
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border border-border shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-primary/10 rounded-full">
                      <Clock className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Pay Off Faster</h3>
                  <p className="text-muted-foreground">
                    Get out of debt years sooner with our strategic approach
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Recommended Videos Section */}
        <section className="py-10">
          <div className="container mx-auto max-w-7xl px-4">
            <Card className="border-0 shadow-none">
              <CardHeader className="px-0 text-center">
                <h2 className="text-3xl font-bold text-center text-foreground mb-4">Who we can help</h2>
                <p className="text-lg text-muted-foreground">
                  Momentum helps people in many situations
                </p>
              </CardHeader>
              <CardContent className="px-0">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {defaultVideos.map((video, index) => (
                    <Card key={index} className="border-0 shadow-none">
                      <CardContent className="p-0">
                        <div className="aspect-[9/16] bg-muted rounded-lg flex items-center justify-center relative">
                          <Play className="h-12 w-12 text-muted-foreground" />
                          {/* Persona badges stacked in bottom left corner */}
                          <div className="absolute bottom-2 left-2 flex flex-col gap-1">
                            <Badge className="text-xs py-0.5 px-1.5 bg-gray-800 text-white hover:bg-gray-700">
                              Starting debt: {video.persona.startingDebt}
                            </Badge>
                            <Badge className="text-xs py-0.5 px-1.5 bg-gray-800 text-white hover:bg-gray-700">
                              Momentum debt: {video.persona.momentumDebt}
                            </Badge>
                            <Badge className="text-xs py-0.5 px-1.5 bg-gray-800 text-white hover:bg-gray-700">
                              {video.persona.reasonForHardship}
                            </Badge>
                            <Badge className="text-xs py-0.5 px-1.5 bg-gray-800 text-white hover:bg-gray-700">
                              {video.persona.timeToPayoff}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
        
        {/* FAQ Section */}
        <section className="bg-muted/50 py-10">
          <div className="container mx-auto max-w-4xl px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">FAQ</h2>
              <p className="text-lg text-muted-foreground">
                Common questions about debt settlement and our process
              </p>
            </div>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>What is debt settlement?</AccordionTrigger>
                <AccordionContent>
                  Debt settlement is a process where you negotiate with creditors to pay less than what you owe. It can help reduce your total debt burden, but it may impact your credit score and have tax implications.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-2">
                <AccordionTrigger>How long does debt settlement take?</AccordionTrigger>
                <AccordionContent>
                  Debt settlement typically takes 2-4 years to complete, depending on your financial situation, the amount of debt, and how quickly you can save funds for settlement offers.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-3">
                <AccordionTrigger>Will debt settlement hurt my credit score?</AccordionTrigger>
                <AccordionContent>
                  Yes, debt settlement can negatively impact your credit score initially. However, many people find that their credit improves over time as they eliminate debt and establish better financial habits.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-4">
                <AccordionTrigger>What types of debt can be settled?</AccordionTrigger>
                <AccordionContent>
                  Most unsecured debts can be settled, including credit cards, medical bills, personal loans, and store cards. Secured debts like mortgages and car loans typically cannot be settled.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-5">
                <AccordionTrigger>How much can I save with debt settlement?</AccordionTrigger>
                <AccordionContent>
                  Savings vary widely, but many people settle their debts for 40-60% of the original balance. The exact amount depends on your creditors, financial hardship, and negotiation skills.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-6">
                <AccordionTrigger>Are there tax consequences to debt settlement?</AccordionTrigger>
                <AccordionContent>
                  Yes, forgiven debt over $600 is typically considered taxable income by the IRS. You'll receive a 1099-C form for any settled debt, and you should consult with a tax professional about your specific situation.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-7">
                <AccordionTrigger>Can I settle debts on my own?</AccordionTrigger>
                <AccordionContent>
                  Yes, you can negotiate with creditors yourself. This approach saves on fees but requires time, knowledge of negotiation tactics, and the ability to handle potentially difficult conversations with creditors.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-8">
                <AccordionTrigger>What should I do before considering debt settlement?</AccordionTrigger>
                <AccordionContent>
                  Before debt settlement, try budgeting, debt consolidation, or contacting creditors for payment plans. Consider credit counseling from a nonprofit agency. Debt settlement should typically be a last resort before bankruptcy.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>
        
        {/* About Section */}
        <section className="py-12 bg-background">
          <div className="container mx-auto max-w-6xl px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-6">About Momentum</h2>
                <ul className="space-y-3 list-disc list-inside">
                  <li className="font-semibold text-foreground">Faster and more accurate process</li>
                  <li className="font-semibold text-foreground">Personalized and data driven</li>
                  <li className="font-semibold text-foreground">Transparent and trustworthy</li>
                  <li className="font-semibold text-foreground">Shorter program length</li>
                  <li className="font-semibold text-foreground">Lower cost to customer</li>
                </ul>
              </div>
              <div className="flex items-center justify-center">
                <Image
                  src="https://placehold.co/500x400.png"
                  alt="Financial success illustration"
                  width={500}
                  height={400}
                  className="rounded-lg"
                  data-ai-hint="financial charts and graphs"
                />
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
