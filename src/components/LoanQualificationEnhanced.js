'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PlaidLink from './PlaidLink';
import CreditCheckForm from './CreditCheckForm';
import PhoneVerificationModal from './PhoneVerificationModal';
import {
  setStepCompleted,
  getStepStatus,
  isStepCompleted,
  storePlaidData,
  generateResultsUrl,
  storeCreditData,
  storePhoneData
} from '@/lib/session-store';
import { getTokenClient } from '@/lib/client-token-store';

/**
 * Step-based LoanQualification Component with session storage
 */
export default function LoanQualificationEnhanced({ userId, onComplete }) {
  const router = useRouter();
  const [stepStatus, setStepStatus] = useState({});
  const [isProcessing, setIsProcessing] = useState({});
  const [stepStatusLoaded, setStepStatusLoaded] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);

  // Load step status from session and refresh periodically to catch persona changes
  useEffect(() => {
    const refreshStepStatus = () => {
      const currentStepStatus = getStepStatus();
      console.log('[LoanQualification] Step status loaded:', {
        phoneCompleted: !!currentStepStatus.phone_verification?.completed,
        bankCompleted: !!currentStepStatus.bank_connection?.completed,
        creditCompleted: !!currentStepStatus.credit_check?.completed
      });
      setStepStatus(currentStepStatus);
      setStepStatusLoaded(true);
    };

    refreshStepStatus();

    // Set up an interval to refresh step status (to catch persona changes)
    const interval = setInterval(refreshStepStatus, 1000);

    // Also listen for storage changes (when personas are applied)
    const handleStorageChange = (e) => {
      if (e.key === 'user_steps' || e.key?.includes('selected_persona')) {
        refreshStepStatus();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Check if phone verification is needed and show modal
  useEffect(() => {
    if (stepStatusLoaded && !stepStatus.phone_verification?.completed) {
      setShowPhoneModal(true);
    }
  }, [stepStatusLoaded, stepStatus.phone_verification?.completed]);

  // Bank connection handler
  const handleBankConnected = async (metadata) => {
    console.log('🏦 [LoanQualification] Bank connected - STARTING DATA FETCH:', metadata);
    setIsProcessing({ ...isProcessing, bank_connection: true });

    try {
      // Get client token for API calls
      let clientToken = getTokenClient(userId);

      // For sandbox testing with income users, create a real sandbox access token
      if (metadata.access_token === 'mock_token_for_sandbox') {
        console.log('[LoanQualification] Creating sandbox access token for income testing');

        // Use Plaid's sandbox mode to create an access token directly
        try {
          const sandboxResponse = await fetch('/api/plaid/sandbox/create-test-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId,
              institutionId: metadata.institution.institution_id,
              testUsername: 'user_bank_income'
            }),
          });

          if (sandboxResponse.ok) {
            const sandboxData = await sandboxResponse.json();
            clientToken = sandboxData.access_token;
            console.log('[LoanQualification] Successfully created sandbox access token');
          } else {
            console.error('[LoanQualification] Failed to create sandbox token, using fallback');
            // Use a known working token for Plaid sandbox
            clientToken = 'access-sandbox-de3ce8ef-33f8-452c-a685-8671031fc0f6';
          }
        } catch (err) {
          console.error('[LoanQualification] Error creating sandbox token:', err);
          clientToken = 'access-sandbox-de3ce8ef-33f8-452c-a685-8671031fc0f6';
        }
      }
      
      // Fetch all Plaid data - accounts, transactions, identity, liabilities, and income
      const [accountsResponse, transactionsResponse, identityResponse, liabilitiesResponse, incomeResponse] = await Promise.all([
        fetch('/api/plaid/accounts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, clientToken }),
        }),
        fetch('/api/plaid/transactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, clientToken }),
        }),
        fetch('/api/plaid/identity', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, clientToken }),
        }),
        fetch('/api/plaid/liabilities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, clientToken }),
        }),
        fetch('/api/plaid/income', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, clientToken }),
        })
      ]);

      const accountsData = await accountsResponse.json();
      const transactionsData = await transactionsResponse.json();

      // Handle optional data that may not be available for all accounts
      let identityData = null;
      let liabilitiesData = null;
      let incomeData = null;

      if (identityResponse.ok) {
        identityData = await identityResponse.json();
      } else {
        console.log('[LoanQualification] Identity data not available');
      }

      if (liabilitiesResponse.ok) {
        liabilitiesData = await liabilitiesResponse.json();
      } else {
        console.log('[LoanQualification] Liabilities data not available');
      }

      if (incomeResponse.ok) {
        incomeData = await incomeResponse.json();
        console.log('[LoanQualification] Income data fetched successfully');

        // If income data is null/empty, try to simulate income data for sandbox testing
        if (!incomeData || !incomeData.income_streams || incomeData.income_streams.length === 0) {
          console.log('[LoanQualification] Income data is empty, trying sandbox simulation');

          try {
            const simulateResponse = await fetch('/api/plaid/sandbox/simulate-income', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                accessToken: clientToken,
                itemId: metadata.item_id
              }),
            });

            if (simulateResponse.ok) {
              const simulateData = await simulateResponse.json();
              if (simulateData.income) {
                incomeData = simulateData;
                console.log('[LoanQualification] Income data simulation successful');
              }
            }
          } catch (err) {
            console.error('[LoanQualification] Income simulation failed:', err);
          }
        }
      } else {
        console.log('[LoanQualification] Income data not available');
      }

      // Store complete Plaid data in session
      const plaidData = {
        connectionMetadata: metadata,
        accounts: accountsData,
        transactions: transactionsData,
        identity: identityData,
        liabilities: liabilitiesData,
        income: incomeData,
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

  // Credit check handler
  const handleCreditCheck = (creditData) => {
    console.log('[LoanQualification] Credit check completed:', creditData);

    // Store credit data in session
    storeCreditData(userId, creditData);

    // Update local state
    const newStepStatus = getStepStatus();
    setStepStatus(newStepStatus);

    // Call onComplete callback if provided
    if (onComplete) {
      onComplete(creditData);
    }
  };

  // Phone verification handler
  const handlePhoneVerified = (phoneData) => {
    console.log('[LoanQualification] Phone verified:', phoneData);

    // Store phone data in session
    storePhoneData(userId, phoneData);

    // Update local state
    const newStepStatus = getStepStatus();
    setStepStatus(newStepStatus);

    // Close the modal
    setShowPhoneModal(false);

    // Call onComplete callback if provided
    if (onComplete) {
      onComplete(phoneData);
    }
  };

  // Reset all steps handler
  const handleResetAllSteps = () => {
    if (confirm('Are you sure you want to reset all progress and start over?')) {
      // Clear all localStorage data
      localStorage.removeItem('user_steps');
      localStorage.removeItem('plaid_data');
      localStorage.removeItem('credit_data');
      localStorage.removeItem('phone_data');

      // Clear user-specific data
      if (userId) {
        localStorage.removeItem(`credit_data_${userId}`);
        localStorage.removeItem(`plaid_data_${userId}`);
        localStorage.removeItem(`phone_data_${userId}`);
      }

      // Reload the page to reset all states
      window.location.reload();
    }
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
        <div className="grid md:grid-cols-3 gap-4 mb-6">
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
                    disabled={!stepStatusLoaded || !stepStatus.phone_verification?.completed}
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
                <CreditCheckForm
                  userId={userId}
                  onSuccess={handleCreditCheck}
                  buttonText="Start Credit Check"
                  className="w-full h-10"
                  disabled={!stepStatusLoaded || !stepStatus.phone_verification?.completed || !stepStatus.bank_connection?.completed}
                />
              )}
            </div>
          </div>

          {/* Step 3: Instant Results */}
          <div className="rounded-lg p-4 border border-border relative min-h-[180px] flex flex-col">
            <div className="absolute -top-3 -left-3 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-sm z-10">
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
                    onClick={() => router.push(`/your-plan/results?session=${Date.now()}`)}
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
                  disabled={!stepStatus.phone_verification?.completed || !stepStatus.bank_connection?.completed || !stepStatus.credit_check?.completed}
                  onClick={() => {
                    if (stepStatus.phone_verification?.completed && stepStatus.bank_connection?.completed && stepStatus.credit_check?.completed) {
                      router.push('/your-plan/results');
                    }
                  }}
                  className={`w-full h-10 px-6 py-3 font-semibold rounded-lg transition-all duration-200 text-sm flex items-center justify-center ${
                    stepStatus.phone_verification?.completed && stepStatus.bank_connection?.completed && stepStatus.credit_check?.completed
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {stepStatus.phone_verification?.completed && stepStatus.bank_connection?.completed && stepStatus.credit_check?.completed
                    ? 'Generate Plan'
                    : 'Complete Steps Above'
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

      {/* Reset Link */}
      <div className="text-center mt-8 pt-6 border-t border-border">
        <button
          onClick={handleResetAllSteps}
          className="text-sm text-muted-foreground hover:text-foreground underline transition-colors"
        >
          Reset All Progress & Start Over
        </button>
      </div>

      {/* Phone Verification Modal */}
      <PhoneVerificationModal
        isOpen={showPhoneModal}
        onSuccess={handlePhoneVerified}
        onClose={() => setShowPhoneModal(false)}
        userId={userId}
      />
    </div>
  );
}