import { NextResponse } from 'next/server';
import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';

export async function POST(request) {
  console.log('[Create CRA Link Token] Starting request');

  try {
    // Check environment variables
    const requiredEnvVars = {
      PLAID_CLIENT_ID: process.env.PLAID_CLIENT_ID,
      PLAID_SECRET: process.env.PLAID_SECRET,
      PLAID_ENV: process.env.PLAID_ENV
    };

    console.log('[Create CRA Link Token] Environment check:', {
      hasClientId: !!requiredEnvVars.PLAID_CLIENT_ID,
      hasSecret: !!requiredEnvVars.PLAID_SECRET,
      environment: requiredEnvVars.PLAID_ENV,
      clientIdLength: requiredEnvVars.PLAID_CLIENT_ID?.length,
      secretLength: requiredEnvVars.PLAID_SECRET?.length
    });

    // Validate environment variables
    const missingVars = [];
    for (const [key, value] of Object.entries(requiredEnvVars)) {
      if (!value) {
        missingVars.push(key);
      }
    }

    if (missingVars.length > 0) {
      console.error('[Create CRA Link Token] Missing environment variables:', missingVars);
      return NextResponse.json(
        {
          error: 'Server configuration error',
          details: `Missing environment variables: ${missingVars.join(', ')}`,
          message: 'Please configure Plaid credentials in .env.local file'
        },
        { status: 500 }
      );
    }

    // Parse request body
    const { userId, userToken } = await request.json();
    console.log('[Create CRA Link Token] Request:', { userId, hasUserToken: !!userToken });

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Configure Plaid client
    const plaidEnv = requiredEnvVars.PLAID_ENV.toLowerCase();
    console.log('[Create CRA Link Token] Using Plaid environment:', plaidEnv);

    const configuration = new Configuration({
      basePath: PlaidEnvironments[plaidEnv] || PlaidEnvironments.sandbox,
      baseOptions: {
        headers: {
          'PLAID-CLIENT-ID': requiredEnvVars.PLAID_CLIENT_ID,
          'PLAID-SECRET': requiredEnvVars.PLAID_SECRET,
        },
      },
    });

    const client = new PlaidApi(configuration);

    // Create CRA link token request
    // IMPORTANT: Only include 'cra_base_report' in products array for income verification
    const linkTokenRequest = {
      user: {
        client_user_id: userId,
      },
      client_name: 'Smart Estimator',
      products: ['cra_base_report'], // ONLY CRA product for income verification
      country_codes: ['US'],
      language: 'en',
      consumer_report_permissible_purpose: 'ACCOUNT_REVIEW_CREDIT', // Required for CRA
      // If we have a user token from previous session, include it
      ...(userToken && { user_token: userToken })
    };

    console.log('[Create CRA Link Token] Request configuration:', linkTokenRequest);

    // Create link token
    const response = await client.linkTokenCreate(linkTokenRequest);

    console.log('[Create CRA Link Token] Success! Link token created');
    console.log('[Create CRA Link Token] Expiration:', response.data.expiration);

    return NextResponse.json({
      link_token: response.data.link_token,
      expiration: response.data.expiration,
      request_id: response.data.request_id,
    });

  } catch (error) {
    console.error('[Create CRA Link Token] Error occurred:', error);
    console.error('[Create CRA Link Token] Error stack:', error.stack);

    // Handle Plaid-specific errors
    if (error.response) {
      console.error('[Create CRA Link Token] Plaid API error:', {
        status: error.response.status,
        data: error.response.data,
        error_code: error.response.data?.error_code,
        error_message: error.response.data?.error_message,
        error_type: error.response.data?.error_type,
      });

      // Common Plaid error codes
      const errorMessages = {
        'INVALID_API_KEYS': 'Invalid Plaid API keys. Please check your credentials.',
        'INVALID_CONFIGURATION': 'Invalid Plaid configuration. Please check your settings.',
        'MISSING_FIELDS': 'Missing required fields in the request.',
        'INVALID_FIELD': 'Invalid field value in the request.',
        'INVALID_BODY': 'Invalid request body format.',
        'INVALID_HEADERS': 'Invalid or missing headers. Check API credentials.',
        'UNAUTHORIZED': 'Authentication failed. Check your Plaid credentials.',
        'ITEM_LOGIN_REQUIRED': 'Additional authentication required.',
        'PRODUCTS_NOT_SUPPORTED': 'CRA product not supported in this environment. Please contact support.',
      };

      const errorCode = error.response.data?.error_code;
      const userMessage = errorMessages[errorCode] || error.response.data?.error_message || 'Failed to create CRA link token';

      return NextResponse.json(
        {
          error: userMessage,
          error_code: errorCode,
          error_type: error.response.data?.error_type,
          display_message: error.response.data?.display_message || userMessage,
          request_id: error.response.data?.request_id,
          status_code: error.response.status
        },
        { status: error.response.status || 500 }
      );
    }

    // Handle other errors
    return NextResponse.json(
      {
        error: 'Our servers are experiencing issues. Please try again later.',
        details: error.message || 'An unexpected error occurred',
        type: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST request.' },
    { status: 405 }
  );
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}