/**
 * Dashboard Error Boundary
 * Catches errors in the dashboard layout
 */

"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Dashboard error:", error)
  }, [error])

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Alert variant="destructive" className="max-w-md">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Dashboard Error</AlertTitle>
        <AlertDescription className="mt-2">
          {error.message || "An error occurred in the dashboard"}
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
              window.location.reload()
            }}
          >
            Reload Page
          </Button>
        </div>
      </Alert>
    </div>
  )
}

