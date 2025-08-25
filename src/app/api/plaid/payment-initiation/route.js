import { NextResponse } from 'next/server';
import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';
import { getToken } from '@/lib/token-store';

export async function POST(request) {
  console.log('[Payment Initiation] Starting request');
  
  try {
    const { userId, action, clientToken, ...paymentData } = await request.json();
    console.log('[Payment Initiation] Request params:', { userId, action, hasClientToken: !!clientToken });

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (!action) {
      return NextResponse.json(
        { error: 'Action is required (create_recipient, create_payment, get_payment)' },
        { status: 400 }
      );
    }

    // Try server-side storage first
    let accessToken = getToken(userId);
    console.log('[Payment Initiation] Server-side token found:', !!accessToken);

    // If no server-side token, try client-side token
    if (!accessToken && clientToken) {
      accessToken = clientToken;
      console.log('[Payment Initiation] Using client-side token as fallback');
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

    switch (action) {
      case 'create_recipient':
        return await createPaymentRecipient(client, paymentData);
      
      case 'create_payment':
        if (!accessToken) {
          return NextResponse.json(
            { error: 'Access token not found. Please link your account first.' },
            { status: 401 }
          );
        }
        return await createPayment(client, accessToken, paymentData);
      
      case 'get_payment':
        return await getPayment(client, paymentData);
      
      default:
        return NextResponse.json(
          { error: 'Invalid action. Must be create_recipient, create_payment, or get_payment' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('[Payment Initiation] Error occurred:', error);
    console.error('[Payment Initiation] Error stack:', error.stack);
    
    // Handle Plaid-specific errors
    if (error.response) {
      console.error('[Payment Initiation] Plaid API error:', {
        status: error.response.status,
        data: error.response.data,
        error_code: error.response.data?.error_code,
        error_message: error.response.data?.error_message,
        error_type: error.response.data?.error_type,
      });

      // Handle specific Payment Initiation API errors
      const errorMessages = {
        'PAYMENT_INITIATION_UNAVAILABLE': 'Payment initiation is not available for this account.',
        'INSUFFICIENT_FUNDS': 'Insufficient funds for this payment.',
        'INVALID_ACCOUNT': 'Invalid account selected for payment.',
        'PAYMENT_REJECTED': 'Payment was rejected by the bank.',
        'PAYMENT_FAILED': 'Payment failed to process.',
        'RECIPIENT_NOT_FOUND': 'Payment recipient not found.',
        'UNAUTHORIZED': 'Payment authorization failed.',
        'INVALID_PAYMENT_AMOUNT': 'Invalid payment amount specified.',
      };

      const errorCode = error.response.data?.error_code;
      const userMessage = errorMessages[errorCode] || error.response.data?.error_message || 'Payment initiation failed';

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
        error: 'Payment initiation failed',
        details: error.message || 'An unexpected error occurred',
        type: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}

async function createPaymentRecipient(client, data) {
  const { name, iban, address } = data;
  
  if (!name || !iban) {
    return NextResponse.json(
      { error: 'Recipient name and IBAN are required' },
      { status: 400 }
    );
  }

  const response = await client.paymentInitiationRecipientCreate({
    name,
    iban,
    address: address || {
      street: [''],
      city: '',
      postal_code: '',
      country: 'US'
    }
  });

  console.log('[Payment Initiation] Recipient created:', response.data.recipient_id);

  return NextResponse.json({
    recipient_id: response.data.recipient_id,
    request_id: response.data.request_id,
  });
}

async function createPayment(client, accessToken, data) {
  const { recipient_id, amount, currency = 'USD', reference, account_id } = data;
  
  if (!recipient_id || !amount) {
    return NextResponse.json(
      { error: 'Recipient ID and amount are required' },
      { status: 400 }
    );
  }

  const paymentRequest = {
    recipient_id,
    reference: reference || `Settlement Payment ${new Date().toISOString()}`,
    amount: {
      currency: currency.toUpperCase(),
      value: amount.toString()
    }
  };

  // If specific account is provided, include it
  if (account_id) {
    paymentRequest.account_id = account_id;
  }

  const response = await client.paymentInitiationPaymentCreate(paymentRequest);

  console.log('[Payment Initiation] Payment created:', response.data.payment_id);

  return NextResponse.json({
    payment_id: response.data.payment_id,
    payment_token: response.data.payment_token,
    link_token: response.data.link_token,
    status: response.data.status,
    request_id: response.data.request_id,
  });
}

async function getPayment(client, data) {
  const { payment_id } = data;
  
  if (!payment_id) {
    return NextResponse.json(
      { error: 'Payment ID is required' },
      { status: 400 }
    );
  }

  const response = await client.paymentInitiationPaymentGet({
    payment_id
  });

  console.log('[Payment Initiation] Payment retrieved:', payment_id);

  return NextResponse.json({
    payment_id: response.data.payment_id,
    payment_token: response.data.payment_token,
    reference: response.data.reference,
    amount: response.data.amount,
    status: response.data.status,
    status_update_datetime: response.data.status_update_datetime,
    recipient_id: response.data.recipient_id,
    last_status_update: response.data.last_status_update,
    failure_reason: response.data.failure_reason,
    request_id: response.data.request_id,
  });
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