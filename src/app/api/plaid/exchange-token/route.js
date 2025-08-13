import { NextResponse } from 'next/server';
import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';
import { storeToken } from '@/lib/token-store';

export async function POST(request) {
  console.log('[Exchange Token] Starting request');
  
  try {
    const { public_token, userId } = await request.json();
    console.log('[Exchange Token] Request params:', { hasPublicToken: !!public_token, userId });

    if (!public_token || !userId) {
      return NextResponse.json(
        { error: 'Public token and user ID are required' },
        { status: 400 }
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

    const response = await client.itemPublicTokenExchange({
      public_token,
    });

    const accessToken = response.data.access_token;
    const itemId = response.data.item_id;

    console.log('[Exchange Token] Success! Access token obtained');

    // Store the access token in memory
    storeToken(userId, accessToken);

    return NextResponse.json({
      access_token: accessToken,
      item_id: itemId,
      success: true,
    });
  } catch (error) {
    console.error('[Exchange Token] Error occurred:', error);
    console.error('[Exchange Token] Error stack:', error.stack);
    
    // Handle Plaid-specific errors
    if (error.response) {
      console.error('[Exchange Token] Plaid API error:', {
        status: error.response.status,
        data: error.response.data,
        error_code: error.response.data?.error_code,
        error_message: error.response.data?.error_message,
        error_type: error.response.data?.error_type,
      });

      return NextResponse.json(
        { 
          error: error.response.data?.error_message || 'Failed to exchange public token',
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
        error: 'Failed to exchange public token',
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