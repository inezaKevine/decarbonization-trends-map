import { Waypoints } from "lucide-react"

import type { UnsupervisedData } from "./unsupervised-loader"
import { SilhouetteChart } from "./silhouette-chart"
import { PcaScatter } from "./pca-scatter"
import { ClusterOverview } from "./cluster-overview"
import { TrajectoryExplorer } from "./trajectory-explorer"
import { SectionNav } from "../section-nav"

export function UnsupervisedView({ data }: { data: UnsupervisedData }) {
  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-5 px-4 py-6 md:px-8 lg:py-8">
      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-foreground text-background">
              <Waypoints className="size-4" />
            </span>
            <h1 className="text-balance text-xl font-semibold tracking-tight text-foreground md:text-2xl">
              Unsupervised Learning
            </h1>
          </div>
          <SectionNav />
        </div>
        <p className="max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground">
          A k-means model groups countries by their 2022 emissions, energy and
          economic profile. See how k = 3 was chosen, what the clusters look
          like in reduced dimensions, and how membership shifted since 2000.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <SilhouetteChart scores={data.silhouette} />
        <PcaScatter pca={data.pca} />
      </div>

      <ClusterOverview sizes={data.clusterSizes} means={data.clusterMeans} />

      <TrajectoryExplorer trajectories={data.trajectories} />
    </div>
  )
}
