"use client";

import * as React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StepNavigation } from '@/components/step-navigation';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useEstimatorStore } from '@/lib/estimator-store';
import { useRouter } from 'next/navigation';

const FormSchema = z.object({
  monthlyIncomeEstimate: z.preprocess(
    (val) => (typeof val === 'string' ? val.replace(/[$,]/g, '') : val),
    z.coerce.number({ invalid_type_error: 'Please enter a valid number.' }).positive({ message: 'Please enter a positive number.' })
  )
});

type FormData = z.infer<typeof FormSchema>;

export default function Step3() {
  const { formData, setFormData } = useEstimatorStore();
  const router = useRouter();

  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: formData.step3 || { monthlyIncomeEstimate: '' },
  });

  const onSubmit = (data: FormData) => {
    setFormData('step3', data);
    router.push('/smart-estimator/step-4');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Step 3</CardTitle>
        <CardDescription>What is your estimated monthly income?</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent>
            <FormField
              control={form.control}
              name="monthlyIncomeEstimate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monthly Income</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">$</span>
                      <Input
                        {...field}
                        placeholder="0,000"
                        className="pl-7"
                        onChange={(e) => {
                          const value = e.target.value;
                          const numericValue = value.replace(/[^0-9]/g, '');
                          const formattedValue = new Intl.NumberFormat('en-US').format(Number(numericValue));
                          field.onChange(formattedValue === '0' ? '' : formattedValue);
                        }}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <StepNavigation currentStep={3} totalSteps={7} />
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
