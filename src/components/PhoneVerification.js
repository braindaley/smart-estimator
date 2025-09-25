'use client';

import { useState } from 'react';

export default function PhoneVerification({ userId, onSuccess, buttonText = "Verify Phone", className = "" }) {
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

      console.log('[PhoneVerification] SMS sent to:', phoneNumber);
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
        console.log('[PhoneVerification] Phone verified successfully');
        onSuccess({ phoneNumber, verified: true });
      } else {
        setError('Invalid verification code. Please try again.');
      }
    } catch (err) {
      setError('Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 'sms') {
    return (
      <form onSubmit={handleSmsSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Enter verification code sent to {phoneNumber}
          </label>
          <input
            type="text"
            value={smsCode}
            onChange={(e) => setSmsCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="123456"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg tracking-widest"
            maxLength={6}
            required
          />
        </div>
        {error && (
          <div className="text-red-600 text-sm">{error}</div>
        )}
        <div className="space-y-2">
          <button
            type="submit"
            disabled={isLoading || smsCode.length !== 6}
            className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${className} ${
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
            className="w-full py-2 px-4 text-blue-600 hover:text-blue-800 font-medium underline text-sm"
          >
            ← Change Phone Number
          </button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={handlePhoneSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Phone Number
        </label>
        <input
          type="tel"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(formatPhoneNumber(e.target.value))}
          placeholder="(555) 123-4567"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
      </div>
      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}
      <button
        type="submit"
        disabled={isLoading}
        className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${className} ${
          isLoading
            ? 'bg-blue-100 text-blue-700 cursor-wait'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {isLoading ? 'Sending...' : buttonText}
      </button>
    </form>
  );
}