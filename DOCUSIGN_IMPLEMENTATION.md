# DocuSign Integration Implementation

## Overview
This document outlines the DocuSign signing flow implementation for the Momentum Plan debt settlement agreement.

## Features Implemented

### 1. "Start My Plan" CTA Button
- **Location**: `/your-plan/results` page, within the Momentum Plan section of the ResultsTable component
- **File Modified**: `src/app/your-plan/results/ResultsTable.js`
- **Functionality**: Navigates users to the DocuSign signing flow at `/your-plan/docusign`

### 2. DocuSign Signing Flow Page
- **Location**: `/your-plan/docusign`
- **File**: `src/app/your-plan/docusign/page.js`
- **Steps**:
  1. **Review Step**: Display agreement summary with plan details, signer info, and co-applicant info (if applicable)
  2. **Signing Step**: Button to open DocuSign signing interface in a new window
  3. **Waiting for Co-Applicant**: Displayed after primary signer completes if co-applicant exists
  4. **Complete Step**: Success confirmation after all signatures are collected

### 3. API Routes

#### Create Envelope Route
- **Endpoint**: `POST /api/docusign/create-envelope`
- **File**: `src/app/api/docusign/create-envelope/route.js`
- **Purpose**: Creates a DocuSign envelope with the debt settlement agreement
- **Parameters**:
  - `userId`: User identifier
  - `signerName`: Primary signer's full name
  - `signerEmail`: Primary signer's email
  - `signerPhone`: Primary signer's phone number
  - `hasCoApplicant`: Boolean indicating if co-applicant exists
  - `coApplicantName`: Co-applicant's name (if applicable)
  - `coApplicantEmail`: Co-applicant's email (if applicable)
  - `coApplicantPhone`: Co-applicant's phone number (if applicable)
  - `momentumResults`: Plan details (monthly payment, term, total debt, etc.)

#### SMS Notification Route
- **Endpoint**: `POST /api/docusign/notify-coapplicant`
- **File**: `src/app/api/docusign/notify-coapplicant/route.js`
- **Purpose**: Sends SMS notification to co-applicant with signing link
- **Parameters**:
  - `envelopeId`: DocuSign envelope identifier
  - `coApplicantName`: Co-applicant's name
  - `coApplicantPhone`: Co-applicant's phone number
  - `coApplicantEmail`: Co-applicant's email
  - `signingUrl`: DocuSign signing URL for co-applicant

## Data Flow

1. User completes the multi-step verification flow (phone verification, co-applicant detection, bank connection, credit check)
2. User views their Momentum Plan on the results page
3. User clicks "Start My Plan" button
4. System loads user data from session storage:
   - Phone data from phone verification step
   - Credit/personal info (name, address, etc.)
   - Co-applicant information (if applicable)
   - Momentum plan results
5. System creates DocuSign envelope via API
6. Primary signer completes their signature
7. If co-applicant exists:
   - SMS notification sent to co-applicant's phone
   - Co-applicant receives signing link
   - System waits for co-applicant signature
8. Agreement finalized when all signatures collected

## Environment Variables Required

Add these to your `.env.local` file:

```bash
# DocuSign API Configuration
DOCUSIGN_ACCOUNT_ID=your_account_id_here
DOCUSIGN_INTEGRATION_KEY=your_integration_key_here
DOCUSIGN_USER_ID=your_user_id_here
DOCUSIGN_PRIVATE_KEY=your_private_key_here

# Twilio SMS Configuration
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
```

## Setup Instructions

### DocuSign Setup
1. Create a DocuSign developer account at https://developers.docusign.com/
2. Create an integration key
3. Generate RSA key pair for JWT authentication
4. Note your Account ID and User ID
5. Add credentials to `.env.local`

### Twilio Setup (for SMS notifications)
1. Create a Twilio account at https://www.twilio.com/
2. Get your Account SID and Auth Token from the console
3. Purchase a Twilio phone number
4. Add credentials to `.env.local`

## Current Implementation Status

### ✅ Completed
- "Start My Plan" CTA button in Momentum Plan section
- DocuSign signing flow page with multi-step interface
- API route for envelope creation (mock implementation)
- API route for SMS notifications (mock implementation)
- Environment variable configuration
- Co-applicant detection and notification flow

### 🚧 To Implement (Production)
- Actual DocuSign API integration (currently uses mock responses)
- Real Twilio SMS sending (currently logs only)
- Document template creation in DocuSign
- Webhook handlers for signature completion events
- Database storage for envelope status tracking
- Error handling and retry logic
- Email notifications alongside SMS

## Testing

### Mock Mode (Current)
The implementation currently runs in mock mode:
- Envelope creation returns a mock envelope ID
- SMS notifications are logged but not actually sent
- Signing URLs are demo links

### Production Mode
To enable production mode:
1. Add all required environment variables
2. Implement actual DocuSign SDK calls in `/api/docusign/create-envelope/route.js`
3. Implement actual Twilio SMS sending in `/api/docusign/notify-coapplicant/route.js`
4. Upload document templates to DocuSign
5. Configure webhooks for signature events

## Files Modified/Created

### Modified Files
- `src/app/your-plan/results/ResultsTable.js` - Added CTA button and routing
- `.env.local` - Added DocuSign and Twilio environment variables

### New Files
- `src/app/your-plan/docusign/page.js` - Main signing flow page
- `src/app/api/docusign/create-envelope/route.js` - Envelope creation API
- `src/app/api/docusign/notify-coapplicant/route.js` - SMS notification API

## User Experience Flow

1. **Results Page** → User sees "Start My Plan" button under Momentum Plan
2. **DocuSign Page (Review)** → User reviews agreement details
3. **DocuSign Page (Signing)** → User opens DocuSign in new window and signs
4. **If Co-Applicant Exists**:
   - **DocuSign Page (Waiting)** → Primary signer sees waiting message
   - **SMS Sent** → Co-applicant receives text with signing link
   - **Co-Applicant Signs** → Both parties notified of completion
5. **DocuSign Page (Complete)** → Success confirmation displayed

## Security Considerations

- All sensitive credentials stored in environment variables
- Private keys for DocuSign JWT authentication should be kept secure
- Twilio credentials should have appropriate rate limits
- Phone numbers and emails should be validated before use
- Consider implementing rate limiting on API routes
- Add CSRF protection for production deployment
