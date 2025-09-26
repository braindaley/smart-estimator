'use client';

import { useState, useEffect } from 'react';
import PhoneVerification from './PhoneVerification';

export default function PhoneVerificationModal({
  isOpen,
  onSuccess,
  onClose,
  userId
}) {
  const [step, setStep] = useState('phone'); // 'phone' or 'sms'
  const [phoneNumber, setPhoneNumber] = useState('');

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep('phone');
      setPhoneNumber('');
    }
  }, [isOpen]);

  const handlePhoneSuccess = (data) => {
    console.log('[PhoneVerificationModal] Phone verification successful:', data);
    onSuccess(data);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Background overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />

      {/* Modal content */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md transform overflow-hidden rounded-xl bg-white p-6 shadow-xl transition-all">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 mb-4">
              <svg
                className="h-6 w-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Verify Your Phone Number
            </h3>
            <p className="text-sm text-gray-600 mt-2">
              We need to verify your identity before connecting your accounts
            </p>
          </div>

          {/* Phone verification form */}
          <div className="mb-6">
            <PhoneVerification
              userId={userId}
              onSuccess={handlePhoneSuccess}
              buttonText="Send Verification Code"
              className="w-full"
            />
          </div>

          {/* Security notice */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="flex">
              <svg
                className="h-5 w-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m0 0v2m0-2h2m-2 0h-2m9-6a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <h4 className="text-sm font-medium text-gray-900">
                  Secure & Private
                </h4>
                <p className="text-xs text-gray-600 mt-1">
                  Your phone number is used only for identity verification and is never shared.
                </p>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="text-xs text-gray-500 space-y-1">
            <p>• Enter your phone number and click "Send Verification Code"</p>
            <p>• You'll receive a 6-digit code via SMS</p>
            <p>• Enter the code to complete verification</p>
          </div>
        </div>
      </div>
    </div>
  );
}