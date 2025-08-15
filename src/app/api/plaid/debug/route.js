import { NextResponse } from 'next/server';

export async function GET() {
  // Only show this in non-production for security
  const isDevelopment = process.env.NODE_ENV !== 'production';
  
  return NextResponse.json({
    environment: process.env.NODE_ENV,
    hasPlaidClientId: !!process.env.PLAID_CLIENT_ID,
    hasPlaidSecret: !!process.env.PLAID_SECRET,
    plaidEnv: process.env.PLAID_ENV || 'NOT_SET',
    // Only show partial values in development
    clientIdPreview: isDevelopment && process.env.PLAID_CLIENT_ID 
      ? `${process.env.PLAID_CLIENT_ID.substring(0, 6)}...` 
      : 'NOT_SET',
    allEnvKeys: isDevelopment 
      ? Object.keys(process.env).filter(key => key.includes('PLAID')).sort()
      : 'Hidden in production',
    message: !process.env.PLAID_CLIENT_ID 
      ? 'Environment variables are not being loaded. Check Netlify dashboard settings.'
      : 'Environment variables appear to be configured.'
  });
}