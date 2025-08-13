'use client';

import { useState, useEffect } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import { storeTokenClient } from '@/lib/client-token-store';

/**
 * Enhanced PlaidLink Component with comprehensive error handling and debugging
 */
export default function PlaidLinkEnhanced({ 
  onSuccess, 
  userId, 
  className = '',
  buttonText = 'Connect Bank Account',
  disabled = false
}) {
  const [linkToken, setLinkToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('');
  const [isExchangingToken, setIsExchangingToken] = useState(false);
  const [debugInfo, setDebugInfo] = useState(null);

  // Fetch link token on component mount
  useEffect(() => {
    const fetchLinkToken = async () => {
      console.log('[PlaidLink] Starting fetchLinkToken, userId:', userId);
      
      if (!userId) {
        const errorMsg = 'User ID is required';
        console.error('[PlaidLink] Error:', errorMsg);
        setError(errorMsg);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        setDebugInfo(null);
        setConnectionStatus('Preparing bank connection...');

        console.log('[PlaidLink] Making API request to /api/plaid/create-link-token');
        console.log('[PlaidLink] Request payload:', { userId });

        const response = await fetch('/api/plaid/create-link-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId }),
        });

        console.log('[PlaidLink] Response status:', response.status);
        console.log('[PlaidLink] Response headers:', Object.fromEntries(response.headers.entries()));

        const data = await response.json();
        console.log('[PlaidLink] Response data:', data);

        if (!response.ok) {
          console.error('[PlaidLink] API error response:', {
            status: response.status,
            statusText: response.statusText,
            data
          });

          // Set debug info for troubleshooting
          setDebugInfo({
            status: response.status,
            statusText: response.statusText,
            error_code: data.error_code,
            error_type: data.error_type,
            request_id: data.request_id,
            response: data
          });

          // Handle specific error types
          let errorMessage = data.error || data.details || 'Failed to create link token';
          
          if (data.error_code === 'INVALID_API_KEYS') {
            errorMessage = 'Invalid Plaid credentials. Please check server configuration.';
          } else if (data.error_code === 'UNAUTHORIZED') {
            errorMessage = 'Authentication failed. Please check Plaid credentials.';
          } else if (response.status === 500 && data.message) {
            errorMessage = data.message;
          }

          throw new Error(errorMessage);
        }

        if (!data.link_token) {
          console.error('[PlaidLink] No link token in response:', data);
          throw new Error('No link token received from server');
        }

        console.log('[PlaidLink] Successfully received link token');
        console.log('[PlaidLink] Link token length:', data.link_token.length);
        console.log('[PlaidLink] Expiration:', data.expiration);

        setLinkToken(data.link_token);
        setConnectionStatus('Ready to connect');
        
      } catch (err) {
        console.error('[PlaidLink] Error fetching link token:', err);
        console.error('[PlaidLink] Error stack:', err.stack);
        
        setError(err.message || 'Failed to prepare bank connection');
        setConnectionStatus('Connection preparation failed');
        
        // Additional error context
        if (err.name === 'TypeError' && err.message.includes('fetch')) {
          setError('Network error: Unable to reach the server. Please check your connection.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchLinkToken();
  }, [userId]);

  // Handle successful Plaid Link flow
  const handleOnSuccess = async (public_token, metadata) => {
    console.log('[PlaidLink] Plaid Link success:', { public_token: public_token.substring(0, 20) + '...', metadata });
    
    try {
      setIsExchangingToken(true);
      setConnectionStatus('Securing your connection...');

      console.log('[PlaidLink] Exchanging public token');

      const response = await fetch('/api/plaid/exchange-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          public_token, 
          userId 
        }),
      });

      const data = await response.json();
      console.log('[PlaidLink] Token exchange response:', data);

      if (!response.ok) {
        console.error('[PlaidLink] Token exchange error:', {
          status: response.status,
          data
        });
        throw new Error(data.error || 'Failed to complete bank connection');
      }

      setConnectionStatus('Bank account connected successfully!');
      
      // Store token client-side for development persistence
      storeTokenClient(userId, data.access_token);
      console.log('[PlaidLink] Token stored client-side for persistence');
      
      // Call the onSuccess callback with enriched metadata
      if (onSuccess) {
        console.log('[PlaidLink] Calling onSuccess callback');
        onSuccess({
          ...metadata,
          access_token: data.access_token,
          item_id: data.item_id,
          userId,
        });
      }
    } catch (err) {
      console.error('[PlaidLink] Error exchanging token:', err);
      setError(err.message || 'Failed to complete bank connection');
      setConnectionStatus('Connection failed');
    } finally {
      setIsExchangingToken(false);
    }
  };

  // Handle Plaid Link errors
  const handleOnExit = (err, metadata) => {
    console.log('[PlaidLink] Plaid Link exit:', { error: err, metadata });
    
    if (err != null) {
      console.error('[PlaidLink] Plaid Link error:', err);
      setError('Bank connection was cancelled or failed: ' + (err.error_message || err.display_message || err.error_code || 'Unknown error'));
      setConnectionStatus('Connection cancelled');
    } else {
      console.log('[PlaidLink] User cancelled connection');
      setConnectionStatus('Connection cancelled by user');
    }
  };

  // Configure Plaid Link
  const config = {
    token: linkToken,
    onSuccess: handleOnSuccess,
    onExit: handleOnExit,
  };

  const { open, ready } = usePlaidLink(config);

  console.log('[PlaidLink] Plaid Link state:', { 
    hasLinkToken: !!linkToken, 
    ready, 
    isLoading, 
    error: !!error 
  });

  // Determine button state
  const isButtonDisabled = disabled || !ready || isLoading || isExchangingToken || !!error;
  const isProcessing = isLoading || isExchangingToken;

  // Handle button click
  const handleClick = () => {
    console.log('[PlaidLink] Button clicked, opening Plaid Link');
    if (!isButtonDisabled) {
      setConnectionStatus('Opening bank selection...');
      open();
    } else {
      console.log('[PlaidLink] Button disabled, state:', {
        disabled,
        ready,
        isLoading,
        isExchangingToken,
        error: !!error
      });
    }
  };

  // Base button classes
  const baseClasses = `
    inline-flex items-center justify-center px-6 py-3 
    text-base font-medium rounded-lg transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:cursor-not-allowed
  `;

  // Dynamic button classes based on state
  const getButtonClasses = () => {
    if (error) {
      return `${baseClasses} bg-red-100 text-red-700 border border-red-300 
              hover:bg-red-50 focus:ring-red-500 disabled:opacity-50`;
    }
    
    if (isProcessing) {
      return `${baseClasses} bg-blue-100 text-blue-700 border border-blue-300 
              cursor-wait disabled:opacity-50`;
    }
    
    return `${baseClasses} bg-blue-600 text-white border border-transparent 
            hover:bg-blue-700 focus:ring-blue-500 disabled:bg-gray-300 
            disabled:text-gray-500`;
  };

  // Get button text based on state
  const getButtonText = () => {
    if (error) return 'Connection Failed - Retry';
    if (isExchangingToken) return 'Securing Connection...';
    if (isLoading) return 'Preparing...';
    if (!ready && linkToken) return 'Initializing...';
    if (!linkToken) return 'Loading...';
    return buttonText;
  };

  // Get status message color
  const getStatusColor = () => {
    if (error) return 'text-red-600';
    if (connectionStatus.includes('successfully')) return 'text-green-600';
    if (connectionStatus.includes('failed') || connectionStatus.includes('cancelled')) return 'text-red-600';
    return 'text-blue-600';
  };

  // Retry function
  const handleRetry = () => {
    console.log('[PlaidLink] Retrying connection');
    setError(null);
    setDebugInfo(null);
    setConnectionStatus('');
    setLinkToken(null);
    setIsLoading(true);
    
    // Trigger useEffect to fetch token again
    // Force re-render by changing a dependency
    window.location.reload();
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <button
        type="button"
        onClick={handleClick}
        disabled={isButtonDisabled}
        className={getButtonClasses()}
        aria-label={`${getButtonText()}. ${connectionStatus}`}
        aria-describedby={connectionStatus ? 'plaid-status' : undefined}
      >
        {/* Loading spinner */}
        {isProcessing && (
          <svg
            className="animate-spin -ml-1 mr-3 h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        
        {/* Bank icon for non-processing states */}
        {!isProcessing && (
          <svg
            className="mr-2 h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V8a2 2 0 00-2-2H6a2 2 0 00-2 2v9a2 2 0 002 2z"
            />
          </svg>
        )}
        
        {getButtonText()}
      </button>

      {/* Status message */}
      {connectionStatus && (
        <p
          id="plaid-status"
          className={`text-sm ${getStatusColor()} transition-colors duration-200`}
          role="status"
          aria-live="polite"
        >
          {connectionStatus}
        </p>
      )}

      {/* Error message with debug info */}
      {error && (
        <div
          className="p-3 bg-red-50 border border-red-200 rounded-md"
          role="alert"
          aria-live="assertive"
        >
          <div className="flex">
            <svg
              className="h-5 w-5 text-red-400 mt-0.5 mr-2 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-800">
                Connection Error
              </h3>
              <p className="text-sm text-red-700 mt-1">
                {error}
              </p>
              
              {/* Debug information */}
              {debugInfo && process.env.NODE_ENV === 'development' && (
                <details className="mt-2">
                  <summary className="text-xs text-red-600 cursor-pointer">
                    Debug Information (Development Only)
                  </summary>
                  <pre className="text-xs text-red-600 mt-1 bg-red-100 p-2 rounded overflow-auto">
                    {JSON.stringify(debugInfo, null, 2)}
                  </pre>
                </details>
              )}
              
              {/* Retry button */}
              <button
                onClick={handleRetry}
                className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success message */}
      {connectionStatus.includes('successfully') && (
        <div
          className="p-3 bg-green-50 border border-green-200 rounded-md"
          role="status"
          aria-live="polite"
        >
          <div className="flex">
            <svg
              className="h-5 w-5 text-green-400 mt-0.5 mr-2 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-green-800">
                Success!
              </h3>
              <p className="text-sm text-green-700 mt-1">
                Your bank account has been connected successfully.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Development mode debugging */}
      {process.env.NODE_ENV === 'development' && (
        <details className="mt-4">
          <summary className="text-xs text-gray-500 cursor-pointer">
            Component State (Development Only)
          </summary>
          <pre className="text-xs text-gray-600 mt-1 bg-gray-100 p-2 rounded overflow-auto">
            {JSON.stringify({
              userId,
              hasLinkToken: !!linkToken,
              linkTokenLength: linkToken?.length,
              ready,
              isLoading,
              isExchangingToken,
              error: !!error,
              connectionStatus,
              isButtonDisabled
            }, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
}