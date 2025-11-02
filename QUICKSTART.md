# Quick Start Checklist

Follow these steps to get the application running:

## ✅ Pre-flight Checklist

- [ ] Node.js 18+ installed
- [ ] PostgreSQL database available
- [ ] npm or yarn installed

## 🚀 Setup Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Create `.env` File
Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/unify?schema=public"
BETTER_AUTH_SECRET="KM6E5I32MuWP9d4oSQ9Mkd1J7ixndWUb2SJsX/YW+IQ="
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
```

**Important**: Replace the `DATABASE_URL` with your actual PostgreSQL connection string!

### 3. Generate Prisma Client
```bash
npm run db:generate
```

### 4. Set Up Database Tables ⚠️ REQUIRED

**IMPORTANT**: You must create the database tables before authentication will work!

**Option A: Push schema (Quick, for development)**
```bash
npm run db:push
```

**Option B: Create migration (Recommended)**
```bash
npm run db:migrate
```

**Note**: If you see database errors:
- Make sure PostgreSQL is running
- Check DATABASE_URL in .env is correct
- Create the database if it doesn't exist

### 5. Start Development Server
```bash
npm run dev
```

### 6. Open in Browser
Navigate to: `http://localhost:3000`

### 7. Test Authentication
1. Click "Try demo" button
2. You'll be redirected to `/dashboard`
3. Login modal will appear
4. Sign up with email/password or use Google OAuth

## 🎯 What's Working

✅ Better Auth integration  
✅ Email/Password authentication  
✅ Google OAuth (if configured)  
✅ Role-based access control (VIEWER/EDITOR/ADMIN)  
✅ Protected dashboard routes  
✅ Login modal with sign in/sign up  
✅ Automatic Prisma Client generation  

## 📚 Additional Resources

- **Detailed Setup**: See [SETUP.md](./SETUP.md)
- **Project Info**: See [README.md](./README.md)
- **Database GUI**: Run `npm run db:studio`

## 🐛 Troubleshooting

### "Prisma Client not initialized"
```bash
npm run db:generate
```

### "Database connection failed"
- Check your `DATABASE_URL` in `.env`
- Ensure PostgreSQL is running
- Verify database credentials

### "BETTER_AUTH_SECRET is missing"
- Add `BETTER_AUTH_SECRET` to your `.env` file
- Generate a new one: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`

### "Lockfile error" or "Access is denied"
This usually happens when:
- Another dev server is still running
- Files are locked by another process
- Port 3000 is in use

**Solution:**
```bash
# Run the cleanup script
npm run clean

# Or manually:
# 1. Close all terminals running the dev server
# 2. Delete .next folder
# 3. Kill processes on port 3000
# 4. Restart: npm run dev
```

### "Port 3000 is in use"
- Another process is using port 3000
- Next.js will automatically use port 3001 instead
- Or kill the process: `npm run clean`

---

**You're all set! 🎉**


