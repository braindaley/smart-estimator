import { NextResponse } from 'next/server';
import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';
import { getToken } from '@/lib/token-store';

export async function POST(request) {
  console.log('[Identity] Starting request');
  
  try {
    const { userId, clientToken } = await request.json();
    console.log('[Identity] Request params:', { userId, hasClientToken: !!clientToken });

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Try server-side storage first
    let accessToken = getToken(userId);
    console.log('[Identity] Server-side token found:', !!accessToken);

    // If no server-side token, try client-side token
    if (!accessToken && clientToken) {
      accessToken = clientToken;
      console.log('[Identity] Using client-side token as fallback');
    }

    if (!accessToken) {
      console.log('[Identity] No token found in server or client storage');
      return NextResponse.json(
        { error: 'Access token not found. Please link your account first.' },
        { status: 401 }
      );
    }

    // Configure Plaid client
    const configuration = new Configuration({
      basePath: PlaidEnvironments[process.env.PLAID_ENV?.toLowerCase()] || PlaidEnvironments.sandbox,
      baseOptions: {
        headers: {
          'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
          'PLAID-SECRET': process.env.PLAID_SECRET,
        },
      },
    });

    const client = new PlaidApi(configuration);

    const response = await client.identityGet({
      access_token: accessToken,
    });

    console.log('[Identity] Success! Retrieved identity data for', response.data.accounts.length, 'accounts');

    // Process and structure the identity data for easier use
    const processedIdentity = {
      accounts: response.data.accounts.map(account => ({
        account_id: account.account_id,
        name: account.name,
        type: account.type,
        subtype: account.subtype,
        owners: account.owners.map(owner => ({
          names: owner.names,
          phone_numbers: owner.phone_numbers,
          emails: owner.emails,
          addresses: owner.addresses.map(address => ({
            data: address.data,
            primary: address.primary,
          })),
        })),
      })),
      item: response.data.item,
    };

    return NextResponse.json(processedIdentity);
  } catch (error) {
    console.error('[Identity] Error occurred:', error);
    console.error('[Identity] Error stack:', error.stack);
    
    // Handle Plaid-specific errors
    if (error.response) {
      console.error('[Identity] Plaid API error:', {
        status: error.response.status,
        data: error.response.data,
        error_code: error.response.data?.error_code,
        error_message: error.response.data?.error_message,
        error_type: error.response.data?.error_type,
      });

      // Handle specific Identity API errors
      const errorMessages = {
        'PRODUCT_NOT_READY': 'Identity data is not yet available. Please try again later.',
        'INSUFFICIENT_CREDENTIALS': 'Additional authentication required to access identity data.',
        'ITEM_LOGIN_REQUIRED': 'Please re-authenticate your bank account.',
        'ACCESS_NOT_GRANTED': 'Identity access not granted for this account.',
      };

      const errorCode = error.response.data?.error_code;
      const userMessage = errorMessages[errorCode] || error.response.data?.error_message || 'Failed to fetch identity data';

      return NextResponse.json(
        { 
          error: userMessage,
          error_code: errorCode,
          error_type: error.response.data?.error_type,
          request_id: error.response.data?.request_id,
        },
        { status: error.response.status || 500 }
      );
    }

    // Handle other errors
    return NextResponse.json(
      { 
        error: 'Failed to fetch identity data',
        details: error.message || 'An unexpected error occurred',
        type: 'INTERNAL_ERROR'
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