/**
 * Global Error Boundary
 * Catches errors in the app directory
 */

"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to console or error reporting service
    console.error("Global error:", error)
  }, [error])

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Alert variant="destructive" className="max-w-md">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Something went wrong</AlertTitle>
        <AlertDescription className="mt-2">
          {error.message || "An unexpected error occurred"}
          {error.digest && (
            <div className="mt-2 text-sm opacity-70">
              Error ID: {error.digest}
            </div>
          )}
        </AlertDescription>
        <div className="mt-4 flex gap-2">
          <Button onClick={reset}>Try Again</Button>
          <Button
            variant="outline"
            onClick={() => {
              window.location.href = "/dashboard"
            }}
          >
            Go to Dashboard
          </Button>
        </div>
      </Alert>
    </div>
  )
}

