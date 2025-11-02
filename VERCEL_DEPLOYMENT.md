# ✅ Vercel Deployment - WhatsApp Webhook Setup

## ✅ Your Webhook URL is Configured!

You've set the webhook URL in Twilio WhatsApp Sandbox:
```
https://attack-capital-assignment2.vercel.app/api/webhooks/twilio
```

## 🔧 Important Vercel Configuration

### 1. Environment Variables in Vercel

Make sure these environment variables are set in Vercel:

**Go to:** Vercel Dashboard → Your Project → Settings → Environment Variables

Add these:
```env
DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=your-secret
BETTER_AUTH_URL=https://attack-capital-assignment2.vercel.app
NEXT_PUBLIC_APP_URL=https://attack-capital-assignment2.vercel.app
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_DEFAULT_FROM=+17627284329
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
```

### 2. Prisma Client Generation

Vercel needs to generate Prisma Client during build. Make sure your `package.json` has:

```json
{
  "scripts": {
    "postinstall": "npx prisma generate",
    "build": "npx prisma generate && next build"
  }
}
```

### 3. Database Connection Pooling

For Vercel's serverless environment, use connection pooling:

- **Recommended:** Use a connection pooler like Prisma Data Proxy or PgBouncer
- **Alternative:** Ensure your database allows many concurrent connections

## 🧪 Testing Your Webhook

### Test 1: Check if Endpoint is Accessible

Visit in browser:
```
https://attack-capital-assignment2.vercel.app/api/webhooks/twilio
```

Should return: `{"success":true}`

### Test 2: Send WhatsApp Message

1. **Send a WhatsApp message** to: `+1 415 523 8886`
   - Message: `Hello, this is a test`
   
2. **Check Vercel Logs:**
   - Go to: Vercel Dashboard → Your Project → Functions → Logs
   - Look for incoming webhook requests
   - Check for any errors

3. **Check Twilio Logs:**
   - Go to: https://console.twilio.com/monitor/logs/messaging
   - Look for webhook delivery status
   - Should show: `200 OK` or `201 Created`

### Test 3: Verify Messages Appear

1. **Check your dashboard:** https://attack-capital-assignment2.vercel.app/dashboard
2. **Refresh the page** to see new messages
3. **Look in the Kanban board** - WhatsApp messages should appear

## 🐛 Troubleshooting

### Issue: 404 Error

**Problem:** Endpoint returns 404

**Solutions:**
1. **Check route file exists:** `app/api/webhooks/twilio/route.ts`
2. **Redeploy:** Make sure the latest code is deployed to Vercel
3. **Check build logs:** Vercel Dashboard → Deployments → Latest → Build Logs
4. **Verify path:** Make sure URL is exactly `/api/webhooks/twilio` (case-sensitive)

### Issue: 500 Error

**Problem:** Webhook receives request but returns 500

**Solutions:**
1. **Check Vercel Function Logs:** Look for error messages
2. **Verify DATABASE_URL:** Must be correct PostgreSQL connection string
3. **Check Prisma Client:** Ensure `prisma generate` runs during build
4. **Verify environment variables:** All required vars must be set

### Issue: Messages Not Appearing

**Problem:** Webhook receives request successfully but messages don't show

**Solutions:**
1. **Check database connection:** Verify DATABASE_URL is correct
2. **Check Vercel logs:** Look for database connection errors
3. **Verify Prisma schema:** Make sure all tables exist in database
4. **Check contact matching:** Verify phone number format matches

### Issue: "Failed to process webhook"

**Problem:** Error in webhook handler

**Solutions:**
1. **Check function logs:** Vercel Dashboard → Functions → Logs
2. **Verify form data parsing:** Twilio sends form-data, not JSON
3. **Check Prisma connection:** Ensure database is accessible from Vercel
4. **Check phone number format:** Ensure proper normalization

## 📊 Monitor Webhook Health

### Vercel Dashboard
- **Functions → Logs:** See webhook requests in real-time
- **Deployments:** Check build status and errors

### Twilio Console
- **Monitor → Logs → Messaging:** See webhook delivery status
- **Messaging → Try it out → WhatsApp:** Check sandbox configuration

### Database
- Check `message` table for incoming messages
- Check `contact` table for auto-created contacts

## ✅ Verification Checklist

- [ ] Environment variables set in Vercel
- [ ] Database accessible from Vercel
- [ ] Prisma Client generated during build
- [ ] Webhook URL accessible (returns `{"success":true}`)
- [ ] WhatsApp Sandbox configured with webhook URL
- [ ] Sent test WhatsApp message
- [ ] Checked Vercel logs for incoming requests
- [ ] Checked Twilio logs for delivery status
- [ ] Verified message appears in dashboard

## 🚀 Next Steps

Once everything is working:

1. **Test receiving messages:** Send WhatsApp message and verify it appears
2. **Test sending messages:** Send reply from dashboard
3. **Monitor for issues:** Check logs for any errors
4. **Production ready:** Everything should be working!

## 📝 Notes

- **Serverless Environment:** Vercel runs functions in serverless mode, so database connections should use pooling
- **Cold Starts:** First request may be slower (cold start), subsequent requests are fast
- **Function Timeout:** Vercel functions have timeout limits (default 10s), webhook should complete quickly
- **HTTPS Required:** Vercel automatically provides HTTPS, which Twilio requires

## 🎉 Success!

If your webhook is configured correctly and environment variables are set, WhatsApp messages should now automatically appear in your dashboard!

Check your dashboard at: https://attack-capital-assignment2.vercel.app/dashboard

