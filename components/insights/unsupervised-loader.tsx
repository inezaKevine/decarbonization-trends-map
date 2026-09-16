"use client"

import { useCallback, useEffect, useState } from "react"

import { LoadFailed, LoadingSkeleton } from "../load-status"
import { UnsupervisedView } from "./unsupervised-view"
import {
  fetchClusterMeans,
  fetchClusterSizes,
  fetchPca,
  fetchSilhouetteScores,
  fetchTrajectories,
} from "@/lib/api"
import type {
  ClusterMeansRow,
  ClusterSizes,
  PcaResponse,
  SilhouetteScore,
  TrajectoryRow,
} from "@/lib/insights-types"

export type UnsupervisedData = {
  silhouette: SilhouetteScore[]
  clusterSizes: ClusterSizes
  clusterMeans: ClusterMeansRow[]
  pca: PcaResponse
  trajectories: TrajectoryRow[]
}

type State =
  | { status: "loading" }
  | { status: "ready"; data: UnsupervisedData }
  | { status: "error"; message: string }

export function UnsupervisedLoader() {
  const [state, setState] = useState<State>({ status: "loading" })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    const { signal } = controller

    setState({ status: "loading" })

    Promise.all([
      fetchSilhouetteScores({ signal }),
      fetchClusterSizes({ signal }),
      fetchClusterMeans({ signal }),
      fetchPca({ signal }),
      fetchTrajectories({ signal }),
    ])
      .then(([silhouette, clusterSizes, clusterMeans, pca, trajectories]) => {
        if (signal.aborted) return
        setState({
          status: "ready",
          data: { silhouette, clusterSizes, clusterMeans, pca, trajectories },
        })
      })
      .catch((error: unknown) => {
        if (signal.aborted) return
        setState({
          status: "error",
          message: error instanceof Error ? error.message : String(error),
        })
      })

    return () => controller.abort()
  }, [attempt])

  const retry = useCallback(() => setAttempt((n) => n + 1), [])

  if (state.status === "ready") {
    return <UnsupervisedView data={state.data} />
  }

  if (state.status === "error") {
    return (
      <LoadFailed
        title="Could not load clustering insights"
        message={state.message}
        onRetry={retry}
      />
    )
  }

  return (
    <LoadingSkeleton
      content={
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-56 animate-pulse rounded-xl border border-border bg-card"
            />
          ))}
        </div>
      }
    />
  )
}
