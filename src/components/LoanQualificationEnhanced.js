'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PlaidLink from './PlaidLink';
import { 
  setStepCompleted, 
  getStepStatus, 
  isStepCompleted, 
  storePlaidData, 
  generateResultsUrl, 
  storeCreditData 
} from '@/lib/session-store';
import { getTokenClient } from '@/lib/client-token-store';

/**
 * Step-based LoanQualification Component with session storage
 */
export default function LoanQualificationEnhanced({ userId, onComplete }) {
  const router = useRouter();
  const [stepStatus, setStepStatus] = useState({});
  const [isProcessing, setIsProcessing] = useState({});

  // Load step status from session
  useEffect(() => {
    setStepStatus(getStepStatus());
  }, []);

  // Bank connection handler
  const handleBankConnected = async (metadata) => {
    console.log('[LoanQualification] Bank connected:', metadata);
    setIsProcessing({ ...isProcessing, bank_connection: true });

    try {
      // Get client token for API calls
      const clientToken = getTokenClient(userId);
      
      // Fetch accounts and transactions
      const [accountsResponse, transactionsResponse] = await Promise.all([
        fetch('/api/plaid/accounts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, clientToken }),
        }),
        fetch('/api/plaid/transactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, clientToken }),
        })
      ]);

      const accountsData = await accountsResponse.json();
      const transactionsData = await transactionsResponse.json();

      // Store complete Plaid data in session
      const plaidData = {
        connectionMetadata: metadata,
        accounts: accountsData,
        transactions: transactionsData,
        fetchedAt: new Date().toISOString()
      };

      storePlaidData(userId, plaidData);
      
      // Update local state
      const newStepStatus = getStepStatus();
      setStepStatus(newStepStatus);
      
      // Call onComplete callback if provided
      if (onComplete) {
        onComplete(metadata);
      }
    } catch (error) {
      console.error('[LoanQualification] Error storing Plaid data:', error);
    } finally {
      setIsProcessing({ ...isProcessing, bank_connection: false });
    }
  };

  // Credit check handler (placeholder)
  const handleCreditCheck = () => {
    setIsProcessing({ ...isProcessing, credit_check: true });
    
    // Simulate credit check process
    setTimeout(() => {
      const mockCreditData = {
        score: 720,
        accounts: ['Credit Card 1', 'Credit Card 2'],
        totalDebt: 15000
      };
      storeCreditData(userId, mockCreditData);
      setStepStatus(getStepStatus());
      setIsProcessing({ ...isProcessing, credit_check: false });
    }, 2000);
  };





  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Ready to see your plan? Connect your accounts below to get started.
        </h1>
        <p className="text-lg text-gray-600 mt-2">
          Get instant approval decision in 3 simple steps
        </p>
      </div>

      <div className="rounded-xl p-6 border border-border mb-8">
        <h3 className="text-lg font-semibold text-foreground mb-4">How It Works</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {/* Step 1: Bank Account Access */}
          <div className="rounded-lg p-4 border border-border relative min-h-[180px] flex flex-col">
            <div className="absolute -top-3 -left-3 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm z-10">
              {stepStatus.bank_connection?.completed ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                '1'
              )}
            </div>
            <h4 className="font-semibold text-foreground mb-2 pr-4">Bank Account Access</h4>
            <p className="text-sm text-muted-foreground mb-4 flex-grow">
              Verify your income and expenses to calculate an affordable monthly payment
            </p>
            
            {/* Action Area */}
            <div className="mt-auto">
              {stepStatus.bank_connection?.completed ? (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-green-700 font-medium text-sm">Bank Connected</span>
                  </div>
                  <button
                    onClick={() => router.push(`/results/bank?session=${Date.now()}`)}
                    className="text-blue-600 hover:text-blue-800 font-medium underline text-sm"
                  >
                    View Results →
                  </button>
                </div>
              ) : isProcessing.bank_connection ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-blue-600 text-sm">Processing...</span>
                </div>
              ) : (
                <PlaidLink
                  userId={userId}
                  onSuccess={handleBankConnected}
                  buttonText="Connect Bank Account"
                  className="w-full h-10"
                />
              )}
            </div>
          </div>

          {/* Step 2: Credit Check */}
          <div className="rounded-lg p-4 border border-border relative min-h-[180px] flex flex-col">
            <div className="absolute -top-3 -left-3 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm z-10">
              {stepStatus.credit_check?.completed ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                '2'
              )}
            </div>
            <h4 className="font-semibold text-foreground mb-2 pr-4">Credit Check</h4>
            <p className="text-sm text-muted-foreground mb-4 flex-grow">
              Review your current debts to determine which accounts qualify for settlement
            </p>
            
            {/* Action Area */}
            <div className="mt-auto">
              {stepStatus.credit_check?.completed ? (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-green-700 font-medium text-sm">Credit Check Complete</span>
                  </div>
                  <button
                    onClick={() => router.push(`/results/credit?session=${Date.now()}`)}
                    className="text-blue-600 hover:text-blue-800 font-medium underline text-sm"
                  >
                    View Results →
                  </button>
                </div>
              ) : isProcessing.credit_check ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-blue-600 text-sm">Processing...</span>
                </div>
              ) : (
                <button
                  onClick={handleCreditCheck}
                  className="w-full h-10 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-200 text-sm flex items-center justify-center"
                >
                  Start Credit Check
                </button>
              )}
            </div>
          </div>

          {/* Step 3: Instant Results */}
          <div className="rounded-lg p-4 border border-border relative min-h-[180px] flex flex-col">
            <div className="absolute -top-3 -left-3 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm z-10">
              {stepStatus.plan_generation?.completed ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                '3'
              )}
            </div>
            <h4 className="font-semibold text-foreground mb-2 pr-4">Instant Results</h4>
            <p className="text-sm text-muted-foreground mb-4 flex-grow">
              Get your customized plan with real payment amounts and projected timelines
            </p>
            
            {/* Action Area */}
            <div className="mt-auto">
              {stepStatus.plan_generation?.completed ? (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-green-700 font-medium text-sm">Plan Generated</span>
                  </div>
                  <button
                    onClick={() => router.push(`/your-plan?session=${Date.now()}`)}
                    className="text-blue-600 hover:text-blue-800 font-medium underline text-sm"
                  >
                    View Results →
                  </button>
                </div>
              ) : isProcessing.plan_generation ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-blue-600 text-sm">Processing...</span>
                </div>
              ) : (
                <button
                  disabled={!stepStatus.bank_connection?.completed || !stepStatus.credit_check?.completed}
                  className={`w-full h-10 px-4 font-semibold rounded-lg transition-all duration-200 text-sm flex items-center justify-center ${
                    stepStatus.bank_connection?.completed && stepStatus.credit_check?.completed
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {stepStatus.bank_connection?.completed && stepStatus.credit_check?.completed
                    ? 'Generate Plan'
                    : 'Complete Steps 1 & 2'
                  }
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
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
}