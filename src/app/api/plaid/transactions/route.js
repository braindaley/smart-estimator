import { NextResponse } from 'next/server';
import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';
import { getToken } from '@/lib/token-store';

export async function POST(request) {
  console.log('[Transactions] Starting request');
  
  try {
    const { userId, startDate, endDate, clientToken } = await request.json();
    console.log('[Transactions] Request params:', { userId, startDate, endDate, hasClientToken: !!clientToken });

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Try server-side storage first
    let accessToken = getToken(userId);
    console.log('[Transactions] Server-side token found:', !!accessToken);

    // If no server-side token, try client-side token
    if (!accessToken && clientToken) {
      accessToken = clientToken;
      console.log('[Transactions] Using client-side token as fallback');
    }

    if (!accessToken) {
      console.log('[Transactions] No token found in server or client storage');
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

    // Default to last 12 months if no dates provided
    const endDateFormatted = endDate || new Date().toISOString().split('T')[0];
    const startDateFormatted = startDate || new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    console.log('[Transactions] Date range:', { startDateFormatted, endDateFormatted });

    const response = await client.transactionsGet({
      access_token: accessToken,
      start_date: startDateFormatted,
      end_date: endDateFormatted,
    });

    console.log('[Transactions] Success! Retrieved', response.data.transactions.length, 'transactions');

    return NextResponse.json({
      transactions: response.data.transactions,
      accounts: response.data.accounts,
      total_transactions: response.data.total_transactions,
      item: response.data.item,
    });
  } catch (error) {
    console.error('[Transactions] Error occurred:', error);
    console.error('[Transactions] Error stack:', error.stack);
    
    // Handle Plaid-specific errors
    if (error.response) {
      console.error('[Transactions] Plaid API error:', {
        status: error.response.status,
        data: error.response.data,
        error_code: error.response.data?.error_code,
        error_message: error.response.data?.error_message,
        error_type: error.response.data?.error_type,
      });

      return NextResponse.json(
        { 
          error: error.response.data?.error_message || 'Failed to fetch transactions',
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
        error: 'Failed to fetch transactions',
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