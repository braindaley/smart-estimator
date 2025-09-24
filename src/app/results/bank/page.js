'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';

// Dynamically import session-store to avoid SSR issues
const getPlaidData = typeof window !== 'undefined' 
  ? require('@/lib/session-store').getPlaidData 
  : () => null;

const clearPlaidData = typeof window !== 'undefined'
  ? require('@/lib/session-store').clearPlaidData
  : () => {};

// Dynamically import PlaidDataDisplay to avoid SSR issues
const PlaidDataDisplay = dynamic(() => import('@/components/PlaidDataDisplay'), {
  ssr: false,
  loading: () => <div>Loading...</div>
});

// Dynamically import PersonaSelector to avoid SSR issues
const PersonaSelector = dynamic(() => import('@/components/PersonaSelector'), {
  ssr: false,
  loading: () => <div>Loading personas...</div>
});

/**
 * Bank Results Page Content - Wrapped in Suspense
 */
function BankResultsContent() {
  const [plaidData, setPlaidData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session');

  useEffect(() => {
    // Get user ID
    if (typeof window !== 'undefined') {
      const existingUserId = localStorage.getItem('loan_user_id');
      if (existingUserId) {
        setUserId(existingUserId);
      }
    }
  }, []);

  useEffect(() => {
    // Load Plaid data from session storage
    const loadPlaidData = () => {
      try {
        const storedData = getPlaidData();
        if (storedData) {
          setPlaidData(storedData);
        } else {
          setError('No bank data found. Please connect your bank account first.');
        }
      } catch (err) {
        console.error('[BankResults] Error loading data:', err);
        setError('Error loading your bank data.');
      } finally {
        setLoading(false);
      }
    };

    loadPlaidData();
  }, []);

  const handleClearData = () => {
    if (confirm('Are you sure you want to clear your Plaid bank data? This cannot be undone.')) {
      clearPlaidData();
      window.location.href = '/';
    }
  };

  const handlePersonaChange = (persona) => {
    // Reload the page to show new persona data
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your bank data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-red-900 mb-2">Data Not Found</h3>
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={() => window.location.href = '/'}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Go Back Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Bank Account Results</h1>
              <p className="text-gray-600">Data retrieved on {plaidData?.storedAt ? new Date(plaidData.storedAt).toLocaleDateString() : 'Unknown'}</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleClearData}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Clear Plaid Data
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-8">
        <div className="max-w-6xl mx-auto px-6 mb-8">
          {userId && (
            <PersonaSelector
              userId={userId}
              onPersonaChange={handlePersonaChange}
            />
          )}
        </div>

        {plaidData && (
          <PlaidDataDisplay
            userId={plaidData.userId}
            connectionMetadata={plaidData.data?.connectionMetadata}
            isResultsPage={true}
          />
        )}
      </div>
    </div>
  );
}

/**
 * Main Bank Results Page - Wrapped with Suspense boundary
 */
export default function BankResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <BankResultsContent />
    </Suspense>
  );
}