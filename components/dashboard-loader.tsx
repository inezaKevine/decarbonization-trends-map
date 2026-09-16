"use client"

import { useCallback, useEffect, useState } from "react"

import { Dashboard } from "./dashboard"
import { LoadFailed, LoadingSkeleton } from "./load-status"
import { DecarbDataProvider, type Dataset } from "@/lib/decarb-data"
import { fetchDataset } from "@/lib/api"

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
    return (
      <LoadFailed
        title="Could not load the dataset"
        message={state.message}
        onRetry={retry}
      />
    )
  }

  return (
    <LoadingSkeleton
      content={
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
      }
    />
  )
}
