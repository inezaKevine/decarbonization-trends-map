"use client"

import { useCallback, useEffect, useState } from "react"
import { AlertTriangle, RefreshCw } from "lucide-react"

import { Dashboard } from "./dashboard"
import { DecarbDataProvider, type Dataset } from "@/lib/decarb-data"
import { API_BASE_URL, fetchDataset } from "@/lib/api"

type State =
  | { status: "loading" }
  | { status: "ready"; dataset: Dataset }
  | { status: "error"; message: string }

/**
 * Loads the dataset in the browser.
 *
 * Deliberately not fetched on the server: the backend is on Render's free
 * tier and sleeps when idle, so fetching during the build would make every
 * deploy depend on the API being awake, and a cold start is slow enough to
 * blow Next's static generation budget.
 */
export function DashboardLoader() {
  const [state, setState] = useState<State>({ status: "loading" })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    setState({ status: "loading" })

    fetchDataset({ signal: controller.signal })
      .then((dataset) => {
        if (!controller.signal.aborted) {
          setState({ status: "ready", dataset })
        }
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        setState({
          status: "error",
          message: error instanceof Error ? error.message : String(error),
        })
      })

    return () => controller.abort()
  }, [attempt])

  const retry = useCallback(() => setAttempt((n) => n + 1), [])

  if (state.status === "ready") {
    return (
      <DecarbDataProvider dataset={state.dataset}>
        <Dashboard />
      </DecarbDataProvider>
    )
  }

  if (state.status === "error") {
    return <LoadFailed message={state.message} onRetry={retry} />
  }

  return <LoadingSkeleton />
}

function LoadFailed({
  message,
  onRetry,
}: {
  message: string
  onRetry: () => void
}) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="flex max-w-md flex-col gap-3 rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-2">
          <AlertTriangle className="size-4 text-amber-400" />
          <h1 className="text-base font-semibold text-card-foreground">
            Could not load the dataset
          </h1>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">
          The dashboard reads from the CarbonScope API at{" "}
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

function LoadingSkeleton() {
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
        <div className="h-7 w-72 animate-pulse rounded-md bg-muted" />
        <div className="h-4 w-full max-w-2xl animate-pulse rounded bg-muted" />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_340px]">
        <div className="flex flex-col gap-5">
          <div className="rounded-xl border border-border bg-card p-4 md:p-5">
            <div className="mb-3 h-4 w-48 animate-pulse rounded bg-muted" />
            <div className="aspect-[800/420] w-full animate-pulse rounded-lg bg-muted" />
          </div>
          <div className="rounded-xl border border-border bg-card p-4 md:p-5">
            <div className="mb-3 h-4 w-44 animate-pulse rounded bg-muted" />
            <div className="aspect-[720/300] w-full animate-pulse rounded-lg bg-muted" />
          </div>
        </div>

        <aside className="flex flex-col gap-5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-44 animate-pulse rounded-xl border border-border bg-card"
            />
          ))}
        </aside>
      </div>

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
