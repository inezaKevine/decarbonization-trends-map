"use client"

import { useEffect, useState } from "react"
import { AlertTriangle, RefreshCw } from "lucide-react"

import { API_BASE_URL } from "@/lib/api"

/**
 * Shared "API failed to respond" and "still loading" states for every page
 * that reads from the CarbonScope backend. The backend is on Render's free
 * tier and sleeps when idle, so every loader needs the same cold-start story.
 */
export function LoadFailed({
  title,
  message,
  onRetry,
}: {
  title: string
  message: string
  onRetry: () => void
}) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="flex max-w-md flex-col gap-3 rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-2">
          <AlertTriangle className="size-4 text-amber-400" />
          <h1 className="text-base font-semibold text-card-foreground">
            {title}
          </h1>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">
          This page reads from the CarbonScope API at{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
            {API_BASE_URL}
          </code>
          , which did not respond. It sleeps when idle, so the first request
          after a quiet period can time out.
        </p>
        <p className="rounded-md bg-muted px-3 py-2 font-mono text-xs text-muted-foreground">
          {message}
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-1 inline-flex items-center justify-center gap-2 rounded-lg bg-foreground px-3 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
        >
          <RefreshCw className="size-3.5" />
          Try again
        </button>
      </div>
    </div>
  )
}

export function LoadingSkeleton({
  titleWidth = "w-72",
  content,
}: {
  titleWidth?: string
  content: React.ReactNode
}) {
  // After a few seconds the delay is almost certainly a cold start, so say so
  // rather than leaving a spinner with no explanation.
  const [slow, setSlow] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setSlow(true), 4000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-5 px-4 py-6 md:px-8 lg:py-8">
      <div className="flex flex-col gap-2">
        <div className={`h-7 ${titleWidth} animate-pulse rounded-md bg-muted`} />
        <div className="h-4 w-full max-w-2xl animate-pulse rounded bg-muted" />
      </div>

      {content}

      <p
        aria-live="polite"
        className={`text-center text-xs text-muted-foreground transition-opacity ${
          slow ? "opacity-100" : "opacity-0"
        }`}
      >
        Waking up the API — the free-tier backend sleeps when idle, so this
        first load can take up to a minute.
      </p>
    </div>
  )
}
