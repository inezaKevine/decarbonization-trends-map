import { LineChart } from "lucide-react"

import type { SupervisedData } from "./supervised-loader"
import { ModelComparison } from "./model-comparison"
import { FeatureImportanceChart } from "./feature-importance-chart"
import { PredictionExplorer } from "./prediction-explorer"
import { SectionNav } from "../section-nav"

export function SupervisedView({ data }: { data: SupervisedData }) {
  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-5 px-4 py-6 md:px-8 lg:py-8">
      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-foreground text-background">
              <LineChart className="size-4" />
            </span>
            <h1 className="text-balance text-xl font-semibold tracking-tight text-foreground md:text-2xl">
              Supervised Learning
            </h1>
          </div>
          <SectionNav />
        </div>
        <p className="max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground">
          Three regression models trained to predict CO₂ per capita from
          population, GDP and energy-mix indicators. Compare their accuracy,
          see what the best one relies on, and try a prediction yourself.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <ModelComparison models={data.models} bestModel={data.bestModel} />
        <FeatureImportanceChart features={data.featureImportance} />
      </div>

      <PredictionExplorer countries={data.countries} years={data.years} />
    </div>
  )
}
