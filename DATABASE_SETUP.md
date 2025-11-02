# Database Setup Required

## Current Issue

The error `P5010` and "Cannot fetch data from service" indicates that:
1. Database tables don't exist yet
2. Database connection might not be configured

## Quick Fix

You need to set up your database. Here's how:

### Step 1: Create/Verify .env file

Make sure you have a `.env` file in the root directory with:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/unify?schema=public"
BETTER_AUTH_SECRET="KM6E5I32MuWP9d4oSQ9Mkd1J7ixndWUb2SJsX/YW+IQ="
BETTER_AUTH_URL="http://localhost:3001"
NEXT_PUBLIC_APP_URL="http://localhost:3001"
```

**Important**: Replace `username`, `password`, and `localhost:5432` with your actual PostgreSQL connection details.

### Step 2: Create Database Tables

Run one of these commands:

**Option A: Push schema (Fast, for development)**
```bash
npm run db:push
```

**Option B: Create migration (Recommended)**
```bash
npm run db:migrate
```

This will create all the required tables in your database.

### Step 3: Restart Dev Server

After creating tables, restart your dev server:
```bash
npm run dev
```

## If You Don't Have PostgreSQL

### Option 1: Use Supabase (Free Cloud PostgreSQL)

1. Go to [supabase.com](https://supabase.com)
2. Create a free account
3. Create a new project
4. Copy the connection string from Settings > Database
5. Use it as your `DATABASE_URL` in `.env`

### Option 2: Use Docker PostgreSQL

```bash
docker run --name unify-postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=unify -p 5432:5432 -d postgres
```

Then use in `.env`:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/unify?schema=public"
```

### Option 3: Install PostgreSQL Locally

Download from: [postgresql.org/download](https://www.postgresql.org/download/)

## Verify Setup

After setup, you should be able to:
- Sign up with email/password ✅
- Sign in with email/password ✅
- Use Google OAuth (if configured) ✅

