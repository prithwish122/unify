# Quick Start Guide - Make It Fully Functional

## 🚀 Get Up and Running in 5 Minutes

### Step 1: Set Up Database

```bash
# Make sure your DATABASE_URL is set in .env
# Then run:
npm run db:push
```

This will create all the necessary database tables (Message, Contact, Note, ScheduledMessage, Integration, TwilioNumber).

### Step 2: Set Up Twilio Integration

**Option A: Using the Setup Script (Easiest)**

```bash
npm run setup:twilio
```

This will automatically configure Twilio with your credentials:
- Account SID: `AC77e2920c6126a87f1ef347a8104ef23d`
- Auth Token: `fdb203ed4a2c47d0d3c0390f3484e584`
- Default From: `+17627284329`
- WhatsApp From: `whatsapp:+14155238886`

**Option B: Using the Settings UI**

1. Log in to the dashboard
2. Make sure your user role is `ADMIN` (update in database if needed)
3. Go to **Settings** → **Twilio** tab
4. Enter your Twilio credentials
5. Click **Save Twilio Configuration**

**Option C: Environment Variables**

Add to `.env`:
```env
TWILIO_ACCOUNT_SID=AC77e2920c6126a87f1ef347a8104ef23d
TWILIO_AUTH_TOKEN=fdb203ed4a2c47d0d3c0390f3484e584
TWILIO_DEFAULT_FROM=+17627284329
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
```

### Step 3: Configure Webhook URL

1. Go to [Twilio Console](https://console.twilio.com/)
2. Navigate to **Phone Numbers** → **Manage** → **Active Numbers**
3. Click on your phone number (`+17627284329`)
4. Scroll to **Messaging** section
5. Set **A MESSAGE COMES IN** webhook URL:
   ```
   https://yourdomain.com/api/webhooks/twilio
   ```
   - For local testing, use [ngrok](https://ngrok.com/):
     ```bash
     ngrok http 3000
     # Use: https://your-ngrok-url.ngrok.io/api/webhooks/twilio
     ```
6. Set HTTP method to **POST**
7. Save configuration

### Step 4: Start the Server

```bash
npm run dev
```

### Step 5: Test the Integration

#### Test Sending Messages

1. Open http://localhost:3000
2. Log in to the dashboard
3. Click **Compose** button (or click on a contact)
4. Select a contact (or create one)
5. Choose **SMS** or **WhatsApp** channel
6. Type a message
7. Click **Send**

You should see:
- ✅ Message appears in the contact's message history
- ✅ Message status updates (SENT → DELIVERED)
- ✅ Contact appears in the Kanban board

#### Test Receiving Messages

1. Send an SMS to `+17627284329` from your phone
2. Or send a WhatsApp message to your WhatsApp number
3. The message should automatically appear in your inbox

#### Test the Kanban Board

1. Messages will appear in the **Unread** column
2. Drag cards between columns to update contact status
3. Click on a contact to view full message history

### Step 6: Verify Everything Works

✅ **Composer**: Send messages across SMS/WhatsApp  
✅ **Kanban Board**: See contacts with real data  
✅ **Contact Modal**: View message history and notes  
✅ **Analytics**: View real metrics  
✅ **Settings**: Manage Twilio numbers  

## 🐛 Troubleshooting

### Messages Not Sending

1. **Check Twilio credentials**: Make sure they're correct in database or environment
2. **Check phone number format**: Must include country code (e.g., `+18777804236`)
3. **Check Twilio console**: Look for error messages in logs

### Webhooks Not Working

1. **Check webhook URL**: Must be publicly accessible (use ngrok for local)
2. **Check Twilio console**: Look for webhook request logs
3. **Check server logs**: Look for incoming webhook requests

### No Contacts in Kanban Board

1. **Send a test message** to your Twilio number - this will create a contact automatically
2. **Or create a contact manually** using the API or database

### Admin Access Required

If you can't access Twilio settings:

1. Update your user role in database:
   ```sql
   UPDATE "user" SET role = 'ADMIN' WHERE email = 'your@email.com';
   ```

2. Or use Prisma Studio:
   ```bash
   npm run db:studio
   ```

## 📚 Next Steps

- **Configure WhatsApp Sandbox**: See [TWILIO_SETUP.md](./TWILIO_SETUP.md)
- **Add more channels**: Email, Twitter, Facebook
- **Set up scheduled messages**: Create templates and automations
- **Enable team collaboration**: @mentions and real-time editing

## 🎉 You're All Set!

Your unified inbox is now fully functional with:
- ✅ Real-time message sending (SMS/WhatsApp)
- ✅ Automatic contact creation from inbound messages
- ✅ Kanban board with real data
- ✅ Message history timeline
- ✅ Notes and collaboration
- ✅ Analytics dashboard
- ✅ Phone number management

Happy messaging! 🚀

