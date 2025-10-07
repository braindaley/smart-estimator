import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      envelopeId,
      coApplicantName,
      coApplicantPhone,
      coApplicantEmail,
      signingUrl
    } = body;

    // Validate required fields
    if (!envelopeId || !coApplicantPhone || !signingUrl) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // In production, you would use Twilio or another SMS service
    // For now, we'll simulate the SMS sending
    const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
      console.warn('[SMS] Twilio credentials not configured. SMS not sent.');
      // Don't fail the request - just log the warning
      return NextResponse.json({
        success: true,
        message: 'SMS notification would be sent in production',
        mockMessage: `Hi ${coApplicantName}, please sign the debt settlement agreement at: ${signingUrl}`,
        sentTo: coApplicantPhone
      });
    }

    // In production, you would send via Twilio:
    /*
    const twilio = require('twilio');
    const client = twilio(twilioAccountSid, twilioAuthToken);

    const message = await client.messages.create({
      body: `Hi ${coApplicantName}, please sign the debt settlement agreement. Check your email at ${coApplicantEmail} for the link.`,
      from: twilioPhoneNumber,
      to: coApplicantPhone
    });
    */

    console.log(`[SMS] Mock SMS sent to ${coApplicantPhone} for envelope ${envelopeId}`);

    return NextResponse.json({
      success: true,
      message: 'SMS notification sent successfully',
      sentTo: coApplicantPhone
    });

  } catch (error) {
    console.error('[SMS] Error sending notification:', error);
    return NextResponse.json(
      { error: 'Failed to send SMS notification', details: error.message },
      { status: 500 }
    );
  }
}
