"use client"

import { useMemo, useState } from "react"
import { Search } from "lucide-react"

import type { TrajectoryRow } from "@/lib/insights-types"
import { unsupervisedClusterColor } from "./cluster-colors"

export function TrajectoryExplorer({
  trajectories,
}: {
  trajectories: TrajectoryRow[]
}) {
  const [query, setQuery] = useState("")

  const summary = useMemo(() => {
    const counts = new Map<string, number>()
    for (const row of trajectories) {
      counts.set(row.trajectory, (counts.get(row.trajectory) ?? 0) + 1)
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1])
  }, [trajectories])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const rows = q
      ? trajectories.filter((r) => r.country.toLowerCase().includes(q))
      : trajectories
    return [...rows].sort((a, b) => a.country.localeCompare(b.country))
  }, [query, trajectories])

  return (
    <section className="rounded-xl border border-border bg-card p-4 md:p-5">
      <div className="mb-1 flex flex-col">
        <h2 className="text-sm font-semibold text-foreground">
          Cluster trajectories, 2000 → 2022
        </h2>
        <p className="text-xs text-muted-foreground">
          How each country&apos;s emissions/energy cluster shifted over two
          decades
        </p>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {summary.map(([trajectory, count]) => (
          <span
            key={trajectory}
            className="rounded-full bg-muted px-2.5 py-1 font-mono text-[11px] tabular-nums text-muted-foreground"
          >
            {trajectory} <span className="text-foreground">· {count}</span>
          </span>
        ))}
      </div>

      <div className="mt-3 flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
        <Search className="size-3.5 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search countries…"
          className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
        />
      </div>

      <div className="mt-3 max-h-64 overflow-y-auto">
        <table className="w-full border-collapse text-xs">
          <thead className="sticky top-0 bg-card">
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="py-1.5 pr-3 font-medium">Country</th>
              <th className="py-1.5 pr-3 font-medium">2000</th>
              <th className="py-1.5 pr-3 font-medium">2022</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr key={row.country} className="border-b border-border/60">
                <td className="py-1.5 pr-3 text-foreground">{row.country}</td>
                <td className="py-1.5 pr-3">
                  <ClusterBadge cluster={row[2000]} />
                </td>
                <td className="py-1.5 pr-3">
                  <ClusterBadge cluster={row[2022]} />
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={3} className="py-3 text-center text-muted-foreground">
                  No matches
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function ClusterBadge({ cluster }: { cluster: number }) {
  return (
    <span className="inline-flex items-center gap-1.5 font-mono tabular-nums text-foreground">
      <span
        className="size-2 shrink-0 rounded-full"
        style={{ backgroundColor: unsupervisedClusterColor(cluster) }}
      />
      {cluster}
    </span>
  )
}
