# WhatsApp Integration Setup Guide

## Overview
This guide will help you set up WhatsApp notifications for the Carebot healthcare system using Twilio's WhatsApp Business API.

## Prerequisites
- A Twilio account (free trial available)
- Access to WhatsApp Business API

## Step 1: Create a Twilio Account
1. Go to [Twilio Console](https://console.twilio.com/)
2. Sign up for a free account if you don't have one
3. Complete account verification

## Step 2: Get Your Account Credentials
1. Log in to your Twilio Console
2. From the main dashboard, find your **Account SID** and **Auth Token**
3. Copy both values - you'll need them for configuration

### Finding Your Credentials:
- **Account SID**: Found on the main dashboard (starts with 'AC')
- **Auth Token**: Click the eye icon next to it to reveal (starts with your account SID)

## Step 3: Set Up WhatsApp Sandbox (For Testing)
For development and testing, Twilio provides a WhatsApp Sandbox:

1. In Twilio Console, go to **Messaging** → **Try it out** → **Send a WhatsApp message**
2. Follow the instructions to join the sandbox
3. Send "join [sandbox-name]" to the Twilio WhatsApp number from your phone
4. You'll receive a confirmation message

### Sandbox Phone Number:
- Default: `+1 415 523 8886` (whatsapp:+14155238886)

## Step 4: Configure the Application
Edit `application.properties` file:

```properties
# WhatsApp Integration via Twilio
twilio.account.sid=YOUR_ACCOUNT_SID_HERE
twilio.auth.token=YOUR_AUTH_TOKEN_HERE
twilio.whatsapp.from=whatsapp:+14155238886

# Enable WhatsApp Feature
carebot.whatsapp.enabled=true

# Optional: Configure for India (default)
carebot.whatsapp.default-country-code=+91
carebot.whatsapp.test-mode=true
```

## Step 5: Test the Integration
1. Restart the backend server
2. Upload a document with a patient's phone number
3. Check if the WhatsApp message is sent

### Test Phone Number Format:
- Format: +91XXXXXXXXXX (for India)
- Example: +919876543210
- Make sure the number is registered with WhatsApp

## Step 6: Production Setup (Optional)
For production use:

1. **Apply for WhatsApp Business API**: Contact Twilio sales
2. **Get a dedicated phone number**: Purchase a Twilio phone number
3. **Business verification**: Complete Facebook Business verification
4. **Update configuration**: Use your dedicated number instead of sandbox

```properties
# Production Configuration
twilio.whatsapp.from=whatsapp:+1234567890  # Your dedicated number
carebot.whatsapp.test-mode=false
```

## Security Best Practices

### 1. Environment Variables (Recommended)
Instead of putting credentials in the properties file, use environment variables:

```bash
# Windows (PowerShell)
$env:TWILIO_ACCOUNT_SID="your_account_sid"
$env:TWILIO_AUTH_TOKEN="your_auth_token"

# Linux/Mac
export TWILIO_ACCOUNT_SID="your_account_sid"
export TWILIO_AUTH_TOKEN="your_auth_token"
```

Then update `application.properties`:
```properties
twilio.account.sid=${TWILIO_ACCOUNT_SID}
twilio.auth.token=${TWILIO_AUTH_TOKEN}
```

### 2. .gitignore Credentials
Make sure your actual credentials are never committed to git:
```
# Add to .gitignore
application-prod.properties
.env
```

## Troubleshooting

### Common Issues:

1. **"WhatsApp service is disabled"**
   - Check if `carebot.whatsapp.enabled=true`
   - Verify credentials are set

2. **"Invalid credentials"**
   - Double-check Account SID and Auth Token
   - Make sure there are no extra spaces

3. **"Phone number not reachable"**
   - Ensure the phone number has WhatsApp installed
   - Check number format (+country_code + number)
   - For sandbox testing, make sure the number joined the sandbox

4. **"Message not delivered"**
   - Check Twilio logs in the console
   - Verify the recipient's WhatsApp is active
   - Check if the number is blocked or invalid

## Message Format
The system sends professional healthcare notifications:

```
🏥 *Carebot Healthcare Notification*

Dear [Patient Name],

Your medical document has been successfully uploaded to our secure system.

📋 *Document Details:*
• Document: [filename]
• Upload Date: [date and time]
• Patient ID: [ID]

📞 *Contact Information:*
If you have any questions about this document, please contact your healthcare provider.

⚠️ *Important:* This is an automated notification. Please do not reply to this message.

🔒 Your health information is protected and secure.

*Carebot Healthcare System*
```

## Cost Information
- **Sandbox**: Free for testing (limited messages)
- **Production**: Pricing varies by region and volume
- **Check current rates**: [Twilio Pricing](https://www.twilio.com/pricing/messaging)

## Support
- **Twilio Documentation**: [WhatsApp API Docs](https://www.twilio.com/docs/whatsapp)
- **Twilio Support**: Available through console
- **Carebot Issues**: Check application logs for detailed error messages

---

## Quick Setup Checklist
- [ ] Create Twilio account
- [ ] Get Account SID and Auth Token
- [ ] Join WhatsApp sandbox (for testing)
- [ ] Update application.properties
- [ ] Set carebot.whatsapp.enabled=true
- [ ] Restart backend
- [ ] Test with document upload
- [ ] Verify WhatsApp message delivery

**Remember**: Keep your credentials secure and never commit them to version control!
