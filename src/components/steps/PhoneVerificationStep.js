'use client';

import { useState } from 'react';

export default function PhoneVerificationStep({ onComplete, onBack }) {
  const [step, setStep] = useState('phone'); // 'phone' or 'sms'
  const [phoneNumber, setPhoneNumber] = useState('');
  const [smsCode, setSmsCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const formatPhoneNumber = (value) => {
    const cleaned = value.replace(/\D/g, '');

    if (cleaned.length === 0) return '';
    if (cleaned.length <= 3) return `(${cleaned}`;
    if (cleaned.length <= 6) return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
  };

  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate phone number
    const cleanedPhone = phoneNumber.replace(/\D/g, '');
    if (!phoneNumber.trim()) {
      setError('Please enter your phone number.');
      return;
    }
    if (cleanedPhone.length !== 10) {
      setError('Please enter a valid 10-digit phone number.');
      return;
    }

    setIsLoading(true);

    try {
      // Simulate sending SMS
      await new Promise(resolve => setTimeout(resolve, 1000));

      console.log('[PhoneVerificationStep] SMS sent to:', phoneNumber);
      setStep('sms');
    } catch (err) {
      setError('Failed to send verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSmsSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Simulate SMS verification
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (smsCode === '123456' || smsCode.length === 6) {
        console.log('[PhoneVerificationStep] Phone verified successfully');
        onComplete({ phoneNumber, verified: true });
      } else {
        setError('Invalid verification code. Please try again.');
      }
    } catch (err) {
      setError('Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 mb-4">
          <svg
            className="h-8 w-8 text-blue-600"
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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Verify Your Phone Number
        </h2>
        <p className="text-gray-600">
          We need to verify your identity before connecting your accounts
        </p>
      </div>

      {/* Phone/SMS Form */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        {step === 'sms' ? (
          <form onSubmit={handleSmsSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter verification code sent to {phoneNumber}
              </label>
              <input
                type="text"
                value={smsCode}
                onChange={(e) => setSmsCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="123456"
                className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-xl tracking-widest"
                maxLength={6}
                required
              />
            </div>
            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}
            <div className="space-y-3">
              <button
                type="submit"
                disabled={isLoading || smsCode.length !== 6}
                className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
                  isLoading || smsCode.length !== 6
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isLoading ? 'Verifying...' : 'Verify Code'}
              </button>
              <button
                type="button"
                onClick={() => setStep('phone')}
                className="w-full py-3 px-4 text-blue-600 hover:text-blue-800 font-medium underline"
              >
                ← Change Phone Number
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handlePhoneSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(formatPhoneNumber(e.target.value))}
                placeholder="(555) 123-4567"
                className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
                isLoading
                  ? 'bg-blue-100 text-blue-700 cursor-wait'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isLoading ? 'Sending...' : 'Send Verification Code'}
            </button>
          </form>
        )}
      </div>

      {/* Security notice */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
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
      <div className="text-sm text-gray-500 space-y-2">
        <p>• Enter your phone number and click "Send Verification Code"</p>
        <p>• You'll receive a 6-digit code via SMS</p>
        <p>• Enter the code to complete verification</p>
      </div>
    </div>
  );
}