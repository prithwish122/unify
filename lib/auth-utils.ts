import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

/**
 * Server-side utility to get the current session
 * Returns null if not authenticated
 */
export async function getSession() {
  try {
    const session = await auth.api.getSession({
      headers: await import("next/headers").then((mod) => mod.headers()),
    })
    return session
  } catch (error) {
    return null
  }
}

/**
 * Server-side utility to require authentication
 * Redirects to home if not authenticated
 */
export async function requireAuth() {
  const session = await getSession()
  if (!session) {
    redirect("/")
  }
  return session
}


