import type { FeatureImportance } from "@/lib/insights-types"

const FEATURE_LABELS: Record<string, string> = {
  year: "Year",
  population: "Population",
  gdp: "GDP",
  coal_co2: "Coal CO₂",
  oil_co2: "Oil CO₂",
  gas_co2: "Gas CO₂",
  primary_energy_consumption: "Primary energy consumption",
  energy_per_capita: "Energy per capita",
  energy_per_gdp: "Energy per GDP",
  co2_per_unit_energy: "CO₂ per unit energy",
}

export function FeatureImportanceChart({
  features,
}: {
  features: FeatureImportance[]
}) {
  const max = Math.max(...features.map((f) => f.importance), 0.0001)

  return (
    <section className="rounded-xl border border-border bg-card p-4 md:p-5">
      <div className="mb-1 flex flex-col">
        <h2 className="text-sm font-semibold text-foreground">
          Random Forest feature importance
        </h2>
        <p className="text-xs text-muted-foreground">
          Which inputs the best-performing model relies on most
        </p>
      </div>

      <div className="mt-4 flex flex-col gap-2.5">
        {features.map((f) => (
          <div key={f.feature} className="flex items-center gap-3">
            <span className="w-40 shrink-0 truncate text-xs text-muted-foreground">
              {FEATURE_LABELS[f.feature] ?? f.feature}
            </span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-foreground/70"
                style={{ width: `${(f.importance / max) * 100}%` }}
              />
            </div>
            <span className="w-12 shrink-0 text-right font-mono text-xs tabular-nums text-muted-foreground">
              {(f.importance * 100).toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}
