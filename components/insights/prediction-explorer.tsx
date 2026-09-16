"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"

import { ApiError, fetchPrediction } from "@/lib/api"
import type { Prediction } from "@/lib/insights-types"

type Status =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "ready"; prediction: Prediction }
  | { kind: "error"; message: string }

const MODEL_LABELS: [key: keyof Prediction["predictions"], label: string][] = [
  ["random_forest", "Random Forest"],
  ["knn", "KNN"],
  ["linear_regression", "Linear Regression"],
]

export function PredictionExplorer({
  countries,
  years,
}: {
  countries: string[]
  years: number[]
}) {
  const [country, setCountry] = useState(countries[0] ?? "")
  const [year, setYear] = useState(years[years.length - 1] ?? new Date().getFullYear())
  const [status, setStatus] = useState<Status>({ kind: "idle" })

  async function runPrediction() {
    setStatus({ kind: "loading" })
    try {
      const prediction = await fetchPrediction(country, year)
      setStatus({ kind: "ready", prediction })
    } catch (error) {
      setStatus({
        kind: "error",
        message:
          error instanceof ApiError
            ? error.message
            : "Could not fetch a prediction.",
      })
    }
  }

  return (
    <section className="rounded-xl border border-border bg-card p-4 md:p-5">
      <div className="mb-1 flex flex-col">
        <h2 className="text-sm font-semibold text-foreground">
          Predict CO₂ per capita
        </h2>
        <p className="text-xs text-muted-foreground">
          Compare each model&apos;s prediction against the recorded value for a
          country and year
        </p>
      </div>

      <div className="mt-4 flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Country
          </span>
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
          >
            {countries.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Year
          </span>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          onClick={runPrediction}
          disabled={status.kind === "loading" || !country}
          className="inline-flex items-center gap-2 rounded-lg bg-foreground px-3 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {status.kind === "loading" && (
            <Loader2 className="size-3.5 animate-spin" />
          )}
          Predict
        </button>
      </div>

      {status.kind === "error" && (
        <p className="mt-3 rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {status.message}
        </p>
      )}

      {status.kind === "ready" && (
        <div className="mt-4 flex flex-col gap-3">
          <div className="flex items-baseline justify-between rounded-lg bg-muted px-3 py-2">
            <span className="text-xs text-muted-foreground">
              Actual value · {status.prediction.country} ·{" "}
              {status.prediction.year}
            </span>
            <span className="font-mono text-sm font-semibold tabular-nums text-foreground">
              {status.prediction.actual_co2_per_capita.toFixed(2)} t
            </span>
          </div>

          {MODEL_LABELS.map(([key, label]) => {
            const predicted = status.prediction.predictions[key]
            const diff = predicted - status.prediction.actual_co2_per_capita
            return (
              <div
                key={key}
                className="flex items-baseline justify-between text-sm"
              >
                <span className="text-muted-foreground">{label}</span>
                <span className="flex items-baseline gap-2 font-mono tabular-nums">
                  <span className="text-foreground">{predicted.toFixed(2)} t</span>
                  <span
                    className={`text-xs ${Math.abs(diff) < 0.5 ? "text-emerald-400" : "text-muted-foreground"}`}
                  >
                    {diff >= 0 ? "+" : ""}
                    {diff.toFixed(2)}
                  </span>
                </span>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
