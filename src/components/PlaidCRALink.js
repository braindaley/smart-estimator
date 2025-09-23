'use client';

import { useState, useEffect } from 'react';
import { usePlaidLink } from 'react-plaid-link';

/**
 * Plaid CRA Link Component specifically for Consumer Report (Income Verification)
 * This component only requests the 'cra_base_report' product for income data
 */
export default function PlaidCRALink({
  onSuccess,
  userId,
  className = '',
  buttonText = 'Verify Income with Bank',
  disabled = false,
  userToken = null // Optional: existing user token for update mode
}) {
  const [linkToken, setLinkToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('');
  const [isExchangingToken, setIsExchangingToken] = useState(false);
  const [debugInfo, setDebugInfo] = useState(null);

  // Fetch CRA link token on component mount
  useEffect(() => {
    const fetchCRALinkToken = async () => {
      console.log('[PlaidCRALink] Starting fetchCRALinkToken, userId:', userId);

      if (!userId) {
        const errorMsg = 'User ID is required';
        console.error('[PlaidCRALink] Error:', errorMsg);
        setError(errorMsg);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        setDebugInfo(null);
        setConnectionStatus('Preparing income verification...');

        console.log('[PlaidCRALink] Making API request to /api/plaid/create-cra-link-token');
        console.log('[PlaidCRALink] Request payload:', { userId, userToken });

        const response = await fetch('/api/plaid/create-cra-link-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId, userToken }),
        });

        console.log('[PlaidCRALink] Response status:', response.status);

        const data = await response.json();
        console.log('[PlaidCRALink] Response data:', data);

        if (!response.ok) {
          console.error('[PlaidCRALink] API error response:', {
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
          let errorMessage = data.error || data.details || 'Failed to create CRA link token';

          if (data.error_code === 'INVALID_API_KEYS') {
            errorMessage = 'Invalid Plaid credentials. Please check server configuration.';
          } else if (data.error_code === 'UNAUTHORIZED') {
            errorMessage = 'Authentication failed. Please check Plaid credentials.';
          } else if (data.error_code === 'PRODUCTS_NOT_SUPPORTED') {
            errorMessage = 'Income verification not available in this environment. Please contact support.';
          } else if (response.status === 500 && data.message) {
            errorMessage = data.message;
          }

          throw new Error(errorMessage);
        }

        if (!data.link_token) {
          console.error('[PlaidCRALink] No link token in response:', data);
          throw new Error('No CRA link token received from server');
        }

        console.log('[PlaidCRALink] Successfully received CRA link token');
        console.log('[PlaidCRALink] Link token length:', data.link_token.length);
        console.log('[PlaidCRALink] Expiration:', data.expiration);

        setLinkToken(data.link_token);
        setConnectionStatus('Ready to connect');
        setIsLoading(false);

      } catch (error) {
        console.error('[PlaidCRALink] Error fetching link token:', error);
        setError(error.message);
        setConnectionStatus('Connection failed');
        setIsLoading(false);
      }
    };

    fetchLinkToken();
  }, [userId, userToken]);

  // Handle successful Plaid Link flow
  const handleOnSuccess = async (public_token, metadata) => {
    console.log('[PlaidCRALink] Plaid Link success:', {
      public_token: public_token?.substring(0, 10) + '...',
      metadata
    });

    setIsExchangingToken(true);
    setConnectionStatus('Processing income verification...');

    try {
      // Exchange public token for access token
      console.log('[PlaidCRALink] Exchanging public token...');

      const exchangeResponse = await fetch('/api/plaid/exchange-public-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          public_token,
          userId,
          institution: metadata.institution,
          accounts: metadata.accounts
        }),
      });

      const exchangeData = await exchangeResponse.json();
      console.log('[PlaidCRALink] Exchange response:', exchangeData);

      if (!exchangeResponse.ok) {
        throw new Error(exchangeData.error || 'Failed to exchange token');
      }

      if (!exchangeData.access_token) {
        throw new Error('No access token received');
      }

      // Get user token from the exchange response
      const userTokenResult = exchangeData.user_token;

      if (!userTokenResult) {
        console.warn('[PlaidCRALink] No user token received - CRA features may not be available');
      }

      console.log('[PlaidCRALink] Successfully exchanged token');
      setConnectionStatus('Income verification connected successfully!');

      // Call the success callback with the CRA-specific data
      if (onSuccess) {
        onSuccess({
          access_token: exchangeData.access_token,
          user_token: userTokenResult,
          item_id: exchangeData.item_id,
          institution: metadata.institution,
          accounts: metadata.accounts,
          link_session_id: metadata.link_session_id,
          type: 'cra_income' // Mark this as a CRA income connection
        });
      }

    } catch (error) {
      console.error('[PlaidCRALink] Error in token exchange:', error);
      setError('Failed to complete income verification: ' + error.message);
      setConnectionStatus('Income verification failed');
    } finally {
      setIsExchangingToken(false);
    }
  };

  // Handle Plaid Link errors
  const handleOnExit = (err, metadata) => {
    console.log('[PlaidCRALink] Plaid Link exit:', { error: err, metadata });

    if (err != null) {
      console.error('[PlaidCRALink] Plaid Link error:', err);
      setError(`Income verification failed: ${err.error_message || err.message || 'Unknown error'}`);
      setConnectionStatus('Income verification failed');
    } else {
      console.log('[PlaidCRALink] User exited Link without error');
      setConnectionStatus('Income verification cancelled');
    }
  };

  // Initialize Plaid Link
  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: handleOnSuccess,
    onExit: handleOnExit,
  });

  // Handle button click
  const handleOpenLink = () => {
    if (ready && !isExchangingToken && !disabled) {
      console.log('[PlaidCRALink] Opening Plaid Link for income verification');
      setConnectionStatus('Opening income verification...');
      open();
    }
  };

  // Determine button state and text
  const getButtonText = () => {
    if (isLoading) return 'Preparing...';
    if (isExchangingToken) return 'Processing...';
    if (error) return 'Retry Income Verification';
    if (!ready) return 'Loading...';
    return buttonText;
  };

  const isButtonDisabled = disabled || isLoading || isExchangingToken || !ready || !linkToken;

  return (
    <div className={`plaid-cra-link ${className}`}>
      {/* Main Button */}
      <button
        onClick={handleOpenLink}
        disabled={isButtonDisabled}
        className={`
          px-6 py-3 rounded-lg font-medium transition-all duration-200
          ${isButtonDisabled
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-green-600 hover:bg-green-700 text-white cursor-pointer shadow-lg hover:shadow-xl'
          }
        `}
      >
        {getButtonText()}
      </button>

      {/* Status Message */}
      {connectionStatus && (
        <div className="mt-2 text-sm text-gray-600">
          {connectionStatus}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-sm text-red-700 font-medium">
            Error: {error}
          </div>

          {/* Debug Info */}
          {debugInfo && process.env.NODE_ENV === 'development' && (
            <details className="mt-2">
              <summary className="cursor-pointer text-xs text-red-600">
                Debug Information
              </summary>
              <pre className="mt-1 text-xs bg-red-100 p-2 rounded overflow-auto">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </details>
          )}
        </div>
      )}

      {/* Information about CRA Income Verification */}
      <div className="mt-3 text-xs text-gray-500">
        <p>🔒 Secure income verification powered by Plaid</p>
        <p>• Connects to your bank for income analysis</p>
        <p>• Only requests Consumer Report data (CRA)</p>
        <p>• No transaction details stored</p>
      </div>
    </div>
  );
}