/**
 * Client for the CarbonScope FastAPI backend.
 *
 * The dashboard needs every country's full series at once, so it reads the
 * single /dataset endpoint rather than assembling the view from the per-country
 * routes (which would be one request per country).
 */

import type { Dataset } from "./decarb-data"

/**
 * Base URL of the backend, without a trailing slash.
 *
 * NEXT_PUBLIC_ is required: the value is inlined at build time and must be
 * readable from the browser bundle, not just on the server.
 */
export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://c02-y91x.onrender.com"
).replace(/\/+$/, "")

export function apiUrl(path: string): string {
  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

/**
 * Fetch the dashboard dataset.
 *
 * Called from the browser, never during the build: the backend runs on
 * Render's free tier and spins down when idle, so a build-time fetch would
 * tie every deploy to whether the API happens to be awake. The cold start
 * can take the better part of a minute, hence the generous timeout.
 *
 * `signal` lets the caller abort in-flight work (a React effect cleanup)
 * without racing the timeout.
 */
export async function fetchDataset(
  { timeoutMs = 90_000, signal }: { timeoutMs?: number; signal?: AbortSignal } = {},
): Promise<Dataset> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  const onAbort = () => controller.abort()
  signal?.addEventListener("abort", onAbort)

  try {
    const response = await fetch(apiUrl("/dataset"), {
      signal: controller.signal,
    })

    if (!response.ok) {
      throw new ApiError(
        `The API returned ${response.status} ${response.statusText}.`,
        response.status,
      )
    }

    return (await response.json()) as Dataset
  } catch (error) {
    if (error instanceof ApiError) throw error

    // A caller-driven abort is not a failure worth reporting.
    if (signal?.aborted) throw error

    if (error instanceof Error && error.name === "AbortError") {
      throw new ApiError(
        `The API did not respond within ${Math.round(timeoutMs / 1000)}s.`,
      )
    }

    throw new ApiError(
      error instanceof Error ? error.message : "Could not reach the API.",
    )
  } finally {
    clearTimeout(timer)
    signal?.removeEventListener("abort", onAbort)
  }
}
