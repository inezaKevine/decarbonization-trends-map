"use client"

import { ArrowRight } from "lucide-react"
import { useDecarbData } from "@/lib/decarb-data"

export function SimilarPanel({
  selectedIso,
  onSelect,
}: {
  selectedIso: string
  onSelect: (iso: string) => void
}) {
  const { countryByIso, clusterColor, clusterById } = useDecarbData()

  const selected = countryByIso.get(selectedIso)
  if (!selected) return null

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between">
        <h3 className="text-sm font-semibold text-foreground">
          Similar decarbonisation path
        </h3>
        <span className="text-xs text-muted-foreground">to {selected.country}</span>
      </div>
      <ul className="flex flex-col gap-1.5">
        {selected.similar.map((s) => {
          const c = countryByIso.get(s.iso)
          const pct = Math.round(s.similarity * 100)
          return (
            <li key={s.iso}>
              <button
                type="button"
                onClick={() => onSelect(s.iso)}
                className="group flex w-full items-center gap-3 rounded-lg border border-border bg-card px-3 py-2.5 text-left transition-colors hover:bg-accent"
              >
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{
                    backgroundColor: c ? clusterColor(c.cluster) : "#888",
                  }}
                />
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-sm font-medium text-card-foreground">
                    {s.country}
                  </span>
                  {c && (
                    <span className="truncate text-xs text-muted-foreground">
                      {clusterById.get(c.cluster)?.name}
                    </span>
                  )}
                  <span className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-muted">
                    <span
                      className="block h-full rounded-full bg-foreground/70"
                      style={{ width: `${pct}%` }}
                    />
                  </span>
                </span>
                <span className="flex shrink-0 flex-col items-end">
                  <span className="font-mono text-sm font-semibold tabular-nums text-foreground">
                    {pct}%
                  </span>
                  <ArrowRight className="mt-1 size-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
