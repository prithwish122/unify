# 📱 WhatsApp Sandbox Webhook Setup Guide

## Quick Setup (2 minutes)

### Step 1: Get Your Webhook URL

**For Local Development:**
1. Install [ngrok](https://ngrok.com/download)
2. Run: `ngrok http 3000`
3. Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)
4. Your webhook URL will be: `https://abc123.ngrok.io/api/webhooks/twilio`

**For Production:**
- Use your production domain: `https://yourdomain.com/api/webhooks/twilio`

### Step 2: Configure Twilio WhatsApp Sandbox

1. **Go to Twilio Console**
   - Visit: https://console.twilio.com/
   - Navigate to **Messaging** → **Try it out** → **Send a WhatsApp message**

2. **Join the Sandbox** (if not already joined)
   - Send `join <your-code>` to the WhatsApp number `+1 415 523 8886`
   - You'll receive a confirmation message

3. **Configure the Webhook URL**
   - Click **Configure** next to the sandbox settings
   - Under **"When a message comes in"**, enter:
     ```
     https://your-ngrok-url.ngrok.io/api/webhooks/twilio
     ```
     Or for production:
     ```
     https://yourdomain.com/api/webhooks/twilio
     ```
   - Set **HTTP method** to: `POST`
   - **Save**

### Step 3: Test It

1. **Send a WhatsApp message** to the sandbox number: `+1 415 523 8886`
   - Message: `Hello, this is a test`
   
2. **Check your dashboard** - the message should appear automatically!

3. **Send a reply** from your dashboard to the same contact

## Troubleshooting

### "Configure your whatsapp sandbox inbound url" Message

This means the webhook URL is not configured. Follow Step 2 above.

### Messages Not Appearing

1. **Check ngrok is running** (for local):
   ```bash
   ngrok http 3000
   ```
   - Make sure it shows: `Forwarding  https://xxx.ngrok.io -> http://localhost:3000`

2. **Check webhook URL is accessible**:
   - Visit: `https://your-ngrok-url.ngrok.io/api/webhooks/twilio` in browser
   - Should return: `{"success":true}`

3. **Check Twilio Webhook Logs**:
   - Go to: https://console.twilio.com/monitor/logs/messaging
   - Look for incoming requests to your webhook URL
   - Check for any error responses

4. **Check server logs**:
   - Look in your terminal where `npm run dev` is running
   - You should see webhook requests being received

### Common Issues

**Issue:** Webhook URL returns 404
- **Solution:** Make sure the URL is exactly: `/api/webhooks/twilio` (case-sensitive)

**Issue:** Webhook URL returns 401
- **Solution:** This is OK for now - signature verification is disabled for development

**Issue:** Messages sent but replies don't show
- **Solution:** Configure the WhatsApp Sandbox webhook URL (see Step 2 above)

**Issue:** Phone number format errors
- **Solution:** Ensure phone numbers include country code (e.g., `+1234567890`)

## Production Setup

When deploying to production:

1. **Use a permanent domain** instead of ngrok
2. **Enable webhook signature verification** in `app/api/webhooks/twilio/route.ts`
3. **Configure SSL certificate** (HTTPS required)
4. **Set up monitoring** for webhook failures

## Quick Test Script

```bash
# Test if webhook endpoint is accessible
curl https://your-ngrok-url.ngrok.io/api/webhooks/twilio

# Should return: {"success":true}
```

## Need Help?

- **Twilio WhatsApp Documentation**: https://www.twilio.com/docs/whatsapp
- **Twilio Console**: https://console.twilio.com/
- **Check webhook logs**: Monitor → Logs → Messaging in Twilio Console

