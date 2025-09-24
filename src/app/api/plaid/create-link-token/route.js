import { NextResponse } from 'next/server';
import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';

export async function POST(request) {
  console.log('[Create Link Token] Starting request');
  
  try {
    // Check environment variables
    const requiredEnvVars = {
      PLAID_CLIENT_ID: process.env.PLAID_CLIENT_ID,
      PLAID_SECRET: process.env.PLAID_SECRET,
      PLAID_ENV: process.env.PLAID_ENV
    };

    console.log('[Create Link Token] Environment check:', {
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
      console.error('[Create Link Token] Missing environment variables:', missingVars);
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
    const { userId } = await request.json();
    console.log('[Create Link Token] Request userId:', userId);

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Configure Plaid client
    const plaidEnv = requiredEnvVars.PLAID_ENV.toLowerCase();
    console.log('[Create Link Token] Using Plaid environment:', plaidEnv);

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

    // Create link token request using string literals instead of constants
    const linkTokenRequest = {
      user: {
        client_user_id: userId,
      },
      client_name: 'Smart Estimator',
      products: ['assets', 'identity', 'liabilities', 'transactions'], // Core products for debt settlement + transactions
      country_codes: ['US'], // Use string literal instead of CountryCode.Us
      language: 'en',
    };

    console.log('[Create Link Token] Request configuration:', linkTokenRequest);

    // Create link token
    const response = await client.linkTokenCreate(linkTokenRequest);
    
    console.log('[Create Link Token] Success! Link token created');
    console.log('[Create Link Token] Expiration:', response.data.expiration);

    return NextResponse.json({
      link_token: response.data.link_token,
      expiration: response.data.expiration,
      request_id: response.data.request_id,
    });
    
  } catch (error) {
    console.error('[Create Link Token] Error occurred:', error);
    console.error('[Create Link Token] Error stack:', error.stack);
    
    // Handle Plaid-specific errors
    if (error.response) {
      console.error('[Create Link Token] Plaid API error:', {
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
      };

      const errorCode = error.response.data?.error_code;
      const userMessage = errorMessages[errorCode] || error.response.data?.error_message || 'Failed to create link token';

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

    // Handle import/module errors
    if (error.message.includes('Cannot read properties') || error.message.includes('is not a function')) {
      console.error('[Create Link Token] Module/Import error - likely Plaid library issue');
      return NextResponse.json(
        { 
          error: 'Server configuration error',
          details: 'Plaid library configuration issue. Please check dependencies.',
          message: 'The server encountered a configuration problem. Please contact support.'
        },
        { status: 500 }
      );
    }

    // Handle network errors
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      console.error('[Create Link Token] Network error:', error.code);
      return NextResponse.json(
        { 
          error: 'Unable to connect to Plaid servers',
          details: 'Please check your internet connection and try again.'
        },
        { status: 503 }
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