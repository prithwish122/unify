# 🚀 WhatsApp Webhook Setup - Quick Fix

## The Problem

When you receive WhatsApp replies, you see:
> "Configure your whatsapp sandbox inbound url to change this message"

This means Twilio doesn't know where to send incoming WhatsApp messages.

## The Solution (2 Steps)

### Step 1: Get Your Webhook URL

**If running locally:**
```bash
# Install ngrok (if not installed)
# Then run:
ngrok http 3000

# Copy the HTTPS URL (e.g., https://abc123.ngrok.io)
# Your webhook URL: https://abc123.ngrok.io/api/webhooks/twilio
```

**If in production:**
- Your webhook URL: `https://yourdomain.com/api/webhooks/twilio`

### Step 2: Configure in Twilio

1. Go to: https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn
2. Scroll to **"Sandbox Configuration"** section
3. Under **"When a message comes in"**, paste your webhook URL:
   ```
   https://your-ngrok-url.ngrok.io/api/webhooks/twilio
   ```
4. Set HTTP method to: **POST**
5. Click **Save**

### Step 3: Test

1. Send a WhatsApp message to `+1 415 523 8886`
2. Check your dashboard - it should appear!

## Done! ✅

That's it! Now WhatsApp replies will automatically appear in your inbox.

## Still Not Working?

Check:
- ✅ ngrok is running (if local)
- ✅ Webhook URL is accessible (visit it in browser)
- ✅ URL format is exactly: `/api/webhooks/twilio`
- ✅ HTTP method is POST in Twilio

For detailed troubleshooting, see: [WHATSAPP_WEBHOOK_SETUP.md](./WHATSAPP_WEBHOOK_SETUP.md)

