# Unified Inbox - Multi-Channel Customer Outreach Platform

A unified communication platform built with Next.js 14 that aggregates messages from SMS (Twilio), WhatsApp (Twilio API), email, and social media into a single inbox.

## Features

- 🔐 **Authentication**: Better Auth with email/password and Google OAuth
- 👥 **Role-Based Access**: VIEWER, EDITOR, ADMIN roles
- 📱 **Multi-Channel**: SMS, WhatsApp, Email, Social Media (coming soon)
- 🎨 **Modern UI**: Beautiful dashboard with Kanban board view
- 🔍 **Search & Filter**: Find contacts and messages quickly
- 💬 **Real-Time**: Real-time collaboration features (coming soon)

## Tech Stack

- **Framework**: Next.js 14+ (App Router, TypeScript)
- **Database**: PostgreSQL via Prisma ORM
- **Authentication**: Better Auth
- **UI**: Tailwind CSS, Radix UI, Framer Motion
- **State Management**: React Query (coming soon)

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env` file (see [SETUP.md](./SETUP.md) for details):
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/unify"
   BETTER_AUTH_SECRET="your-secret-key"
   BETTER_AUTH_URL="http://localhost:3000"
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```

3. **Set up database:**
   ```bash
   npm run db:migrate
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to `http://localhost:3000` and click "Try demo"

For detailed setup instructions, see [SETUP.md](./SETUP.md).

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/auth/          # Better Auth API routes
│   ├── dashboard/         # Dashboard pages
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── dashboard/         # Dashboard-specific components
│   └── ui/                # Reusable UI components
├── lib/                   # Utilities and configurations
│   ├── auth.ts           # Better Auth server configuration
│   ├── auth-client.ts    # Better Auth client configuration
│   └── auth-utils.ts     # Auth utility functions
├── hooks/                 # Custom React hooks
│   └── use-auth.ts       # Authentication hook
├── prisma/                # Prisma schema and migrations
│   └── schema.prisma     # Database schema
└── public/               # Static assets
```

## Authentication

The application uses Better Auth for authentication with:

- **Email/Password**: Traditional email and password authentication
- **Google OAuth**: Sign in with Google (optional)

Users are automatically assigned the `VIEWER` role by default. Roles can be managed through the database.

## Database Schema

The Prisma schema includes:

- `User`: User accounts with role-based access
- `Session`: Authentication sessions
- `Account`: OAuth accounts and credentials
- `Verification`: Email verification tokens

## Development

```bash
# Start development server
npm run dev

# Generate Prisma Client
npm run db:generate

# Run database migrations
npm run db:migrate

# Open Prisma Studio (database GUI)
npm run db:studio
```

## Contributing

This is a project assignment. For questions or issues, please refer to the assignment documentation.

## License

This project is part of an assignment submission.


