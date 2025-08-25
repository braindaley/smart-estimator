import { NextResponse } from 'next/server';
import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';
import { getToken } from '@/lib/token-store';

export async function POST(request) {
  console.log('[Income] Starting request');
  
  try {
    const { userId, clientToken } = await request.json();
    console.log('[Income] Request params:', { userId, hasClientToken: !!clientToken });

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Try server-side storage first
    let accessToken = getToken(userId);
    console.log('[Income] Server-side token found:', !!accessToken);

    // If no server-side token, try client-side token
    if (!accessToken && clientToken) {
      accessToken = clientToken;
      console.log('[Income] Using client-side token as fallback');
    }

    if (!accessToken) {
      console.log('[Income] No token found in server or client storage');
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

    const response = await client.incomeGet({
      access_token: accessToken,
    });

    console.log('[Income] Success! Retrieved income data for', response.data.income.income_streams.length, 'income streams');

    // Process and structure the income data for debt settlement analysis
    const processedIncome = {
      income_streams: response.data.income.income_streams.map(stream => ({
        account_id: stream.account_id,
        name: stream.name,
        confidence: stream.confidence,
        days: stream.days,
        monthly_income: stream.monthly_income,
        // Employment data
        employer: stream.employer ? {
          employer_name: stream.employer.employer_name,
          employer_address: stream.employer.employer_address,
        } : null,
        // Income breakdown
        income_breakdown: stream.income_breakdown ? {
          type: stream.income_breakdown.type,
          rate: stream.income_breakdown.rate,
          hours_per_week: stream.income_breakdown.hours_per_week,
          pay_frequency: stream.income_breakdown.pay_frequency,
        } : null,
      })),
      // Summary for settlement analysis
      income_summary: {
        total_monthly_income: response.data.income.income_streams.reduce(
          (total, stream) => total + (stream.monthly_income || 0), 0
        ),
        total_annual_income: response.data.income.income_streams.reduce(
          (total, stream) => total + (stream.monthly_income || 0) * 12, 0
        ),
        primary_income_stream: response.data.income.income_streams
          .sort((a, b) => (b.monthly_income || 0) - (a.monthly_income || 0))[0],
        income_stability: response.data.income.income_streams
          .reduce((sum, stream) => sum + (stream.confidence || 0), 0) / 
          response.data.income.income_streams.length,
        employment_status: response.data.income.income_streams
          .filter(stream => stream.employer && stream.employer.employer_name)
          .map(stream => ({
            employer: stream.employer.employer_name,
            monthly_income: stream.monthly_income,
            confidence: stream.confidence,
          })),
      },
      item: response.data.item,
    };

    return NextResponse.json(processedIncome);
  } catch (error) {
    console.error('[Income] Error occurred:', error);
    console.error('[Income] Error stack:', error.stack);
    
    // Handle Plaid-specific errors
    if (error.response) {
      console.error('[Income] Plaid API error:', {
        status: error.response.status,
        data: error.response.data,
        error_code: error.response.data?.error_code,
        error_message: error.response.data?.error_message,
        error_type: error.response.data?.error_type,
      });

      // Handle specific Income API errors
      const errorMessages = {
        'PRODUCT_NOT_READY': 'Income data is not yet available. Please try again later.',
        'INSUFFICIENT_CREDENTIALS': 'Additional authentication required to access income data.',
        'ITEM_LOGIN_REQUIRED': 'Please re-authenticate your bank account.',
        'ACCESS_NOT_GRANTED': 'Income access not granted for this account.',
        'INCOME_VERIFICATION_UNAVAILABLE': 'Income verification is not available for this account.',
        'INSUFFICIENT_INCOME_DATA': 'Insufficient income data available for analysis.',
      };

      const errorCode = error.response.data?.error_code;
      const userMessage = errorMessages[errorCode] || error.response.data?.error_message || 'Failed to fetch income data';

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
        error: 'Failed to fetch income data',
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