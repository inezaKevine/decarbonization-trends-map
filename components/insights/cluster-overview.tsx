import type { ClusterMeansRow, ClusterSizes } from "@/lib/insights-types"
import { unsupervisedClusterColor } from "./cluster-colors"

const FEATURE_COLUMNS: [key: keyof ClusterMeansRow, label: string, digits: number][] = [
  ["population", "Population", 0],
  ["gdp", "GDP", 0],
  ["co2", "CO₂ (Mt)", 1],
  ["co2_per_capita", "CO₂ / capita (t)", 2],
  ["energy_per_capita", "Energy / capita", 1],
  ["co2_per_unit_energy", "CO₂ / unit energy", 2],
]

export function ClusterOverview({
  sizes,
  means,
}: {
  sizes: ClusterSizes
  means: ClusterMeansRow[]
}) {
  const sortedMeans = [...means].sort((a, b) => a.cluster - b.cluster)

  return (
    <section className="rounded-xl border border-border bg-card p-4 md:p-5">
      <div className="mb-1 flex flex-col">
        <h2 className="text-sm font-semibold text-foreground">
          2022 cluster profiles (k = 3)
        </h2>
        <p className="text-xs text-muted-foreground">
          Countries grouped by population, GDP and their emissions/energy mix
        </p>
      </div>

      <div className="mt-3 flex gap-4">
        {Object.entries(sizes)
          .sort(([a], [b]) => Number(a) - Number(b))
          .map(([cluster, size]) => (
            <div key={cluster} className="flex items-center gap-1.5">
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: unsupervisedClusterColor(Number(cluster)) }}
              />
              <span className="text-xs text-muted-foreground">
                Cluster {cluster} · <span className="font-mono">{size}</span>{" "}
                countries
              </span>
            </div>
          ))}
      </div>

      <p className="mt-4 text-[11px] text-muted-foreground sm:hidden">
        Swipe to see more columns →
      </p>
      <div className="mt-2 overflow-x-auto sm:mt-4">
        <table className="w-full min-w-[520px] border-collapse text-xs">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="py-1.5 pr-3 font-medium">Cluster</th>
              {FEATURE_COLUMNS.map(([, label]) => (
                <th key={label} className="py-1.5 pr-3 text-right font-medium">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedMeans.map((row) => (
              <tr key={row.cluster} className="border-b border-border/60">
                <td className="py-1.5 pr-3">
                  <span className="flex items-center gap-1.5">
                    <span
                      className="size-2 shrink-0 rounded-full"
                      style={{
                        backgroundColor: unsupervisedClusterColor(row.cluster),
                      }}
                    />
                    {row.cluster}
                  </span>
                </td>
                {FEATURE_COLUMNS.map(([key, label, digits]) => (
                  <td
                    key={label}
                    className="py-1.5 pr-3 text-right font-mono tabular-nums text-foreground"
                  >
                    {row[key].toLocaleString(undefined, {
                      maximumFractionDigits: digits,
                    })}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
