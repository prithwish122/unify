# ⚡ QUICK FIX - Get Database Working

## Current Issue
Database connection is failing. You need to:
1. Fix DATABASE_URL in `.env`
2. Create database tables

## Fastest Solution (5 minutes)

### Step 1: Get a Free Database

**Option A: Supabase (Recommended - Free)**
1. Go to https://supabase.com
2. Click "Start your project" (free)
3. Create new project
4. Go to: Settings → Database
5. Copy "Connection string" → "URI"

**Option B: Use Your Existing PostgreSQL**
- Make sure PostgreSQL is running
- Use: `postgresql://username:password@localhost:5432/unify`

### Step 2: Update .env File

Open `.env` and replace the DATABASE_URL line with:

```env
DATABASE_URL="[your-connection-string-here]"
```

For Supabase, it looks like:
```env
DATABASE_URL="postgresql://postgres.xxxxx:[password]@aws-0-[region].pooler.supabase.com:6543/postgres"
```

### Step 3: Create Tables

```bash
npm run db:push
```

You should see:
```
✔ Generated Prisma Client
✔ Pushed database schema successfully
```

### Step 4: Start App

```bash
npm run dev
```

### Step 5: Test

1. Open http://localhost:3001
2. Click "Try demo"
3. Sign up with email/password
4. ✅ You're in!

---

## What's Already Done ✅

- Better Auth configured
- Login modal ready
- Dashboard protected
- All code is working

## You Just Need

- Working database connection
- Tables created (via `npm run db:push`)

---

**That's it! 5 minutes to working authentication!** 🎉

