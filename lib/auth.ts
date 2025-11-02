import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { PrismaClient } from "@prisma/client"

// Initialize Prisma Client
// Prisma Client must be generated before importing this module
// Run: npx prisma generate
let prisma: PrismaClient

try {
  prisma = new PrismaClient()
} catch (error) {
  console.error("Failed to initialize Prisma Client. Make sure to run: npx prisma generate")
  throw error
}

/**
 * Better Auth instance configuration
 * Supports email/password authentication and Google OAuth
 * Includes role-based access control (viewer/editor/admin)
 */
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true, // Automatically sign in after sign up
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      enabled: !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET,
    },
  },
  baseURL: process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  basePath: "/api/auth",
  secret: process.env.BETTER_AUTH_SECRET || "",
  trustedOrigins: [
    process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ],
})

