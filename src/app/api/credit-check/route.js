import { NextResponse } from 'next/server';

const SANDBOX_API_KEY = 'f88ca7-daad2a-9646e5-fb18c3-153d9b';
const CPE_SANDBOX_URL = 'https://sandbox.creditpullengine.com/pull';

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
    
    // Clean SSN (remove any dashes or spaces)
    const cleanSSN = body.ssn.replace(/\D/g, '');
    
    // Prepare request data for CPE API
    const cpeRequestData = {
      fname: body.fname.trim(),
      lname: body.lname.trim(),
      ssn: cleanSSN,
      dob: body.dob,
      address: body.address.trim(),
      city: body.city.trim(),
      state: body.state.toUpperCase(),
      zip: body.zip
    };
    
    console.log('[Credit Check] Sending to CPE API:', { ...cpeRequestData, ssn: '***' });
    
    // Build URL with API key
    const url = `${CPE_SANDBOX_URL}?apikey=${SANDBOX_API_KEY}`;
    
    // Make request to CPE API
    const cpeResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(cpeRequestData).toString()
    });
    
    console.log('[Credit Check] CPE Response status:', cpeResponse.status);
    
    // Get response text first for debugging
    const responseText = await cpeResponse.text();
    console.log('[Credit Check] CPE Response text (first 500 chars):', responseText.substring(0, 500));
    
    // Try to parse as JSON
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (parseError) {
      console.error('[Credit Check] Failed to parse CPE response as JSON:', parseError);
      // If not JSON, return the raw response
      responseData = { 
        rawResponse: responseText,
        isHtml: responseText.includes('<html') || responseText.includes('<!DOCTYPE')
      };
    }
    
    // Check for CPE API errors
    if (responseData.error) {
      console.error('[Credit Check] CPE API returned error:', responseData);
      return NextResponse.json(
        { 
          error: true,
          messages: responseData.messages || ['Failed to retrieve credit report'],
          details: responseData
        },
        { status: 400 }
      );
    }
    
    // If response is not OK but no error field
    if (!cpeResponse.ok) {
      console.error('[Credit Check] CPE API request failed with status:', cpeResponse.status);
      return NextResponse.json(
        { 
          error: true,
          messages: ['Credit report service temporarily unavailable'],
          status: cpeResponse.status,
          details: responseData
        },
        { status: cpeResponse.status }
      );
    }
    
    // Success - return the credit report data
    console.log('[Credit Check] Success! Credit report retrieved');
    
    // Add some mock credit score data for demonstration
    // In production, this would come from the actual CPE response
    const enhancedResponse = {
      ...responseData,
      creditScore: {
        score: Math.floor(Math.random() * (850 - 300) + 300), // Random score for demo
        range: 'FICO Score 8',
        factors: [
          'Payment history',
          'Credit utilization',
          'Length of credit history',
          'Credit mix'
        ]
      },
      summary: {
        totalAccounts: Math.floor(Math.random() * 20 + 5),
        openAccounts: Math.floor(Math.random() * 10 + 2),
        totalDebt: Math.floor(Math.random() * 50000 + 5000),
        monthlyPayments: Math.floor(Math.random() * 2000 + 500)
      },
      timestamp: new Date().toISOString()
    };
    
    return NextResponse.json(enhancedResponse);
    
  } catch (error) {
    console.error('[Credit Check] Error occurred:', error);
    console.error('[Credit Check] Error stack:', error.stack);
    
    // Handle network errors
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return NextResponse.json(
        { 
          error: true,
          messages: ['Unable to connect to credit report service'],
          details: 'Please check your internet connection and try again.'
        },
        { status: 503 }
      );
    }
    
    // Handle other errors
    return NextResponse.json(
      { 
        error: true,
        messages: ['An unexpected error occurred'],
        details: error.message || 'Please try again later',
        timestamp: new Date().toISOString()
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