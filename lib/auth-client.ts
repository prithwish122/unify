"use client"

import { createAuthClient } from "better-auth/react"

/**
 * Better Auth client instance for client-side authentication
 * This client handles sign in, sign up, sign out, and session management
 */
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
})

export const { signIn, signOut, signUp, useSession } = authClient


