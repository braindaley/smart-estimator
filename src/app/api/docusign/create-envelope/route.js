import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      userId,
      signerName,
      signerEmail,
      signerPhone,
      hasCoApplicant,
      coApplicantName,
      coApplicantEmail,
      coApplicantPhone,
      momentumResults
    } = body;

    // Validate required fields
    if (!userId || !signerName || !signerEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check for DocuSign credentials in environment variables
    const accountId = process.env.DOCUSIGN_ACCOUNT_ID;
    const integrationKey = process.env.DOCUSIGN_INTEGRATION_KEY;
    const userId_ds = process.env.DOCUSIGN_USER_ID;
    const privateKey = process.env.DOCUSIGN_PRIVATE_KEY;

    if (!accountId || !integrationKey || !userId_ds || !privateKey) {
      console.error('[DocuSign] Missing DocuSign credentials in environment variables');
      return NextResponse.json(
        { error: 'DocuSign configuration error. Please contact support.' },
        { status: 500 }
      );
    }

    // For now, we'll create a mock envelope response
    // In production, you would:
    // 1. Initialize DocuSign API client
    // 2. Create envelope with document
    // 3. Add recipients (signer + co-applicant if applicable)
    // 4. Send envelope

    const mockEnvelopeId = `env-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Mock signing URLs
    const signingUrl = `https://demo.docusign.net/Signing/StartInSession.aspx?code=${mockEnvelopeId}&signerToken=primary`;
    const coApplicantSigningUrl = hasCoApplicant
      ? `https://demo.docusign.net/Signing/StartInSession.aspx?code=${mockEnvelopeId}&signerToken=coapplicant`
      : null;

    // Store envelope data in session or database
    // This is a mock - in production, you'd store this properly
    const envelopeData = {
      envelopeId: mockEnvelopeId,
      userId,
      status: 'sent',
      createdAt: new Date().toISOString(),
      primarySigner: {
        name: signerName,
        email: signerEmail,
        phone: signerPhone,
        status: 'pending',
        signingUrl
      },
      coApplicant: hasCoApplicant ? {
        name: coApplicantName,
        email: coApplicantEmail,
        phone: coApplicantPhone,
        status: 'pending',
        signingUrl: coApplicantSigningUrl
      } : null,
      momentumResults
    };

    console.log('[DocuSign] Envelope created:', mockEnvelopeId);

    return NextResponse.json({
      success: true,
      envelopeId: mockEnvelopeId,
      signingUrl,
      coApplicantSigningUrl,
      envelopeData
    });

  } catch (error) {
    console.error('[DocuSign] Error creating envelope:', error);
    return NextResponse.json(
      { error: 'Failed to create DocuSign envelope', details: error.message },
      { status: 500 }
    );
  }
}
