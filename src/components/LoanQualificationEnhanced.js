'use client';

import { useState } from 'react';
import PlaidLink from './PlaidLink';
import PlaidDataDisplay from './PlaidDataDisplay';

/**
 * Enhanced LoanQualification Component with comprehensive error handling and UX improvements
 */
export default function LoanQualificationEnhanced({ userId, onComplete }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [connectionMetadata, setConnectionMetadata] = useState(null);

  // Simple bank connection handler
  const handleBankConnected = (metadata) => {
    console.log('[LoanQualification] Bank connected:', metadata);
    setConnectionMetadata(metadata);
    setCurrentStep(3); // Go directly to results/data display
    
    // Call onComplete callback if provided
    if (onComplete) {
      onComplete(metadata);
    }
  };




  // Render Step 1: Enhanced explanation
  const renderStep1 = () => (
    <div className="space-y-6 animate-fadeIn">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">
          Ready to see your plan? Connect your accounts below to get started.
        </h2>
        <p className="mt-2 text-lg text-gray-600">
          Get instant approval decision in 3 simple steps
        </p>
      </div>

      <div className="rounded-xl p-6 border border-border">
        <h3 className="text-lg font-semibold text-foreground mb-4">How It Works
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="rounded-lg p-4 border border-border">
            <h4 className="font-semibold text-foreground">Bank Account Access</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Verify your income and expenses to calculate an affordable monthly payment
            </p>
          </div>
          <div className="rounded-lg p-4 border border-border">
            <h4 className="font-semibold text-foreground">Credit Check</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Review your current debts to determine which accounts qualify for settlement
            </p>
          </div>
          <div className="rounded-lg p-4 border border-border">
            <h4 className="font-semibold text-foreground">Instant Results</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Get your customized plan with real payment amounts and projected timelines
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mt-8">
          <button
            onClick={() => setCurrentStep(2)}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-200"
          >
            Start Bank Connection
          </button>
          <button
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-200"
          >
            Start Credit Check
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-lg border border-border p-6">
          <h4 className="font-semibold text-foreground mb-3">What We Check</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Monthly income stability</li>
            <li>• Expense patterns</li>
            <li>• Cash flow consistency</li>
          </ul>
        </div>
        
        <div className="rounded-lg border border-border p-6">
          <h4 className="font-semibold text-foreground mb-3">Quick and Safe</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• No impact on credit score</li>
            <li>• 256-bit encryption</li>
            <li>• Results in 2 minutes</li>
          </ul>
        </div>
      </div>

      <div className="border border-border rounded-lg p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-foreground">Privacy Notice</h3>
            <p className="text-sm text-muted-foreground mt-1">
              We use read-only access and never store your banking credentials. Your data is processed securely and deleted after analysis.
            </p>
          </div>
        </div>
      </div>

    </div>
  );

  // Render Step 2: Simple bank connection
  const renderStep2 = () => (
    <div className="space-y-6 animate-fadeIn">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900">
          Connect Your Bank Account
        </h2>
        <p className="mt-2 text-lg text-gray-600">
          Securely link your account to view all your financial data
        </p>
      </div>

      <div className="rounded-lg border border-border p-6">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-green-900 mb-2">
              Bank-Level Security
            </h3>
            <ul className="space-y-2 text-sm text-green-700">
              <li className="flex items-center">
                <svg className="h-4 w-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                256-bit encryption protects your data
              </li>
              <li className="flex items-center">
                <svg className="h-4 w-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Read-only access - we can\'t make changes
              </li>
              <li className="flex items-center">
                <svg className="h-4 w-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Powered by Plaid, trusted by major banks
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center space-y-4">
        <PlaidLink
          userId={userId}
          onSuccess={handleBankConnected}
          className="w-full max-w-md"
          buttonText="Connect Bank Account"
        />
        
        <button
          onClick={() => setCurrentStep(1)}
          className="text-gray-600 hover:text-gray-800 text-sm font-medium flex items-center transition-colors"
        >
          <svg className="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to previous step
        </button>
      </div>
    </div>
  );

  // Render Step 3: Display Plaid Data
  const renderStep3 = () => {
    return <PlaidDataDisplay userId={userId} connectionMetadata={connectionMetadata} />;
  };

  if (currentStep === 3) {
    // Render PlaidDataDisplay without wrapper for full-width layout
    return renderStep3();
  }

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-in-out;
        }
      `}</style>
      
      <div className="rounded-xl border border-border p-6 sm:p-8">
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
      </div>
    </div>
  );
}