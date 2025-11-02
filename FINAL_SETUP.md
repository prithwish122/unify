# Final Setup Guide - Get Everything Working

## Current Status

✅ Better Auth integrated  
✅ Login modal configured  
✅ Prisma schema ready  
⚠️  Database connection needs to be configured  
⚠️  Database tables need to be created  

## Quick Setup (Choose One Option)

### Option 1: Use Local PostgreSQL (Recommended)

1. **Install PostgreSQL** (if not installed):
   - Download from: https://www.postgresql.org/download/windows/
   - During installation, set password for `postgres` user

2. **Update `.env` file**:
   ```env
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/unify?schema=public"
   ```
   Replace `YOUR_PASSWORD` with your PostgreSQL password.

3. **Create database**:
   ```bash
   # Connect to PostgreSQL (via psql or pgAdmin)
   CREATE DATABASE unify;
   ```

4. **Create tables**:
   ```bash
   npm run db:push
   ```

5. **Start server**:
   ```bash
   npm run dev
   ```

### Option 2: Use Supabase (Free Cloud PostgreSQL)

1. **Create Supabase account**:
   - Go to: https://supabase.com
   - Sign up (free)
   - Create a new project

2. **Get connection string**:
   - Go to Project Settings → Database
   - Copy the "Connection string" (URI format)
   - It looks like: `postgresql://postgres.[project]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres`

3. **Update `.env` file**:
   ```env
   DATABASE_URL="[paste-your-supabase-connection-string]"
   ```

4. **Create tables**:
   ```bash
   npm run db:push
   ```

5. **Start server**:
   ```bash
   npm run dev
   ```

### Option 3: Use Docker PostgreSQL (Quick Local Setup)

1. **Start PostgreSQL in Docker**:
   ```bash
   docker run --name unify-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=unify -p 5432:5432 -d postgres
   ```

2. **Update `.env` file**:
   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/unify?schema=public"
   ```

3. **Create tables**:
   ```bash
   npm run db:push
   ```

4. **Start server**:
   ```bash
   npm run dev
   ```

## Verify Setup

After running `npm run db:push`, you should see:
```
✅ The following models were created:
   - User
   - Session
   - Account
   - Verification
```

## Test Authentication

1. Open: `http://localhost:3001` (or 3000)
2. Click "Try demo"
3. Sign up with email/password
4. You should be redirected to the dashboard

## Troubleshooting

### "Can't reach database server"
- Check PostgreSQL is running
- Verify DATABASE_URL in .env is correct
- Check firewall/port 5432 is open

### "P1001" Error
- Database server is not running
- Wrong host/port in DATABASE_URL

### "P1003" Error
- Database doesn't exist
- Create it: `CREATE DATABASE unify;`

### Authentication not working after setup
- Make sure tables were created: `npm run db:push`
- Check BETTER_AUTH_SECRET is set in .env
- Restart dev server

## What's Working After Setup

✅ Email/Password sign up  
✅ Email/Password sign in  
✅ Session management  
✅ Protected dashboard routes  
✅ Role-based access (VIEWER/EDITOR/ADMIN in schema)  
✅ Google OAuth (once GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are added)  

---

**You're almost there! Just set up the database connection and create the tables.** 🚀

