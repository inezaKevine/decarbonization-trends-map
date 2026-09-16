import type { BestModel, ModelMetric } from "@/lib/insights-types"

export function ModelComparison({
  models,
  bestModel,
}: {
  models: ModelMetric[]
  bestModel: BestModel
}) {
  const maxR2 = Math.max(...models.map((m) => m.r2), 0.0001)

  return (
    <section className="rounded-xl border border-border bg-card p-4 md:p-5">
      <div className="mb-1 flex flex-col">
        <h2 className="text-sm font-semibold text-foreground">
          Supervised model comparison
        </h2>
        <p className="text-xs text-muted-foreground">
          Predicting CO₂ per capita from population, GDP and energy mix ·{" "}
          {bestModel.model} performs best (R² {bestModel.r2.toFixed(3)})
        </p>
      </div>

      <div className="mt-4 flex flex-col gap-3">
        {models.map((m) => {
          const isBest = m.name === bestModel.model
          return (
            <div key={m.name} className="flex flex-col gap-1">
              <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5">
                <span
                  className={`shrink-0 whitespace-nowrap text-sm ${isBest ? "font-semibold text-foreground" : "text-muted-foreground"}`}
                >
                  {m.name}
                  {isBest && (
                    <span className="ml-1.5 rounded-full bg-emerald-400/15 px-1.5 py-0.5 text-[10px] font-medium text-emerald-400">
                      best
                    </span>
                  )}
                </span>
                <span className="font-mono text-xs tabular-nums text-muted-foreground">
                  R² {m.r2.toFixed(3)} · MAE {m.mae.toFixed(3)} · RMSE{" "}
                  {m.rmse.toFixed(3)}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full ${isBest ? "bg-emerald-400" : "bg-foreground/40"}`}
                  style={{ width: `${Math.max(0, (m.r2 / maxR2) * 100)}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
