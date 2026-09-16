"use client"

import { clusters, clusterColor } from "@/lib/decarb-data"

export function ClusterLegend({
  activeCluster,
  onHover,
}: {
  activeCluster: number | null
  onHover: (cluster: number | null) => void
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {clusters.map((c) => {
        const dim = activeCluster !== null && activeCluster !== c.id
        return (
          <button
            key={c.id}
            type="button"
            onMouseEnter={() => onHover(c.id)}
            onMouseLeave={() => onHover(null)}
            className={`flex items-start gap-2.5 rounded-md px-2 py-1.5 text-left transition-opacity ${
              dim ? "opacity-40" : "opacity-100"
            } hover:bg-accent`}
          >
            <span
              className="mt-0.5 size-3 shrink-0 rounded-sm"
              style={{ backgroundColor: clusterColor(c.id) }}
            />
            <span className="flex flex-col">
              <span className="text-sm font-medium leading-tight text-foreground">
                {c.name}
                <span className="ml-1.5 font-mono text-xs text-muted-foreground">
                  {c.size}
                </span>
              </span>
              <span className="text-xs leading-snug text-muted-foreground">
                {c.desc}
              </span>
            </span>
          </button>
        )
      })}
    </div>
  )
}
