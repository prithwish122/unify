// Server startup hook for Next.js
// Automatically triggers the scheduled messages cron every minute in development
// and when CRON_SELF_HOSTED=1 is set.

export async function register() {
  try {
    const isDev = process.env.NODE_ENV !== "production"
    const selfHosted = process.env.CRON_SELF_HOSTED === "1"
    const enabled = isDev || selfHosted

    if (!enabled) return

    // Avoid multiple intervals during HMR
    const globalAny = globalThis as unknown as { __cronRunnerStarted?: boolean }
    if (globalAny.__cronRunnerStarted) return
    globalAny.__cronRunnerStarted = true

    const baseURL =
      process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const cronSecret = process.env.CRON_SECRET || "secret"

    const tick = async () => {
      try {
        await fetch(`${baseURL}/api/cron/scheduled-messages`, {
          method: "POST",
          headers: { Authorization: `Bearer ${cronSecret}` },
        })
      } catch (err) {
        // Best-effort in dev; avoid crashing startup
        if (process.env.CRON_LOG_ERRORS === "1") {
          // eslint-disable-next-line no-console
          console.error("Cron tick failed:", err)
        }
      }
    }

    // Initial delay to let the server boot, then run every minute
    setTimeout(tick, 10_000)
    setInterval(tick, 60_000)
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("Failed to start instrumentation cron runner:", e)
  }
}


