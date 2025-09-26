'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PhoneVerificationStep from './steps/PhoneVerificationStep';
import CoApplicantDetectionStep from './steps/CoApplicantDetectionStep';
import PlaidLink from './PlaidLink';
import CreditCheckForm from './CreditCheckForm';
import PersonaSelector from './PersonaSelector';
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

const STEPS = [
  { id: 1, name: 'Phone Verification', key: 'phone_verification' },
  { id: 2, name: 'Co-Applicant', key: 'co_applicant_check' },
  { id: 3, name: 'Bank Connection', key: 'bank_connection' },
  { id: 4, name: 'Credit Check', key: 'credit_check' },
  { id: 5, name: 'Results', key: 'plan_generation' }
];

export default function MultiStepForm({ userId, onComplete }) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [stepData, setStepData] = useState({
    phoneVerified: false,
    hasCoApplicant: null,
    coApplicantInfo: null,
    bankConnected: false,
    creditChecked: false
  });
  const [stepStatus, setStepStatus] = useState({});
  const [isProcessing, setIsProcessing] = useState({});

  // Load existing step status
  useEffect(() => {
    const currentStepStatus = getStepStatus();
    setStepStatus(currentStepStatus);

    // Determine current step based on completion
    if (currentStepStatus.phone_verification?.completed &&
        currentStepStatus.co_applicant_check?.completed &&
        currentStepStatus.bank_connection?.completed &&
        currentStepStatus.credit_check?.completed) {
      setCurrentStep(5);
    } else if (currentStepStatus.phone_verification?.completed &&
               currentStepStatus.co_applicant_check?.completed &&
               currentStepStatus.bank_connection?.completed) {
      setCurrentStep(4);
    } else if (currentStepStatus.phone_verification?.completed &&
               currentStepStatus.co_applicant_check?.completed) {
      setCurrentStep(3);
    } else if (currentStepStatus.phone_verification?.completed) {
      setCurrentStep(2);
    } else {
      setCurrentStep(1);
    }
  }, []);

  const handlePhoneVerificationComplete = (phoneData) => {
    console.log('[MultiStepForm] Phone verification completed:', phoneData);

    // Store phone data
    storePhoneData(userId, phoneData);

    // Update local state
    const newStepStatus = getStepStatus();
    setStepStatus(newStepStatus);
    setStepData(prev => ({ ...prev, phoneVerified: true }));

    // Move to next step
    setCurrentStep(2);
  };

  const handleCoApplicantComplete = (coApplicantData) => {
    console.log('[MultiStepForm] Co-applicant detection completed:', coApplicantData);

    // Store co-applicant data
    setStepCompleted('co_applicant_check', true, coApplicantData);

    // Update local state
    const newStepStatus = getStepStatus();
    setStepStatus(newStepStatus);
    setStepData(prev => ({
      ...prev,
      hasCoApplicant: coApplicantData.hasCoApplicant,
      coApplicantInfo: coApplicantData.coApplicantInfo
    }));

    // Move to next step
    setCurrentStep(3);
  };

  const handleBankConnected = async (metadata) => {
    console.log('[MultiStepForm] Bank connected:', metadata);
    setIsProcessing({ ...isProcessing, bank_connection: true });

    try {
      // Get client token for API calls
      let clientToken = getTokenClient(userId);

      // Handle sandbox testing
      if (metadata.access_token === 'mock_token_for_sandbox') {
        console.log('[MultiStepForm] Creating sandbox access token for income testing');

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
            console.log('[MultiStepForm] Successfully created sandbox access token');
          } else {
            console.error('[MultiStepForm] Failed to create sandbox token, using fallback');
            clientToken = 'access-sandbox-de3ce8ef-33f8-452c-a685-8671031fc0f6';
          }
        } catch (err) {
          console.error('[MultiStepForm] Error creating sandbox token:', err);
          clientToken = 'access-sandbox-de3ce8ef-33f8-452c-a685-8671031fc0f6';
        }
      }

      // Fetch all Plaid data
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

      let identityData = null;
      let liabilitiesData = null;
      let incomeData = null;

      if (identityResponse.ok) {
        identityData = await identityResponse.json();
      }

      if (liabilitiesResponse.ok) {
        liabilitiesData = await liabilitiesResponse.json();
      }

      if (incomeResponse.ok) {
        incomeData = await incomeResponse.json();
        console.log('[MultiStepForm] Income data fetched successfully');

        if (!incomeData || !incomeData.income_streams || incomeData.income_streams.length === 0) {
          console.log('[MultiStepForm] Income data is empty, trying sandbox simulation');

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
                console.log('[MultiStepForm] Income data simulation successful');
              }
            }
          } catch (err) {
            console.error('[MultiStepForm] Income simulation failed:', err);
          }
        }
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
      setStepData(prev => ({ ...prev, bankConnected: true }));

      // Move to next step
      setCurrentStep(4);

      if (onComplete) {
        onComplete(metadata);
      }
    } catch (error) {
      console.error('[MultiStepForm] Error storing Plaid data:', error);
    } finally {
      setIsProcessing({ ...isProcessing, bank_connection: false });
    }
  };

  const handleCreditCheck = (creditData) => {
    console.log('[MultiStepForm] Credit check completed:', creditData);

    // Store credit data in session
    storeCreditData(userId, creditData);

    // Update local state
    const newStepStatus = getStepStatus();
    setStepStatus(newStepStatus);
    setStepData(prev => ({ ...prev, creditChecked: true }));

    // Move to results
    setCurrentStep(5);

    if (onComplete) {
      onComplete(creditData);
    }
  };

  const goToResults = () => {
    router.push('/your-plan/results');
  };

  const handlePersonaChange = (persona) => {
    // Force a page refresh to reload data with new persona
    window.location.reload();
  };

  const renderProgressBar = () => {
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`
                flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium
                ${currentStep >= step.id
                  ? 'bg-blue-600 text-white'
                  : currentStep === step.id
                    ? 'bg-blue-100 text-blue-600 border-2 border-blue-600'
                    : 'bg-gray-200 text-gray-500'
                }
              `}>
                {stepStatus[step.key]?.completed ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  step.id
                )}
              </div>
              <div className="ml-2 hidden sm:block">
                <div className={`text-sm font-medium ${
                  currentStep >= step.id ? 'text-gray-900' : 'text-gray-500'
                }`}>
                  {step.name}
                </div>
              </div>
              {index < STEPS.length - 1 && (
                <div className={`
                  ml-4 w-8 h-0.5
                  ${currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200'}
                `} />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <PhoneVerificationStep
            onComplete={handlePhoneVerificationComplete}
          />
        );

      case 2:
        return (
          <CoApplicantDetectionStep
            onComplete={handleCoApplicantComplete}
            onBack={() => setCurrentStep(1)}
          />
        );

      case 3:
        return (
          <div className="max-w-4xl mx-auto">
            {/* Persona Selector for Testing */}
            <div className="mb-8">
              <PersonaSelector
                userId={userId}
                onPersonaChange={handlePersonaChange}
              />
            </div>

            <div className="max-w-md mx-auto text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-4">
                <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Connect Your Bank Account
              </h2>
              <p className="text-gray-600 mb-6">
                Verify your income and expenses to calculate an affordable monthly payment
              </p>

              {stepData.hasCoApplicant && (
                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                  <p className="text-sm text-blue-800">
                    <strong>Co-Applicant Status:</strong> Waiting for {stepData.coApplicantInfo?.name} to complete their verification
                  </p>
                </div>
              )}

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                {isProcessing.bank_connection ? (
                  <div className="flex items-center justify-center space-x-2 py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span className="text-blue-600">Processing...</span>
                  </div>
                ) : (
                  <PlaidLink
                    userId={userId}
                    onSuccess={handleBankConnected}
                    buttonText="Connect Bank Account"
                    className="w-full h-12"
                  />
                )}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="max-w-md mx-auto text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 mb-4">
              <svg className="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Credit Check
            </h2>
            <p className="text-gray-600 mb-6">
              Review your current debts to determine which accounts qualify for settlement
            </p>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              {isProcessing.credit_check ? (
                <div className="flex items-center justify-center space-x-2 py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                  <span className="text-purple-600">Processing...</span>
                </div>
              ) : (
                <CreditCheckForm
                  userId={userId}
                  onSuccess={handleCreditCheck}
                  buttonText="Start Credit Check"
                  className="w-full h-12"
                />
              )}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="max-w-md mx-auto text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-4">
              <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              All Set!
            </h2>
            <p className="text-gray-600 mb-6">
              Your verification is complete. Let's see your personalized debt settlement plan.
            </p>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <button
                onClick={goToResults}
                className="w-full py-3 px-6 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
              >
                View My Results
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Main Headlines - Only show on Step 1 */}
      {currentStep === 1 && (
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to see your plan? Let's get started.
          </h1>
          <p className="text-lg text-gray-600">
            Complete verification in simple steps
          </p>
        </div>
      )}

      {renderProgressBar()}
      {renderCurrentStep()}
    </div>
  );
}