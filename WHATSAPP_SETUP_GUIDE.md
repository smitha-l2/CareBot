# WhatsApp Integration Setup Guide

## Overview
The Carebot system now includes WhatsApp integration using Twilio's WhatsApp Business API. When an admin uploads a patient's prescription or medical document, the system automatically sends a WhatsApp notification to the patient's registered phone number.

## Features
- ✅ Automatic WhatsApp notifications when documents are uploaded
- ✅ Formatted prescription messages with document details
- ✅ Support for international phone numbers
- ✅ Test endpoints for WhatsApp functionality
- ✅ Fallback handling if WhatsApp service is unavailable

## Setup Instructions

### 1. Get Twilio Account
1. Go to [Twilio Console](https://console.twilio.com/)
2. Sign up for a free account or log in
3. Find your **Account SID** and **Auth Token** in the dashboard

### 2. Enable WhatsApp Sandbox (for testing)
1. In Twilio Console, go to **Messaging** → **Settings** → **WhatsApp sandbox settings**
2. Follow the instructions to connect your WhatsApp number to the sandbox
3. Note down the sandbox WhatsApp number (usually `+1 415 523 8886`)

### 3. Configure Application
Edit `application.properties` file and add your Twilio credentials:

```properties
# WhatsApp Integration via Twilio
twilio.account.sid=YOUR_ACCOUNT_SID_HERE
twilio.auth.token=YOUR_AUTH_TOKEN_HERE
twilio.whatsapp.from=whatsapp:+14155238886

# Enable WhatsApp notifications
carebot.whatsapp.enabled=true
```

### 4. Phone Number Format
The system supports various phone number formats:
- `+91XXXXXXXXXX` (with country code)
- `XXXXXXXXXX` (automatically adds +91 for 10-digit numbers)
- `+1XXXXXXXXXX` (US numbers)

### 5. Testing
1. Start the backend server
2. Test WhatsApp connection: `POST /api/whatsapp/test`
3. Upload a document through the admin interface
4. Check if WhatsApp message is received

## Message Format
When a document is uploaded, patients receive a formatted WhatsApp message like:

```
🏥 CAREBOT HEALTH NOTIFICATION

Dear [Patient Name],

📋 Your prescription/medical document has been processed:

📄 Document Details:
• File: prescription.pdf
• Type: PRESCRIPTION
• Uploaded: 01/08/2025 14:30
• Notes: Follow medication schedule

👨‍⚕️ Important Reminders:
• Follow prescribed medication schedule
• Contact your doctor for any concerns
• Keep this document for your records

📞 For questions, contact your healthcare provider
🚨 Emergency? Call your local emergency number

*This is an automated message from Carebot Healthcare System*
```

## API Endpoints

### Test WhatsApp Connection
```
POST /api/whatsapp/test
```

### Send Custom Notification
```
POST /api/whatsapp/send
Parameters:
- contactNumber: Patient's phone number
- patientName: Patient's name
- message: Custom message to send
```

### Check WhatsApp Status
```
GET /api/whatsapp/status
```

## Production Setup

### For Production Use:
1. Apply for Twilio WhatsApp Business API approval
2. Get your official WhatsApp Business number
3. Update the `twilio.whatsapp.from` configuration
4. Ensure phone numbers are properly validated
5. Implement proper error handling and logging

### Security Considerations:
- Store Twilio credentials as environment variables
- Use secure connections (HTTPS)
- Validate phone numbers before sending
- Implement rate limiting for message sending
- Log all WhatsApp activities for audit

## Troubleshooting

### Common Issues:
1. **WhatsApp not sending**: Check Twilio credentials and sandbox setup
2. **Phone number format errors**: Ensure proper country code format
3. **Message delivery failures**: Verify recipient has WhatsApp and joined sandbox
4. **Rate limiting**: Twilio has sending limits in sandbox mode

### Debug Steps:
1. Check application logs for WhatsApp service initialization
2. Test connection using `/api/whatsapp/test` endpoint
3. Verify phone number format in database
4. Check Twilio console for message delivery status

## Cost Information
- Twilio WhatsApp Sandbox: Free for testing
- Production WhatsApp messages: ~$0.005-0.02 per message (varies by country)
- Consider implementing message quotas for cost control

## Support
For issues with:
- Twilio setup: [Twilio Support](https://support.twilio.com/)
- Application integration: Check application logs and error messages
- WhatsApp Business API: [WhatsApp Business Platform](https://developers.facebook.com/docs/whatsapp)
