'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DocuSignPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [envelopeData, setEnvelopeData] = useState(null);
  const [userData, setUserData] = useState(null);
  const [step, setStep] = useState('review'); // 'review', 'signing', 'complete', 'waiting_coapplicant'

  useEffect(() => {
    // Load user data from storage
    const loadUserData = () => {
      try {
        // Get user ID
        const userId = sessionStorage.getItem('user_id') || 'user_123';

        // Get phone data from sessionStorage
        const phoneData = JSON.parse(sessionStorage.getItem('phone_data') || '{}');

        // Get co-applicant data from localStorage
        const stepStatus = JSON.parse(localStorage.getItem('loan_step_status') || '{}');
        const coApplicantData = stepStatus.co_applicant_check?.data;

        // Get credit data from localStorage (contains ALL personal details from credit check form)
        const creditData = JSON.parse(localStorage.getItem(`credit_data_${userId}`) || '{}');

        console.log('[DocuSign] Raw credit data:', creditData);

        // Extract name from personalInfo or direct fields
        const firstName = creditData.personalInfo?.name?.split(' ')[0] || '';
        const lastName = creditData.personalInfo?.name?.split(' ').slice(1).join(' ') || '';

        // Get address info from personalInfo
        const address = creditData.personalInfo?.address || {
          street: '',
          city: '',
          state: '',
          zip: ''
        };

        // Get DOB and SSN from API response or requestData
        const dob = creditData.requestData?.dob || '';
        const ssn = creditData.requestData?.ssn || '';

        // Get momentum results from sessionStorage
        const momentumResults = JSON.parse(sessionStorage.getItem('momentumResults') || '{}');

        const data = {
          userId,
          phone: phoneData.phoneNumber || '',
          firstName,
          lastName,
          fullName: `${firstName} ${lastName}`.trim(),
          address,
          dob,
          ssn: ssn ? `***-**-${ssn.slice(-4)}` : '', // Only show last 4 digits
          email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
          hasCoApplicant: coApplicantData?.hasCoApplicant || false,
          coApplicantInfo: coApplicantData?.coApplicantInfo || null,
          momentumResults,
          rawCreditData: creditData // Keep for debugging
        };

        console.log('[DocuSign] Loaded user data:', data);
        setUserData(data);
      } catch (err) {
        console.error('[DocuSign] Error loading user data:', err);
        setError('Failed to load user data. Please go back and try again.');
      }
    };

    loadUserData();
  }, []);

  const handleStartSigning = async () => {
    if (!userData) {
      setError('User data not loaded');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Simulate envelope creation (prototype mode)
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockEnvelopeId = `env-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const mockEnvelopeData = {
        envelopeId: mockEnvelopeId,
        signingUrl: '#', // Placeholder for prototype
        coApplicantSigningUrl: userData.hasCoApplicant ? '#' : null
      };

      setEnvelopeData(mockEnvelopeData);

      // If there's a co-applicant, simulate SMS notification
      if (userData.hasCoApplicant) {
        console.log(`[Prototype] SMS would be sent to ${userData.coApplicantInfo?.phone}`);
        console.log(`[Prototype] Message: "Hi ${userData.coApplicantInfo?.name}, please sign the debt settlement agreement."`);
      }

      // Move to signing step
      setStep('signing');

    } catch (err) {
      console.error('[DocuSign] Error starting signing:', err);
      setError(err.message || 'Failed to start signing process. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSigningComplete = () => {
    if (userData?.hasCoApplicant) {
      setStep('waiting_coapplicant');
    } else {
      setStep('complete');
    }
  };

  const handleGoToResults = () => {
    router.push('/your-plan/results');
  };

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Sign Your Debt Settlement Agreement
          </h1>
          <p className="text-gray-600">
            Review and sign your personalized Momentum Plan agreement
          </p>
        </div>

        {/* Review Step */}
        {step === 'review' && (
          <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Agreement Summary</h2>

              <div className="space-y-4">
                {/* Plan Details */}
                <div className="border-b pb-4">
                  <h3 className="font-medium text-gray-900 mb-2">Plan Details</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Monthly Payment:</span>
                      <span className="ml-2 font-semibold">
                        ${userData.momentumResults.monthlyPayment?.toLocaleString() || 0}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Term:</span>
                      <span className="ml-2 font-semibold">
                        {userData.momentumResults.term || 0} months
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Total Debt:</span>
                      <span className="ml-2 font-semibold">
                        ${userData.momentumResults.totalDebt?.toLocaleString() || 0}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Accounts:</span>
                      <span className="ml-2 font-semibold">
                        {userData.momentumResults.accountCount || 0}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Signer Info */}
                <div className="border-b pb-4">
                  <h3 className="font-medium text-gray-900 mb-3">Primary Signer Information</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-600 block mb-1">Full Name</span>
                        <span className="font-medium">{userData.fullName || 'Not provided'}</span>
                      </div>
                      <div>
                        <span className="text-gray-600 block mb-1">Date of Birth</span>
                        <span className="font-medium">{userData.dob || 'Not provided'}</span>
                      </div>
                      <div>
                        <span className="text-gray-600 block mb-1">Phone Number</span>
                        <span className="font-medium">{userData.phone || 'Not provided'}</span>
                      </div>
                      <div>
                        <span className="text-gray-600 block mb-1">SSN</span>
                        <span className="font-medium">{userData.ssn || 'Not provided'}</span>
                      </div>
                      <div className="md:col-span-2">
                        <span className="text-gray-600 block mb-1">Address</span>
                        <span className="font-medium">
                          {userData.address?.street ? (
                            <>
                              {userData.address.street}<br />
                              {userData.address.city}, {userData.address.state} {userData.address.zip}
                            </>
                          ) : 'Not provided'}
                        </span>
                      </div>
                      <div className="md:col-span-2">
                        <span className="text-gray-600 block mb-1">Email</span>
                        <span className="font-medium">{userData.email || 'Not provided'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Co-Applicant Info */}
                {userData.hasCoApplicant && (
                  <div className="border-b pb-4">
                    <h3 className="font-medium text-gray-900 mb-2">Co-Applicant</h3>
                    <div className="text-sm space-y-1">
                      <div>
                        <span className="text-gray-600">Name:</span>
                        <span className="ml-2">{userData.coApplicantInfo?.name}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Phone:</span>
                        <span className="ml-2">{userData.coApplicantInfo?.phone}</span>
                      </div>
                      <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded text-xs">
                        Your co-applicant will receive an SMS notification to sign the agreement after you complete your signature.
                      </div>
                    </div>
                  </div>
                )}

                {/* Important Notes */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="font-medium text-yellow-900 mb-2">Important Notes</h3>
                  <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
                    <li>This is a legally binding agreement</li>
                    <li>You will need to provide electronic signatures</li>
                    <li>Please review all terms carefully before signing</li>
                    {userData.hasCoApplicant && (
                      <li>Both parties must sign for the agreement to be valid</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800 text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={handleGoToResults}
                className="flex-1 py-3 px-6 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back to Results
              </button>
              <button
                onClick={handleStartSigning}
                disabled={isLoading}
                className={`flex-1 py-3 px-6 font-semibold rounded-lg transition-colors ${
                  isLoading
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  'Continue to Sign'
                )}
              </button>
            </div>
          </div>
        )}

        {/* Signing Step */}
        {step === 'signing' && envelopeData && (
          <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 mb-4">
                <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Ready to Sign</h2>
              <p className="text-gray-600 mb-6">
                Click the button below to open the DocuSign signing interface
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-2">
              <div className="flex items-start">
                <span className="font-medium text-gray-700 mr-2">Envelope ID:</span>
                <span className="text-gray-600 font-mono">{envelopeData.envelopeId}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <p className="text-gray-600 mb-4">
                  [Prototype Mode: DocuSign signing interface would appear here]
                </p>
                <div className="text-sm text-gray-500 space-y-2">
                  <p>In production, this would:</p>
                  <ul className="list-disc list-inside text-left max-w-md mx-auto">
                    <li>Display the debt settlement agreement</li>
                    <li>Show signature fields</li>
                    <li>Allow electronic signing</li>
                    <li>Validate all required fields</li>
                  </ul>
                </div>
              </div>

              <button
                onClick={handleSigningComplete}
                className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-md hover:shadow-lg"
              >
                Simulate Signature Complete
              </button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
              <strong>Prototype Note:</strong> This is a mockup of the DocuSign flow.
              In production, users would interact with the actual DocuSign signing interface.
            </div>
          </div>
        )}

        {/* Waiting for Co-Applicant Step */}
        {step === 'waiting_coapplicant' && (
          <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100 mb-4">
                <svg className="h-8 w-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Waiting for Co-Applicant</h2>
              <p className="text-gray-600 mb-6">
                Your signature has been received. We're now waiting for {userData.coApplicantInfo?.name} to sign.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">What happens next?</h3>
              <ul className="text-sm text-blue-800 space-y-2 list-disc list-inside">
                <li>An SMS notification has been sent to {userData.coApplicantInfo?.phone}</li>
                <li>They will receive a link to complete their signature</li>
                <li>Once both signatures are collected, your plan will be activated</li>
                <li>You will receive email confirmation when the process is complete</li>
              </ul>
            </div>

            <button
              onClick={handleGoToResults}
              className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-md hover:shadow-lg"
            >
              Return to Results
            </button>
          </div>
        )}

        {/* Complete Step */}
        {step === 'complete' && (
          <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-4">
                <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Signing Complete!</h2>
              <p className="text-gray-600 mb-6">
                Your agreement has been signed successfully
              </p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-medium text-green-900 mb-2">What's Next?</h3>
              <ul className="text-sm text-green-800 space-y-2 list-disc list-inside">
                <li>You will receive a copy of the signed agreement via email</li>
                <li>Your Momentum Plan will be activated within 1-2 business days</li>
                <li>Our team will contact you to discuss next steps</li>
                <li>You can review your plan details anytime in your dashboard</li>
              </ul>
            </div>

            <button
              onClick={handleGoToResults}
              className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-md hover:shadow-lg"
            >
              Return to Results
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
