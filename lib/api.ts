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
 * The backend is on Render's free tier, which spins the instance down when
 * idle; the first request after a cold start can take the better part of a
 * minute, so the timeout is deliberately generous.
 */
export async function fetchDataset(
  { revalidate = 3600, timeoutMs = 60_000 } = {},
): Promise<Dataset> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(apiUrl("/dataset"), {
      signal: controller.signal,
      next: { revalidate },
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
  }
}
