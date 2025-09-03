import { NextResponse } from 'next/server';

const SANDBOX_API_KEY = process.env.CPE_API_KEY;
const CPE_SANDBOX_URL = process.env.CPE_SANDBOX_URL;

// Create mock credit data for testing/fallback
function createMockCreditData(body) {
  return {
    trades: [
      {
        customerName: 'CHASE BANK USA N.A.',
        portfolioTypeCode: { description: 'Credit Card', code: 'CC' },
        accountTypeCode: { description: 'Credit Card', code: 'CC' },
        accountNumber: '1234567890123456',
        balance: 2500,
        scheduledPaymentAmount: 75,
        creditLimit: 5000,
        dateOpened: '2020-01-15',
        rate: { description: 'Current' },
        narrativeCodes: [{ description: 'Credit Card Account' }]
      },
      {
        customerName: 'CAPITAL ONE N.A.',
        portfolioTypeCode: { description: 'Credit Card', code: 'CC' },
        accountTypeCode: { description: 'Credit Card', code: 'CC' },
        accountNumber: '9876543210987654',
        balance: 1200,
        scheduledPaymentAmount: 40,
        creditLimit: 3000,
        dateOpened: '2019-06-20',
        rate: { description: 'Current' },
        narrativeCodes: [{ description: 'Credit Card Account' }]
      },
      {
        customerName: 'SOFI LENDING CORP',
        portfolioTypeCode: { description: 'Installment', code: 'IN' },
        accountTypeCode: { description: 'Personal Loan', code: 'PL' },
        accountNumber: '5555666677778888',
        balance: 8500,
        scheduledPaymentAmount: 285,
        highCredit: 10000,
        dateOpened: '2021-03-10',
        rate: { description: 'Current' },
        narrativeCodes: [{ description: 'Personal Loan' }]
      },
      {
        customerName: 'MACYS CREDIT',
        portfolioTypeCode: { description: 'Revolving', code: 'RE' },
        accountTypeCode: { description: 'Retail Credit', code: 'RC' },
        accountNumber: '4444333322221111',
        balance: 450,
        scheduledPaymentAmount: 25,
        creditLimit: 1000,
        dateOpened: '2018-11-05',
        rate: { description: 'Current' },
        narrativeCodes: [{ description: 'Retail Credit Account' }]
      },
      {
        customerName: 'MERCY HOSPITAL',
        portfolioTypeCode: { description: 'Open', code: 'OP' },
        accountTypeCode: { description: 'Medical', code: 'MD' },
        accountNumber: '7777888899990000',
        balance: 750,
        scheduledPaymentAmount: 50,
        dateOpened: '2022-08-15',
        rate: { description: 'Past Due' },
        narrativeCodes: [{ description: 'Medical Account' }]
      },
      {
        customerName: 'BEST BUY CREDIT',
        portfolioTypeCode: { description: 'Revolving', code: 'RE' },
        accountTypeCode: { description: 'Retail Credit', code: 'RC' },
        accountNumber: '2222111100009999',
        balance: 0,
        scheduledPaymentAmount: 0,
        creditLimit: 2500,
        dateOpened: '2017-12-01',
        rate: { description: 'Closed' },
        narrativeCodes: [{ description: 'Retail Credit Account' }]
      }
    ],
    creditScore: {
      score: Math.floor(Math.random() * (750 - 650) + 650), // Random score between 650-750
      range: 'FICO Score 8',
      factors: [
        'Payment history',
        'Credit utilization',
        'Length of credit history',
        'Credit mix'
      ]
    },
    summary: {
      totalAccounts: 6,
      openAccounts: 5,
      totalDebt: 12900,
      monthlyPayments: 475
    },
    consumer: {
      firstName: body.fname || 'Test',
      lastName: body.lname || 'User',
      birthDate: body.dob || '1980-01-01',
      socialSecurity: body.ssn || '123456789'
    },
    addresses: [
      {
        addressLine1: body.address || '123 Test Street',
        city: body.city || 'Test City',
        state: body.state || 'CA',
        zipCode: body.zip || '90210',
        type: 'current',
        dateFirstReported: '2020-01-01',
        dateLastReported: new Date().toISOString().split('T')[0]
      }
    ],
    status: 'success',
    reportDate: new Date().toISOString().split('T')[0],
    timestamp: new Date().toISOString(),
    isMockData: true,
    mockReason: 'Environment variables not configured or API temporarily unavailable'
  };
}

export async function POST(request) {
  console.log('[Credit Check] Starting request');
  console.log('[Credit Check] Using mock data for development/testing');
  
  try {
    // Parse request body for mock data generation
    const body = await request.json();
    console.log('[Credit Check] Request body:', { ...body, ssn: body.ssn ? '***' : undefined });
    
    // Validate required fields for consistency
    const errors = [];
    
    if (!body.fname || body.fname.trim() === '') {
      errors.push('First name is required');
    }
    
    if (!body.lname || body.lname.trim() === '') {
      errors.push('Last name is required');
    }
    
    if (!body.ssn || !/^\d{9}$/.test(body.ssn.replace(/\D/g, ''))) {
      errors.push('Valid 9-digit SSN is required');
    }
    
    if (!body.dob) {
      errors.push('Date of birth is required');
    }
    
    if (!body.address || body.address.trim() === '') {
      errors.push('Address is required');
    }
    
    if (!body.city || body.city.trim() === '') {
      errors.push('City is required');
    }
    
    if (!body.state || body.state.trim() === '') {
      errors.push('State is required');
    }
    
    if (!body.zip || !/^\d{5}$/.test(body.zip)) {
      errors.push('Valid 5-digit ZIP is required');
    }
    
    // Return validation errors if any
    if (errors.length > 0) {
      console.log('[Credit Check] Validation errors:', errors);
      return NextResponse.json(
        { 
          error: true,
          messages: errors
        },
        { status: 400 }
      );
    }
    
    // Return mock data immediately
    console.log('[Credit Check] Returning mock credit data');
    return NextResponse.json(createMockCreditData(body));
    
  } catch (parseError) {
    console.error('[Credit Check] Failed to parse request body:', parseError);
    return NextResponse.json(
      { 
        error: true,
        messages: ['Invalid request format'],
        details: 'Unable to parse request body'
      },
      { status: 400 }
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