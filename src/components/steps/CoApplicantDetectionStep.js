'use client';

import { useState } from 'react';

export default function CoApplicantDetectionStep({ onComplete, onBack }) {
  const [hasCoApplicant, setHasCoApplicant] = useState(null);
  const [coApplicantName, setCoApplicantName] = useState('');
  const [coApplicantPhone, setCoApplicantPhone] = useState('');
  const [inviteSent, setInviteSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const formatPhoneNumber = (value) => {
    const cleaned = value.replace(/\D/g, '');

    if (cleaned.length === 0) return '';
    if (cleaned.length <= 3) return `(${cleaned}`;
    if (cleaned.length <= 6) return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
  };

  const handleJustMe = () => {
    onComplete({
      hasCoApplicant: false,
      coApplicantInfo: null
    });
  };

  const handleSendInvite = async () => {
    if (!coApplicantName.trim() || !coApplicantPhone.trim()) {
      return;
    }

    setIsLoading(true);

    // Simulate sending invitation
    await new Promise(resolve => setTimeout(resolve, 1500));

    setInviteSent(true);
    setIsLoading(false);

    // Auto-complete after showing success message
    setTimeout(() => {
      onComplete({
        hasCoApplicant: true,
        coApplicantInfo: {
          name: coApplicantName,
          phone: coApplicantPhone,
          inviteSent: true,
          completed: false // Will be updated when they complete verification
        }
      });
    }, 2000);
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-4">
          <svg
            className="h-8 w-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Do you have a co-applicant?
        </h2>
        <p className="text-gray-600 max-w-xl mx-auto">
          Do you share any debt accounts with a spouse, partner, or family member?
        </p>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        {hasCoApplicant === null && (
          <div className="space-y-6">
            {/* Explanation */}
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <div className="flex">
                <svg
                  className="h-5 w-5 text-blue-400 mt-0.5 mr-3 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <h4 className="text-sm font-medium text-blue-900">
                    Why we ask this
                  </h4>
                  <p className="text-sm text-blue-800 mt-1">
                    If you have joint credit cards, loans, or other shared debts, we'll need both of you to complete verification for accurate settlement calculations. This ensures we have the complete financial picture.
                  </p>
                </div>
              </div>
            </div>

            {/* Options */}
            <div className="grid gap-4">
              <button
                onClick={handleJustMe}
                className="text-left p-4 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all duration-200"
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0 mr-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Just me</h3>
                    <p className="text-sm text-gray-600">I'm the only person responsible for these debts</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setHasCoApplicant(true)}
                className="text-left p-4 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all duration-200"
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0 mr-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">I have a co-applicant</h3>
                    <p className="text-sm text-gray-600">I share debt accounts with someone else</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}

        {hasCoApplicant === true && !inviteSent && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Invite your co-applicant
              </h3>
              <p className="text-gray-600">
                We'll send them a secure link to complete their verification
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Co-applicant's first name
                </label>
                <input
                  type="text"
                  value={coApplicantName}
                  onChange={(e) => setCoApplicantName(e.target.value)}
                  placeholder="Jane"
                  className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Co-applicant's phone number
                </label>
                <input
                  type="tel"
                  value={coApplicantPhone}
                  onChange={(e) => setCoApplicantPhone(formatPhoneNumber(e.target.value))}
                  placeholder="(555) 123-4567"
                  className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Mock SMS Preview */}
              <div className="bg-gray-50 rounded-lg p-4 mt-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  They'll receive this message:
                </h4>
                <div className="bg-white rounded-lg p-3 border text-sm">
                  <span className="text-gray-600">
                    Hi {coApplicantName || '[Name]'}, you've been invited to complete verification for a debt settlement application with shared accounts.
                    Complete your verification here: https://smart-estimator.com/verify/abc123
                  </span>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setHasCoApplicant(null)}
                  className="flex-1 py-3 px-4 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleSendInvite}
                  disabled={!coApplicantName.trim() || !coApplicantPhone.trim() || isLoading}
                  className={`flex-1 py-3 px-4 rounded-md font-medium transition-colors ${
                    !coApplicantName.trim() || !coApplicantPhone.trim() || isLoading
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isLoading ? 'Sending...' : 'Send Invitation'}
                </button>
              </div>
            </div>
          </div>
        )}

        {inviteSent && (
          <div className="text-center py-8">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-4">
              <svg
                className="h-8 w-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Invitation sent!
            </h3>
            <p className="text-gray-600 mb-4">
              {coApplicantName} will receive a text message with a secure link to complete their verification.
            </p>
            <p className="text-sm text-gray-500">
              Continuing to next step...
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      {hasCoApplicant === null && (
        <div className="text-center">
          <button
            onClick={onBack}
            className="text-blue-600 hover:text-blue-800 font-medium underline"
          >
            ← Back to phone verification
          </button>
        </div>
      )}
    </div>
  );
}