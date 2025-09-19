import { NextResponse } from 'next/server';
import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';

export async function POST(request) {
  console.log('[Sandbox] Simulating income data generation');

  try {
    const { accessToken, itemId } = await request.json();
    console.log('[Sandbox] Request params:', { hasAccessToken: !!accessToken, itemId });

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

    // Use Plaid's sandbox simulation to generate income data
    try {
      const simulateResponse = await client.sandboxItemSetVerificationStatus({
        access_token: accessToken,
        account_id: null, // Apply to all accounts
        verification_status: 'verified'
      });

      console.log('[Sandbox] Verification status set to verified');
    } catch (err) {
      console.log('[Sandbox] Verification status setting failed (may not be needed):', err.message);
    }

    // Try to trigger income webhook/processing
    try {
      const webhookResponse = await client.sandboxItemFireWebhook({
        access_token: accessToken,
        webhook_code: 'INCOME_VERIFICATION_STATUS' // This may trigger income processing
      });

      console.log('[Sandbox] Fired income verification webhook');
    } catch (err) {
      console.log('[Sandbox] Webhook firing failed (may not be supported):', err.message);
    }

    // Now try to fetch income data
    const incomeResponse = await client.incomeGet({
      access_token: accessToken,
    });

    console.log('[Sandbox] Successfully retrieved income data');

    return NextResponse.json({
      success: true,
      income: incomeResponse.data.income,
      item: incomeResponse.data.item
    });

  } catch (error) {
    console.error('[Sandbox] Error simulating income:', error);

    if (error.response) {
      console.error('[Sandbox] Plaid API error:', {
        status: error.response.status,
        data: error.response.data,
      });

      return NextResponse.json(
        {
          error: error.response.data?.error_message || 'Failed to simulate income data',
          error_code: error.response.data?.error_code,
          error_type: error.response.data?.error_type,
        },
        { status: error.response.status || 500 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to simulate income data',
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