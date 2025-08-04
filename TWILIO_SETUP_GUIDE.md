# 🚀 Twilio WhatsApp Setup Guide for Carebot

## Step 1: Create Twilio Account (FREE)

1. **Go to Twilio Console**: https://console.twilio.com/
2. **Sign up for FREE account** - No credit card required for trial
3. **Verify your phone number** during signup
4. **Complete the welcome survey**

## Step 2: Set Up WhatsApp Sandbox (FREE Testing)

1. **In Twilio Console**, go to: **Messaging** → **Try it out** → **Send a WhatsApp message**
2. **Join the WhatsApp Sandbox**:
   - Send a WhatsApp message from YOUR phone to: **+1 415 523 8886**
   - Message content: **"join <your-sandbox-name>"** (Twilio will show you the exact code)
   - Example: "join orange-monkey" or whatever code they give you
3. **You'll get a confirmation message** that you've joined the sandbox

## Step 3: Get Your Credentials

1. **In Twilio Console Dashboard**, find:
   - **Account SID** (starts with "AC...")
   - **Auth Token** (click the eye icon to reveal it)
2. **Copy these values** - you'll need them for configuration

## Step 4: Configure Carebot

Update the file: `java-carebot-backend/src/main/resources/application.properties`

Replace these lines:
```properties
twilio.account.sid=YOUR_ACCOUNT_SID_HERE
twilio.auth.token=YOUR_AUTH_TOKEN_HERE
```

With your actual values:
```properties
twilio.account.sid=AC1234567890abcdef1234567890abcdef  # Your actual Account SID
twilio.auth.token=your-auth-token-here                  # Your actual Auth Token
```

## Step 5: Test the Integration

1. **Restart your Carebot backend**
2. **Upload a patient document** with a phone number that has joined the WhatsApp sandbox
3. **Check if the message is sent automatically**

## Important Notes

### 📱 **Sandbox Limitations**
- **Only verified numbers** can receive messages in sandbox mode
- **To send to any number**, you need to:
  1. Upgrade to a paid Twilio account ($20/month minimum)
  2. Get official WhatsApp Business API approval

### 💰 **Costs**
- **Sandbox: FREE** (for testing with verified numbers)
- **Production: $0.005 per message** (half a cent per message)
- **No monthly fees** for WhatsApp messaging

### 🔧 **Troubleshooting**

#### If messages aren't sending:
1. **Check the backend logs** for error messages
2. **Verify phone numbers** are in the correct format (+country code)
3. **Ensure recipient** has joined the WhatsApp sandbox
4. **Check Twilio Console** → **Messaging** → **Logs** for delivery status

#### Common errors:
- **"The number +1234567890 is not a valid WhatsApp endpoint"**
  - Solution: Recipient must join the WhatsApp sandbox first
  
- **"Authentication failed"**
  - Solution: Double-check your Account SID and Auth Token

### 🎯 **Production Setup**

When ready for production (send to any phone number):
1. **Upgrade Twilio account** to paid tier
2. **Apply for WhatsApp Business API** (approval process takes 1-3 weeks)
3. **Submit your business information** for verification
4. **Once approved**, you can send to any WhatsApp number

## Test Numbers for Sandbox

Add these numbers to your WhatsApp sandbox for testing:
1. **Your own phone number** (join the sandbox first)
2. **Team members' numbers** (they need to join too)

## Success Indicators

✅ **Backend logs show**: "WhatsApp message sent successfully via Twilio!"
✅ **Patient receives**: Automatic WhatsApp message on their phone
✅ **Twilio Console**: Shows message delivery status

---

**Need Help?** 
- Check the backend console logs for detailed error messages
- Visit Twilio Console → Support for official help
- The fallback free URL generation will work if Twilio fails
