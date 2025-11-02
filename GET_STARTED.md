# 🚀 Get Started - Make Everything Work

## The Problem
Your database connection isn't working. The current DATABASE_URL uses a format that's not connecting.

## The Solution (Choose One)

### ✅ EASIEST: Use Supabase (Free, 2 minutes)

1. **Create free account**: https://supabase.com
2. **Create new project** (takes ~2 minutes)
3. **Copy connection string**:
   - Go to: Project Settings → Database
   - Copy "Connection string" → "URI"
4. **Update `.env` file**:
   ```env
   DATABASE_URL="[paste-the-supabase-connection-string-here]"
   ```
5. **Create tables**:
   ```bash
   npm run db:push
   ```
6. **Done!** Now run `npm run dev`

---

### ✅ ALTERNATIVE: Local PostgreSQL

**If you have PostgreSQL installed:**

1. **Update `.env`**:
   ```env
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/unify?schema=public"
   ```
   (Replace `YOUR_PASSWORD` with your PostgreSQL password)

2. **Create database**:
   - Open pgAdmin or psql
   - Run: `CREATE DATABASE unify;`

3. **Create tables**:
   ```bash
   npm run db:push
   ```

4. **Start**:
   ```bash
   npm run dev
   ```

---

### ✅ QUICK: Docker PostgreSQL (If you have Docker)

```bash
# Start PostgreSQL
docker run --name unify-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=unify -p 5432:5432 -d postgres

# Update .env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/unify?schema=public"

# Create tables
npm run db:push

# Start app
npm run dev
```

---

## After Database Setup

1. **Create tables**: `npm run db:push`
2. **Start server**: `npm run dev`
3. **Test**: Go to http://localhost:3001 → Click "Try demo" → Sign up

## What Will Work

✅ Email/Password authentication  
✅ User sessions  
✅ Protected dashboard  
✅ Sign up & Sign in  

---

**I recommend Supabase - it's free and takes 2 minutes to set up!**

