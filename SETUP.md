# Setup Guide - Unified Inbox with Better Auth

This guide will help you set up the Unified Inbox application with Better Auth authentication.

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database (local or cloud)
- npm or yarn package manager

## Step 1: Install Dependencies

```bash
npm install
```

This will automatically generate the Prisma Client after installation (via postinstall script).

## Step 2: Set Up Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database Connection
DATABASE_URL="postgresql://username:password@localhost:5432/unify?schema=public"

# Better Auth Configuration
BETTER_AUTH_SECRET="KM6E5I32MuWP9d4oSQ9Mkd1J7ixndWUb2SJsX/YW+IQ="
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Google OAuth (Optional - leave empty if not using)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
```

### Generating a Secret Key

You can generate a new secret key using Node.js:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Or using OpenSSL:

```bash
openssl rand -base64 32
```

### Setting Up Google OAuth (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Set authorized redirect URIs:
   - For local: `http://localhost:3000/api/auth/callback/google`
   - For production: `https://yourdomain.com/api/auth/callback/google`
6. Copy the Client ID and Client Secret to your `.env` file

## Step 3: Set Up Database

### Option A: Using Migrations (Recommended)

```bash
npm run db:migrate
```

This will:
- Create a migration file
- Apply the schema to your database
- Generate Prisma Client

### Option B: Push Schema Directly (Development Only)

```bash
npm run db:push
```

This will push the schema directly without creating migration files (useful for prototyping).

## Step 4: Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Step 5: Access the Dashboard

1. Navigate to `http://localhost:3000`
2. Click "Try demo" button
3. You'll be redirected to `/dashboard`
4. A login modal will appear
5. Sign up with email/password or use Google OAuth

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:generate` - Generate Prisma Client
- `npm run db:migrate` - Run database migrations
- `npm run db:push` - Push schema to database (dev only)
- `npm run db:studio` - Open Prisma Studio (database GUI)

## Database Schema

The application uses the following models:

- **User**: User accounts with role-based access (VIEWER, EDITOR, ADMIN)
- **Session**: User sessions for authentication
- **Account**: OAuth accounts and credentials
- **Verification**: Email verification tokens

## Troubleshooting

### Prisma Client Not Generated

If you see errors about Prisma Client:

```bash
npm run db:generate
```

### Database Connection Issues

1. Verify your `DATABASE_URL` is correct
2. Ensure PostgreSQL is running
3. Check database credentials

### Authentication Not Working

1. Verify `BETTER_AUTH_SECRET` is set
2. Check `BETTER_AUTH_URL` matches your application URL
3. For Google OAuth, verify redirect URIs are correct

## Production Deployment

1. Set all environment variables in your hosting platform
2. Run `npm run build`
3. Run migrations: `npm run db:migrate`
4. Start server: `npm run start`

Make sure to use strong secrets and HTTPS in production!


