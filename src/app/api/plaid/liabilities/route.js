import { NextResponse } from 'next/server';
import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';
import { getToken } from '@/lib/token-store';

export async function POST(request) {
  console.log('[Liabilities] Starting request');
  
  try {
    const { userId, clientToken } = await request.json();
    console.log('[Liabilities] Request params:', { userId, hasClientToken: !!clientToken });

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Try server-side storage first
    let accessToken = getToken(userId);
    console.log('[Liabilities] Server-side token found:', !!accessToken);

    // If no server-side token, try client-side token
    if (!accessToken && clientToken) {
      accessToken = clientToken;
      console.log('[Liabilities] Using client-side token as fallback');
    }

    if (!accessToken) {
      console.log('[Liabilities] No token found in server or client storage');
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

    const response = await client.liabilitiesGet({
      access_token: accessToken,
    });

    console.log('[Liabilities] Success! Retrieved liabilities data for', response.data.accounts.length, 'accounts');

    // Process and structure the liabilities data for debt settlement analysis
    const processedLiabilities = {
      accounts: response.data.accounts.map(account => ({
        account_id: account.account_id,
        name: account.name,
        type: account.type,
        subtype: account.subtype,
        balances: account.balances,
        // Credit card specific data
        credit: account.liabilities?.credit ? {
          aprs: account.liabilities.credit.aprs,
          is_overdue: account.liabilities.credit.is_overdue,
          last_payment_amount: account.liabilities.credit.last_payment_amount,
          last_payment_date: account.liabilities.credit.last_payment_date,
          last_statement_balance: account.liabilities.credit.last_statement_balance,
          last_statement_issue_date: account.liabilities.credit.last_statement_issue_date,
          minimum_payment_amount: account.liabilities.credit.minimum_payment_amount,
          next_payment_due_date: account.liabilities.credit.next_payment_due_date,
        } : null,
        // Mortgage specific data
        mortgage: account.liabilities?.mortgage ? {
          account_number: account.liabilities.mortgage.account_number,
          current_late_fee: account.liabilities.mortgage.current_late_fee,
          escrow_balance: account.liabilities.mortgage.escrow_balance,
          has_pmi: account.liabilities.mortgage.has_pmi,
          has_prepayment_penalty: account.liabilities.mortgage.has_prepayment_penalty,
          interest_rate: account.liabilities.mortgage.interest_rate,
          last_payment_amount: account.liabilities.mortgage.last_payment_amount,
          last_payment_date: account.liabilities.mortgage.last_payment_date,
          loan_term: account.liabilities.mortgage.loan_term,
          loan_type_description: account.liabilities.mortgage.loan_type_description,
          maturity_date: account.liabilities.mortgage.maturity_date,
          next_monthly_payment: account.liabilities.mortgage.next_monthly_payment,
          next_payment_due_date: account.liabilities.mortgage.next_payment_due_date,
          origination_date: account.liabilities.mortgage.origination_date,
          origination_principal_amount: account.liabilities.mortgage.origination_principal_amount,
          past_due_amount: account.liabilities.mortgage.past_due_amount,
          property_address: account.liabilities.mortgage.property_address,
          ytd_interest_paid: account.liabilities.mortgage.ytd_interest_paid,
          ytd_principal_paid: account.liabilities.mortgage.ytd_principal_paid,
        } : null,
        // Student loan specific data
        student: account.liabilities?.student ? {
          account_number: account.liabilities.student.account_number,
          disbursement_dates: account.liabilities.student.disbursement_dates,
          expected_payoff_date: account.liabilities.student.expected_payoff_date,
          guarantor: account.liabilities.student.guarantor,
          interest_rate_percentage: account.liabilities.student.interest_rate_percentage,
          is_overdue: account.liabilities.student.is_overdue,
          last_payment_amount: account.liabilities.student.last_payment_amount,
          last_payment_date: account.liabilities.student.last_payment_date,
          last_statement_issue_date: account.liabilities.student.last_statement_issue_date,
          loan_name: account.liabilities.student.loan_name,
          loan_status: account.liabilities.student.loan_status,
          minimum_payment_amount: account.liabilities.student.minimum_payment_amount,
          next_payment_due_date: account.liabilities.student.next_payment_due_date,
          origination_date: account.liabilities.student.origination_date,
          origination_principal_amount: account.liabilities.student.origination_principal_amount,
          outstanding_interest_amount: account.liabilities.student.outstanding_interest_amount,
          payment_reference_number: account.liabilities.student.payment_reference_number,
          pslf_status: account.liabilities.student.pslf_status,
          repayment_plan: account.liabilities.student.repayment_plan,
          sequence_number: account.liabilities.student.sequence_number,
          servicer_address: account.liabilities.student.servicer_address,
          ytd_interest_paid: account.liabilities.student.ytd_interest_paid,
          ytd_principal_paid: account.liabilities.student.ytd_principal_paid,
        } : null,
      })),
      item: response.data.item,
      // Add summary for debt settlement analysis
      debt_summary: {
        total_credit_card_debt: response.data.accounts
          .filter(acc => acc.type === 'credit')
          .reduce((total, acc) => total + (acc.balances.current || 0), 0),
        total_mortgage_debt: response.data.accounts
          .filter(acc => acc.subtype === 'mortgage')
          .reduce((total, acc) => total + (acc.balances.current || 0), 0),
        total_student_loan_debt: response.data.accounts
          .filter(acc => acc.subtype === 'student')
          .reduce((total, acc) => total + (acc.balances.current || 0), 0),
        overdue_accounts: response.data.accounts.filter(acc => 
          acc.liabilities?.credit?.is_overdue || 
          acc.liabilities?.student?.is_overdue
        ).length,
        accounts_with_minimum_payments: response.data.accounts
          .filter(acc => 
            acc.liabilities?.credit?.minimum_payment_amount || 
            acc.liabilities?.mortgage?.next_monthly_payment || 
            acc.liabilities?.student?.minimum_payment_amount
          )
          .map(acc => ({
            account_id: acc.account_id,
            name: acc.name,
            minimum_payment: acc.liabilities?.credit?.minimum_payment_amount || 
                           acc.liabilities?.mortgage?.next_monthly_payment || 
                           acc.liabilities?.student?.minimum_payment_amount,
            due_date: acc.liabilities?.credit?.next_payment_due_date || 
                     acc.liabilities?.mortgage?.next_payment_due_date || 
                     acc.liabilities?.student?.next_payment_due_date,
          })),
      },
    };

    return NextResponse.json(processedLiabilities);
  } catch (error) {
    console.error('[Liabilities] Error occurred:', error);
    console.error('[Liabilities] Error stack:', error.stack);
    
    // Handle Plaid-specific errors
    if (error.response) {
      console.error('[Liabilities] Plaid API error:', {
        status: error.response.status,
        data: error.response.data,
        error_code: error.response.data?.error_code,
        error_message: error.response.data?.error_message,
        error_type: error.response.data?.error_type,
      });

      // Handle specific Liabilities API errors
      const errorMessages = {
        'PRODUCT_NOT_READY': 'Liabilities data is not yet available. Please try again later.',
        'INSUFFICIENT_CREDENTIALS': 'Additional authentication required to access liabilities data.',
        'ITEM_LOGIN_REQUIRED': 'Please re-authenticate your bank account.',
        'ACCESS_NOT_GRANTED': 'Liabilities access not granted for this account.',
        'NO_LIABILITY_ACCOUNTS': 'No liability accounts found for this user.',
      };

      const errorCode = error.response.data?.error_code;
      const userMessage = errorMessages[errorCode] || error.response.data?.error_message || 'Failed to fetch liabilities data';

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
        error: 'Failed to fetch liabilities data',
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