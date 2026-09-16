/**
 * Client for the CarbonScope FastAPI backend.
 *
 * The dashboard needs every country's full series at once, so it reads the
 * single /dataset endpoint rather than assembling the view from the per-country
 * routes (which would be one request per country).
 */

import type { Dataset } from "./decarb-data"
import type {
  BestModel,
  CountryTrajectory,
  ClusterMeansRow,
  ClusterSizes,
  FeatureImportance,
  ModelsResponse,
  PcaResponse,
  Prediction,
  SilhouetteScore,
  TrajectoryRow,
} from "./insights-types"

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

export type FetchOptions = { timeoutMs?: number; signal?: AbortSignal }

/**
 * Fetch and decode JSON from the API.
 *
 * Called from the browser, never during the build: the backend runs on
 * Render's free tier and spins down when idle, so a build-time fetch would
 * tie every deploy to whether the API happens to be awake. The cold start
 * can take the better part of a minute, hence the generous default timeout.
 *
 * `signal` lets the caller abort in-flight work (a React effect cleanup)
 * without racing the timeout.
 */
async function fetchJson<T>(
  path: string,
  { timeoutMs = 90_000, signal }: FetchOptions = {},
): Promise<T> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  const onAbort = () => controller.abort()
  signal?.addEventListener("abort", onAbort)

  try {
    const response = await fetch(apiUrl(path), {
      signal: controller.signal,
    })

    if (!response.ok) {
      throw new ApiError(
        `The API returned ${response.status} ${response.statusText}.`,
        response.status,
      )
    }

    return (await response.json()) as T
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

/** The dashboard needs every country's full series at once — see the module doc. */
export function fetchDataset(options: FetchOptions = {}): Promise<Dataset> {
  return fetchJson<Dataset>("/dataset", options)
}

export function fetchCountryNames(options: FetchOptions = {}): Promise<{ countries: string[] }> {
  return fetchJson("/countries", options)
}

export function fetchYears(options: FetchOptions = {}): Promise<{ years: number[] }> {
  return fetchJson("/years", options)
}

export function fetchModels(options: FetchOptions = {}): Promise<ModelsResponse> {
  return fetchJson("/models", options)
}

export function fetchBestModel(options: FetchOptions = {}): Promise<BestModel> {
  return fetchJson("/models/best", options)
}

export function fetchFeatureImportance(
  options: FetchOptions = {},
): Promise<FeatureImportance[]> {
  return fetchJson("/models/random-forest/feature-importance", options)
}

export function fetchPrediction(
  countryName: string,
  year: number,
  options: FetchOptions = {},
): Promise<Prediction> {
  return fetchJson(
    `/predict/${encodeURIComponent(countryName)}?year=${year}`,
    options,
  )
}

export function fetchSilhouetteScores(
  options: FetchOptions = {},
): Promise<SilhouetteScore[]> {
  return fetchJson("/unsupervised/silhouette", options)
}

export function fetchClusterSizes(options: FetchOptions = {}): Promise<ClusterSizes> {
  return fetchJson("/unsupervised/cluster-sizes", options)
}

export function fetchClusterMeans(
  options: FetchOptions = {},
): Promise<ClusterMeansRow[]> {
  return fetchJson("/unsupervised/cluster-means", options)
}

export function fetchPca(options: FetchOptions = {}): Promise<PcaResponse> {
  return fetchJson("/unsupervised/pca", options)
}

export function fetchTrajectories(
  options: FetchOptions = {},
): Promise<TrajectoryRow[]> {
  return fetchJson("/unsupervised/trajectories", options)
}

export function fetchCountryTrajectory(
  countryName: string,
  options: FetchOptions = {},
): Promise<CountryTrajectory> {
  return fetchJson(
    `/unsupervised/trajectory/${encodeURIComponent(countryName)}`,
    options,
  )
}
