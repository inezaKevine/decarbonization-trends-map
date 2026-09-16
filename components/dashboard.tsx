"use client"

import { useMemo, useState } from "react"
import { Map as MapIcon, Flame, Info } from "lucide-react"
import { dataSource, useDecarbData } from "@/lib/decarb-data"
import { CountryPicker } from "./country-picker"
import { YearSlider } from "./year-slider"
import { WorldMap } from "./world-map"
import { TrendChart } from "./trend-chart"
import { SimilarPanel } from "./similar-panel"
import { ClusterLegend } from "./cluster-legend"

type ColorMode = "cluster" | "emissions"

export function Dashboard() {
  const { countries, years, countryByIso, clusterById, clusterColor, maxYear, yearIndex } =
    useDecarbData()

  const [selectedIso, setSelectedIso] = useState("USA")
  const [year, setYear] = useState(maxYear)
  const [colorMode, setColorMode] = useState<ColorMode>("cluster")
  const [hoverCluster, setHoverCluster] = useState<number | null>(null)

  // The API decides which countries exist, so fall back to the first one
  // rather than assuming the default selection is present.
  const selected = countryByIso.get(selectedIso) ?? countries[0]
  const cluster = clusterById.get(selected.cluster)

  const similarIsos = useMemo(
    () => selected.similar.map((s) => s.iso),
    [selected],
  )

  // Derive the index from the year list instead of assuming it starts at 1990.
  const yiCurrent = yearIndex(year)
  const perCapNow = selected.perCap[yiCurrent]

  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-5 px-4 py-6 md:px-8 lg:py-8">
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-foreground text-background">
            <Flame className="size-4" />
          </span>
          <h1 className="text-balance text-xl font-semibold tracking-tight text-foreground md:text-2xl">
            Decarbonisation Pathways
          </h1>
        </div>
        <p className="max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground">
          Explore how countries cluster by their per-capita CO₂ trajectories
          since 1990. Pick a country to see who is on a similar decarbonisation
          path. Source: {dataSource}.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_340px]">
        {/* LEFT: map + trend */}
        <div className="flex flex-col gap-5">
          <section className="rounded-xl border border-border bg-card p-4 md:p-5">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-col">
                <h2 className="text-sm font-semibold text-foreground">
                  {colorMode === "cluster"
                    ? "Decarbonisation clusters"
                    : "Per-capita CO₂ emissions"}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {colorMode === "cluster"
                    ? "Countries grouped by the shape of their emission trajectory"
                    : `Tonnes of CO₂ per person · ${year}`}
                </p>
              </div>
              <div className="inline-flex rounded-lg border border-border bg-background p-0.5">
                <ModeButton
                  active={colorMode === "cluster"}
                  onClick={() => setColorMode("cluster")}
                  icon={<MapIcon className="size-3.5" />}
                  label="Clusters"
                />
                <ModeButton
                  active={colorMode === "emissions"}
                  onClick={() => setColorMode("emissions")}
                  icon={<Flame className="size-3.5" />}
                  label="Emissions"
                />
              </div>
            </div>

            <WorldMap
              selectedIso={selectedIso}
              year={year}
              colorMode={colorMode}
              hoverCluster={hoverCluster}
              similarIsos={similarIsos}
              onSelect={setSelectedIso}
            />

            <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Info className="size-3.5" />
              Click any country on the map to select it.
            </div>
          </section>

          <section className="rounded-xl border border-border bg-card p-4 md:p-5">
            <div className="mb-1 flex flex-col">
              <h2 className="text-sm font-semibold text-foreground">
                Per-capita CO₂ over time
              </h2>
              <p className="text-xs text-muted-foreground">
                {selected.country} vs. its most similar paths · drag over the
                chart to scrub years
              </p>
            </div>
            <TrendChart
              selectedIso={selectedIso}
              similarIsos={similarIsos}
              year={year}
              onYearHover={setYear}
            />
          </section>
        </div>

        {/* RIGHT: controls + details */}
        <aside className="flex flex-col gap-5">
          <section className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 md:p-5">
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Country
              </span>
              <CountryPicker value={selectedIso} onChange={setSelectedIso} />
            </div>
            <YearSlider year={year} onChange={setYear} />
          </section>

          <section className="rounded-xl border border-border bg-card p-4 md:p-5">
            <div className="flex items-center gap-2">
              <span
                className="size-3 rounded-full"
                style={{ backgroundColor: clusterColor(selected.cluster) }}
              />
              <span className="text-sm font-medium text-foreground">
                {cluster?.name}
              </span>
            </div>
            <p className="mt-1 text-xs leading-snug text-muted-foreground">
              {cluster?.desc}
            </p>

            <dl className="mt-4 grid grid-cols-2 gap-3">
              <Stat
                label={`CO₂ / person (${year})`}
                value={perCapNow != null ? perCapNow.toFixed(2) : "—"}
                unit="t"
              />
              <Stat
                label="Peak"
                value={selected.stats.peak.toFixed(1)}
                unit={`t · ${selected.stats.peakYear}`}
              />
              <Stat
                label={`Change since ${years[0]}`}
                value={fmtPct(selected.stats.changeSince1990Pct)}
                positive={selected.stats.changeSince1990Pct <= 0}
              />
              <Stat
                label="Cut from peak"
                value={`${selected.stats.declineFromPeakPct.toFixed(0)}%`}
                positive={selected.stats.declineFromPeakPct > 0}
              />
            </dl>
          </section>

          <section className="rounded-xl border border-border bg-card p-4 md:p-5">
            <SimilarPanel selectedIso={selectedIso} onSelect={setSelectedIso} />
          </section>

          <section className="rounded-xl border border-border bg-card p-4 md:p-5">
            <h3 className="mb-2 text-sm font-semibold text-foreground">
              Clusters
            </h3>
            <ClusterLegend
              activeCluster={hoverCluster}
              onHover={setHoverCluster}
            />
          </section>
        </aside>
      </div>
    </div>
  )
}

function ModeButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
        active
          ? "bg-foreground text-background"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {icon}
      {label}
    </button>
  )
}

function Stat({
  label,
  value,
  unit,
  positive,
}: {
  label: string
  value: string
  unit?: string
  positive?: boolean
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-[11px] leading-tight text-muted-foreground">
        {label}
      </dt>
      <dd className="flex items-baseline gap-1">
        <span
          className={`font-mono text-lg font-semibold tabular-nums ${
            positive === undefined
              ? "text-foreground"
              : positive
                ? "text-emerald-400"
                : "text-rose-400"
          }`}
        >
          {value}
        </span>
        {unit && (
          <span className="text-[11px] text-muted-foreground">{unit}</span>
        )}
      </dd>
    </div>
  )
}

function fmtPct(v: number) {
  const sign = v > 0 ? "+" : ""
  return `${sign}${v.toFixed(0)}%`
}
