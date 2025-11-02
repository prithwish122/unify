"use client"

import { authClient, useSession } from "@/lib/auth-client"
import { useEffect, useState } from "react"

/**
 * Custom hook for authentication state
 * Provides user session, loading state, and auth methods
 */
export function useAuth() {
  const { data: session, isPending, error, refetch } = useSession()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!isPending) {
      setIsLoading(false)
    }
  }, [isPending])

  const refreshSession = async () => {
    // Reload the page to get the updated session from the server
    // This ensures the user role change is reflected immediately
    window.location.reload()
  }

  return {
    user: session?.user || null,
    session,
    isLoading: isLoading || isPending,
    isAuthenticated: !!session?.user,
    error,
    signOut: () => authClient.signOut(),
    refreshSession,
  }
}

