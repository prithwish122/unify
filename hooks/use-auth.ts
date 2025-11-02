"use client"

import { authClient, useSession } from "@/lib/auth-client"
import { useEffect, useState } from "react"

/**
 * Custom hook for authentication state
 * Provides user session, loading state, and auth methods
 */
export function useAuth() {
  const { data: session, isPending, error } = useSession()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!isPending) {
      setIsLoading(false)
    }
  }, [isPending])

  return {
    user: session?.user || null,
    session,
    isLoading: isLoading || isPending,
    isAuthenticated: !!session?.user,
    error,
    signOut: () => authClient.signOut(),
  }
}

