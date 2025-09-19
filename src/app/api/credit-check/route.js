import { NextResponse } from 'next/server';

const SANDBOX_API_KEY = process.env.CPE_API_KEY;
const CPE_SANDBOX_URL = process.env.CPE_SANDBOX_URL;

// Transform CPE API response to match frontend expectations
function transformCPEResponse(cpeData, originalRequest) {
  // Start with the raw CPE data
  const transformed = {
    ...cpeData,
    timestamp: new Date().toISOString(),
    reportDate: new Date().toISOString().split('T')[0],
    status: 'success',
    isMockData: false,

    // Preserve original request info
    consumer: {
      firstName: originalRequest.fname,
      lastName: originalRequest.lname,
      birthDate: originalRequest.dob,
      socialSecurity: originalRequest.ssn,
      ...cpeData.consumer
    }
  };

  // Map CPE fields to our expected format if needed
  // The CPE response structure should already match what we expect
  // but we'll ensure consistency

  // If CPE returns creditReport nested object, flatten relevant fields
  if (cpeData.creditReport) {
    transformed.trades = cpeData.creditReport.trades || cpeData.creditReport.tradeLines || [];
    transformed.inquiries = cpeData.creditReport.inquiries || [];
    transformed.addresses = cpeData.creditReport.addresses || [];
    transformed.employments = cpeData.creditReport.employments || [];
    transformed.bankruptcies = cpeData.creditReport.bankruptcies || cpeData.creditReport.publicRecords || [];
    transformed.collections = cpeData.creditReport.collections || [];
    transformed.creditScore = cpeData.creditReport.creditScore || cpeData.creditReport.score;
    transformed.fraudIDScanAlertCodes = cpeData.creditReport.fraudIDScanAlertCodes || [];

    // Calculate summary if not provided
    if (!transformed.summary && transformed.trades) {
      const openTrades = transformed.trades.filter(t =>
        t.rate && t.rate.description &&
        !t.rate.description.toLowerCase().includes('closed')
      );

      transformed.summary = {
        totalAccounts: transformed.trades.length,
        openAccounts: openTrades.length,
        totalDebt: openTrades.reduce((sum, t) => sum + (t.balance || 0), 0),
        monthlyPayments: openTrades.reduce((sum, t) => sum + (t.scheduledPaymentAmount || 0), 0)
      };
    }
  }

  // Ensure trades/accounts have consistent field names
  if (transformed.trades && Array.isArray(transformed.trades)) {
    transformed.trades = transformed.trades.map(trade => ({
      ...trade,
      // Ensure consistent field names
      customerName: trade.customerName || trade.creditorName || trade.subscriber?.name,
      accountNumber: trade.accountNumber || trade.account,
      balance: trade.balance || trade.currentBalance,
      scheduledPaymentAmount: trade.scheduledPaymentAmount || trade.paymentAmount || trade.monthlyPayment,
      creditLimit: trade.creditLimit || trade.limit,
      highCredit: trade.highCredit || trade.highBalance,
      dateOpened: trade.dateOpened || trade.openDate,
      dateReported: trade.dateReported || trade.reportedDate,
      lastActivityDate: trade.lastActivityDate || trade.lastActive,
      lastPaymentDate: trade.lastPaymentDate || trade.lastPaid,
      actualPaymentAmount: trade.actualPaymentAmount || trade.lastPaymentAmount,
      pastDueAmount: trade.pastDueAmount || trade.pastDue,
      monthsReviewed: trade.monthsReviewed || trade.monthsHistory,
      customerNumber: trade.customerNumber || trade.subscriberNumber
    }));
  }

  return transformed;
}

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

  try {
    // Parse request body
    const body = await request.json();
    console.log('[Credit Check] Request body:', { ...body, ssn: body.ssn ? '***' : undefined });

    // Validate required fields
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

    // Check if environment variables are configured
    if (!SANDBOX_API_KEY || !CPE_SANDBOX_URL) {
      console.log('[Credit Check] API credentials not configured, using mock data');
      return NextResponse.json({
        ...createMockCreditData(body),
        isMockData: true,
        mockReason: 'API credentials not configured'
      });
    }

    // Prepare request data for CPE API (form-urlencoded format)
    const formData = new URLSearchParams();
    formData.append('apikey', SANDBOX_API_KEY);
    formData.append('fname', body.fname.trim());
    formData.append('lname', body.lname.trim());
    formData.append('ssn', body.ssn.replace(/\D/g, '')); // Remove any non-digits
    formData.append('dob', body.dob); // Already in YYYY-MM-DD format
    formData.append('address', body.address.trim());
    formData.append('city', body.city.trim());
    formData.append('state', body.state.trim().toUpperCase()); // Convert to uppercase
    formData.append('zip', body.zip.trim());

    console.log('[Credit Check] Calling CPE API...');
    console.log('[Credit Check] URL:', CPE_SANDBOX_URL);

    try {
      // Make request to CPE API
      const cpeResponse = await fetch(CPE_SANDBOX_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString()
      });

      const responseText = await cpeResponse.text();
      console.log('[Credit Check] CPE Response Status:', cpeResponse.status);
      console.log('[Credit Check] CPE Response Headers:', Object.fromEntries(cpeResponse.headers.entries()));

      // Try to parse as JSON
      let cpeData;
      try {
        cpeData = JSON.parse(responseText);
        console.log('[Credit Check] CPE Response parsed as JSON');
      } catch (jsonError) {
        console.log('[Credit Check] Response is not JSON, raw response:', responseText.substring(0, 500));

        // If not JSON, might be HTML error page
        if (responseText.includes('<html') || responseText.includes('<!DOCTYPE')) {
          console.log('[Credit Check] Received HTML response, API may be down or credentials invalid');
          return NextResponse.json({
            ...createMockCreditData(body),
            isMockData: true,
            mockReason: 'CPE API returned HTML instead of JSON (API may be down)',
            apiResponse: {
              status: cpeResponse.status,
              statusText: cpeResponse.statusText,
              isHtml: true
            }
          });
        }

        // Return raw response for debugging
        return NextResponse.json({
          ...createMockCreditData(body),
          isMockData: true,
          mockReason: 'CPE API returned non-JSON response',
          rawResponse: responseText.substring(0, 1000)
        });
      }

      // Check for API errors
      if (cpeData.error) {
        console.log('[Credit Check] CPE API returned error:', cpeData);

        // If it's a validation error, return it
        if (cpeData.messages && Array.isArray(cpeData.messages)) {
          return NextResponse.json(
            {
              error: true,
              messages: cpeData.messages
            },
            { status: 400 }
          );
        }

        // Otherwise use mock data with error info
        return NextResponse.json({
          ...createMockCreditData(body),
          isMockData: true,
          mockReason: 'CPE API returned error',
          apiError: cpeData
        });
      }

      // Handle different response statuses
      if (!cpeResponse.ok) {
        console.log('[Credit Check] CPE API request failed with status:', cpeResponse.status);

        if (cpeResponse.status === 401) {
          return NextResponse.json({
            ...createMockCreditData(body),
            isMockData: true,
            mockReason: 'Invalid API credentials (401 Unauthorized)'
          });
        }

        if (cpeResponse.status === 500) {
          return NextResponse.json({
            ...createMockCreditData(body),
            isMockData: true,
            mockReason: 'CPE API internal error (500)'
          });
        }

        return NextResponse.json({
          ...createMockCreditData(body),
          isMockData: true,
          mockReason: `CPE API error (Status: ${cpeResponse.status})`
        });
      }

      // Successfully got data from CPE
      console.log('[Credit Check] Successfully received CPE data');

      // Transform CPE response to match our frontend expectations
      const transformedData = transformCPEResponse(cpeData, body);

      return NextResponse.json(transformedData);

    } catch (fetchError) {
      console.error('[Credit Check] Error calling CPE API:', fetchError);
      return NextResponse.json({
        ...createMockCreditData(body),
        isMockData: true,
        mockReason: `Network error: ${fetchError.message}`
      });
    }

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