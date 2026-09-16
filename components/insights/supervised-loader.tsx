"use client"

import { useCallback, useEffect, useState } from "react"

import { LoadFailed, LoadingSkeleton } from "../load-status"
import { SupervisedView } from "./supervised-view"
import {
  fetchBestModel,
  fetchCountryNames,
  fetchFeatureImportance,
  fetchModels,
  fetchYears,
} from "@/lib/api"
import type { BestModel, FeatureImportance, ModelMetric } from "@/lib/insights-types"

export type SupervisedData = {
  countries: string[]
  years: number[]
  models: ModelMetric[]
  bestModel: BestModel
  featureImportance: FeatureImportance[]
}

type State =
  | { status: "loading" }
  | { status: "ready"; data: SupervisedData }
  | { status: "error"; message: string }

export function SupervisedLoader() {
  const [state, setState] = useState<State>({ status: "loading" })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    const { signal } = controller

    setState({ status: "loading" })

    Promise.all([
      fetchCountryNames({ signal }),
      fetchYears({ signal }),
      fetchModels({ signal }),
      fetchBestModel({ signal }),
      fetchFeatureImportance({ signal }),
    ])
      .then(([countries, years, models, bestModel, featureImportance]) => {
        if (signal.aborted) return
        setState({
          status: "ready",
          data: {
            countries: countries.countries,
            years: years.years,
            models: models.models,
            bestModel,
            featureImportance,
          },
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
    return <SupervisedView data={state.data} />
  }

  if (state.status === "error") {
    return (
      <LoadFailed
        title="Could not load model insights"
        message={state.message}
        onRetry={retry}
      />
    )
  }

  return (
    <LoadingSkeleton
      content={
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {[0, 1, 2].map((i) => (
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
