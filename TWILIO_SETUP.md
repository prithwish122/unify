# Twilio Setup Guide

This guide will help you set up Twilio integration for SMS and WhatsApp messaging.

## Quick Setup

### Option 1: Using the Setup Script (Recommended)

```bash
# Set environment variables (optional - script has defaults)
export TWILIO_ACCOUNT_SID="AC77e2920c6126a87f1ef347a8104ef23d"
export TWILIO_AUTH_TOKEN="fdb203ed4a2c47d0d3c0390f3484e584"
export TWILIO_DEFAULT_FROM="+17627284329"
export TWILIO_WHATSAPP_FROM="whatsapp:+14155238886"

# Run setup script
npm run setup:twilio
```

### Option 2: Using the Settings UI

1. Log in to the dashboard
2. Make sure your user role is **ADMIN** (required for Twilio settings)
3. Go to **Settings** → **Twilio** tab
4. Enter your Twilio credentials:
   - **Account SID**: `AC77e2920c6126a87f1ef347a8104ef23d`
   - **Auth Token**: `fdb203ed4a2c47d0d3c0390f3484e584`
   - **Default From**: `+17627284329` (your SMS number)
   - **WhatsApp From**: `whatsapp:+14155238886` (Twilio Sandbox or your WhatsApp number)
5. Click **Save Twilio Configuration**

### Option 3: Environment Variables

Add to your `.env` file:

```env
TWILIO_ACCOUNT_SID=AC77e2920c6126a87f1ef347a8104ef23d
TWILIO_AUTH_TOKEN=fdb203ed4a2c47d0d3c0390f3484e584
TWILIO_DEFAULT_FROM=+17627284329
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
```

The integration factory will automatically use these if no database configuration exists.

## Configuring Webhook URL

### For SMS Messages

1. Go to [Twilio Console](https://console.twilio.com/) → Phone Numbers → Manage → Active Numbers
2. Click on your phone number
3. Scroll to **Messaging** section
4. Set **A MESSAGE COMES IN** webhook URL:
   ```
   https://yourdomain.com/api/webhooks/twilio
   ```
   - For local development, use a tool like [ngrok](https://ngrok.com/):
     ```
     ngrok http 3000
     # Then use: https://your-ngrok-url.ngrok.io/api/webhooks/twilio
     ```
5. Set HTTP method to **POST**
6. Save configuration

### For WhatsApp (Sandbox)

1. Go to [Twilio Console](https://console.twilio.com/) → Messaging → Try it out → Send a WhatsApp message
2. If you haven't joined the sandbox, send `join <your-code>` to the WhatsApp number
3. Click **Configure** next to the sandbox
4. Set **When a message comes in** webhook URL:
   ```
   https://yourdomain.com/api/webhooks/twilio
   ```
5. Save configuration

## Testing the Integration

### 1. Test Sending Messages

1. Open the dashboard
2. Click **Compose** button
3. Select a contact (or create one with a phone number)
4. Choose **SMS** or **WhatsApp** channel
5. Type a message and click **Send**

### 2. Test Receiving Messages

1. Send an SMS to your Twilio phone number: `+17627284329`
2. Or send a WhatsApp message to your WhatsApp number
3. The message should appear in your inbox automatically

### 3. Check Webhook Logs

- Go to [Twilio Console](https://console.twilio.com/) → Monitor → Logs → Messaging
- Check for incoming webhook requests to your endpoint

## Phone Number Management

### View Existing Numbers

- Go to **Settings** → **Twilio** tab
- Your phone numbers will be listed automatically

### Buy a New Number

1. Go to **Settings** → **Twilio** tab
2. Click **Buy Number** button
3. Optionally enter an area code (e.g., `415`)
4. The number will be purchased and added to your account

## Troubleshooting

### Messages Not Sending

1. **Check credentials**: Verify Account SID and Auth Token are correct
2. **Check number format**: Ensure phone numbers include country code (e.g., `+18777804236`)
3. **Check Twilio console**: Look for error messages in the Twilio console logs
4. **Check database**: Ensure integration is active in the database:
   ```bash
   npm run db:studio
   # Navigate to Integration table, check if 'twilio' integration exists and isActive=true
   ```

### Webhooks Not Receiving Messages

1. **Check webhook URL**: Ensure the URL is publicly accessible (use ngrok for local testing)
2. **Check Twilio console**: Look for webhook request logs in Twilio console
3. **Check server logs**: Check your server console for incoming webhook requests
4. **Verify signature** (production only): Enable webhook signature verification

### Permission Errors

- **Admin role required**: Only users with `ADMIN` role can manage Twilio settings
- **Update user role**:
  ```sql
  UPDATE "user" SET role = 'ADMIN' WHERE email = 'your@email.com';
  ```

## Production Checklist

- [ ] Use production Twilio account (not trial)
- [ ] Set up webhook signature verification
- [ ] Configure SSL certificate for webhook URL
- [ ] Set up monitoring and alerts
- [ ] Configure rate limiting for webhook endpoint
- [ ] Store credentials securely (environment variables or encrypted storage)
- [ ] Test all channels (SMS, WhatsApp) thoroughly

## Support

- [Twilio Documentation](https://www.twilio.com/docs)
- [Twilio Console](https://console.twilio.com/)
- [Twilio Support](https://support.twilio.com/)

