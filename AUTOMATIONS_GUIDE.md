# Scheduled Automations Guide

## ✅ All Features Implemented

### 1. **Fixed Message Sending Issue**
- ✅ Cron job now **actually sends messages** from automations
- ✅ Creates message records in database
- ✅ Updates contact status
- ✅ Handles errors gracefully

### 2. **Contact Selection**
- ✅ Select existing contact from dropdown
- ✅ Create new contact directly in automation form
- ✅ Option to send to "All Active Contacts" (leave empty)
- ✅ Shows recipient in automation card

### 3. **User-Friendly Time Format**
- ✅ Schedule Type dropdown: One-time, Daily, Weekly
- ✅ Time picker for recurring automations
- ✅ Converts to cron expression automatically
- ✅ Still supports advanced cron expressions

## 📋 How to Use

### Creating an Automation

1. Go to **Automations** in sidebar
2. Click **"+ New Automation"**
3. Fill in the form:
   - **Name**: e.g., "Daily Check-in"
   - **Message Template**: Your message content
   - **Channel**: WhatsApp, SMS, or Email
   - **Recipient**: 
     - Select a contact from dropdown
     - OR click 👤 button to create new contact
     - OR leave empty for all active contacts
   - **Schedule Type**: 
     - **One-time**: Send once at specified time
     - **Daily**: Send every day at specified time
     - **Weekly**: Send every week at specified time
   - **Time**: (for Daily/Weekly) Select the time
   - **First Run Date & Time**: When to start

4. Click **"Create"**

### How It Works

- **Cron Job**: Processes automations every minute
- **Sending**: Actually sends messages via Twilio/Resend
- **Recurrence**: 
  - Daily: Schedules for same time tomorrow
  - Weekly: Schedules for same time next week
  - One-time: Deactivates after first run

### Setting Up Cron Job

For production, set up a cron job to call:

```
POST /api/cron/scheduled-messages
Authorization: Bearer YOUR_CRON_SECRET
```

**Options:**
1. **Vercel Cron Jobs** (recommended):
   ```json
   {
     "crons": [{
       "path": "/api/cron/scheduled-messages",
       "schedule": "*/1 * * * *"
     }]
   }
   ```

2. **External Service**: 
   - EasyCron
   - Cron-job.org
   - GitHub Actions

3. **Manual Testing**:
   ```bash
   curl -X POST http://localhost:3000/api/cron/scheduled-messages \
     -H "Authorization: Bearer secret"
   ```

## 🎯 Features

### Contact Selection
- ✅ Dropdown with all contacts
- ✅ Quick create contact button
- ✅ Auto-selects newly created contact
- ✅ Shows recipient in automation cards

### Time Format
- ✅ Simple dropdown (One-time/Daily/Weekly)
- ✅ Time picker (HH:MM format)
- ✅ Auto-generates cron expressions
- ✅ Still supports manual cron (advanced users)

### Message Sending
- ✅ Actually sends messages via integration
- ✅ Creates message records
- ✅ Updates contact status
- ✅ Error handling and logging

## 📊 Automation Card Display

Each automation shows:
- Name and channel badge
- Active/Paused status
- Recipient (contact name or "All Active Contacts")
- Schedule info (Daily at 09:00, Weekly, etc.)
- Next run time
- Action buttons (Pause/Resume, Delete)

## 🔧 Technical Details

### Database Schema
- Added `contactId` to ScheduledMessage
- Added `recurrence` field ("once", "daily", "weekly")
- Added `recurrenceTime` field (time string like "09:00")

### Cron Processing
1. Finds automations where `nextRunAt <= now` and `isActive = true`
2. Gets contacts (single contact or all active)
3. Sends message to each contact
4. Creates message records
5. Updates next run time based on recurrence
6. Deactivates one-time automations after first run

### Recurrence Logic
- **Daily**: `nextRun = today + 1 day, set time to recurrenceTime`
- **Weekly**: `nextRun = today + 7 days, set time to recurrenceTime`
- **One-time**: Set `isActive = false` after first run

## ✅ Status: Fully Functional

All features are now working:
- ✅ Messages send at scheduled time
- ✅ Contact selection in form
- ✅ User-friendly time picker
- ✅ Recurring automations
- ✅ Error handling

**Ready to use!** Just set up the cron job to call the endpoint periodically.

