import { NextResponse } from 'next/server';
import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';
import { getToken } from '@/lib/token-store';

export async function POST(request) {
  console.log('[Accounts] Starting request');
  
  try {
    const { userId, clientToken } = await request.json();
    console.log('[Accounts] Request params:', { userId, hasClientToken: !!clientToken });

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Try server-side storage first
    let accessToken = getToken(userId);
    console.log('[Accounts] Server-side token found:', !!accessToken);

    // If no server-side token, try client-side token
    if (!accessToken && clientToken) {
      accessToken = clientToken;
      console.log('[Accounts] Using client-side token as fallback');
    }

    if (!accessToken) {
      console.log('[Accounts] No token found in server or client storage');
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

    const response = await client.accountsGet({
      access_token: accessToken,
    });

    console.log('[Accounts] Success! Retrieved', response.data.accounts.length, 'accounts');

    return NextResponse.json({
      accounts: response.data.accounts,
      item: response.data.item,
    });
  } catch (error) {
    console.error('[Accounts] Error occurred:', error);
    console.error('[Accounts] Error stack:', error.stack);
    
    // Handle Plaid-specific errors
    if (error.response) {
      console.error('[Accounts] Plaid API error:', {
        status: error.response.status,
        data: error.response.data,
        error_code: error.response.data?.error_code,
        error_message: error.response.data?.error_message,
        error_type: error.response.data?.error_type,
      });

      return NextResponse.json(
        { 
          error: error.response.data?.error_message || 'Failed to fetch accounts',
          error_code: error.response.data?.error_code,
          error_type: error.response.data?.error_type,
          request_id: error.response.data?.request_id,
        },
        { status: error.response.status || 500 }
      );
    }

    // Handle other errors
    return NextResponse.json(
      { 
        error: 'Failed to fetch accounts',
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