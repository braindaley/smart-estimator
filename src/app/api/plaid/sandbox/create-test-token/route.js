import { NextResponse } from 'next/server';
import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';

export async function POST(request) {
  console.log('[Sandbox] Creating test access token');

  try {
    const { userId, institutionId, testUsername } = await request.json();
    console.log('[Sandbox] Request params:', { userId, institutionId, testUsername });

    // Configure Plaid client for sandbox
    const configuration = new Configuration({
      basePath: PlaidEnvironments.sandbox,
      baseOptions: {
        headers: {
          'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
          'PLAID-SECRET': process.env.PLAID_SECRET,
        },
      },
    });

    const client = new PlaidApi(configuration);

    // Create sandbox public token first
    const sandboxResponse = await client.sandboxPublicTokenCreate({
      institution_id: institutionId,
      initial_products: ['transactions', 'assets', 'identity', 'liabilities', 'income'],
      options: {
        webhook: null,
      }
    });

    console.log('[Sandbox] Created sandbox public token');

    // Exchange for access token
    const exchangeResponse = await client.itemPublicTokenExchange({
      public_token: sandboxResponse.data.public_token,
    });

    console.log('[Sandbox] Exchanged for access token');

    return NextResponse.json({
      access_token: exchangeResponse.data.access_token,
      item_id: exchangeResponse.data.item_id,
      public_token: sandboxResponse.data.public_token
    });

  } catch (error) {
    console.error('[Sandbox] Error creating test token:', error);

    if (error.response) {
      console.error('[Sandbox] Plaid API error:', {
        status: error.response.status,
        data: error.response.data,
      });

      return NextResponse.json(
        {
          error: error.response.data?.error_message || 'Failed to create sandbox token',
          error_code: error.response.data?.error_code,
          error_type: error.response.data?.error_type,
        },
        { status: error.response.status || 500 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to create sandbox access token',
        details: error.message
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