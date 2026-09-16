"use client"

import { useMemo, useState } from "react"
import { geoNaturalEarth1, geoPath, geoGraticule10 } from "d3-geo"
import { world, useDecarbData } from "@/lib/decarb-data"

const WIDTH = 800
const HEIGHT = 420

type ColorMode = "cluster" | "emissions"

// sequential ramp for per-capita emissions coloring
function emissionsColor(v: number | undefined): string {
  if (v === undefined || v === null) return "var(--map-empty)"
  const stops: [number, string][] = [
    [0, "#0d3b66"],
    [2, "#1d7874"],
    [5, "#8ab17d"],
    [10, "#e9c46a"],
    [18, "#f4a261"],
    [30, "#e76f51"],
  ]
  let c = stops[stops.length - 1][1]
  for (let i = 0; i < stops.length - 1; i++) {
    if (v <= stops[i + 1][0]) {
      c = stops[i][1]
      break
    }
  }
  return c
}

export function WorldMap({
  selectedIso,
  year,
  colorMode,
  hoverCluster,
  similarIsos,
  onSelect,
}: {
  selectedIso: string
  year: number
  colorMode: ColorMode
  hoverCluster: number | null
  similarIsos: string[]
  onSelect: (iso: string) => void
}) {
  const { countryByIso, clusterColor, clusterById, yearIndex } = useDecarbData()
  const [hoverIso, setHoverIso] = useState<string | null>(null)

  const { paths, graticulePath, outlinePath } = useMemo(() => {
    const projection = geoNaturalEarth1().fitSize([WIDTH, HEIGHT], world as any)
    const path = geoPath(projection)
    const paths = world.features.map((f, i) => ({
      key: `${f.id}-${i}`,
      iso: f.id,
      name: f.properties.name,
      d: path(f as any) ?? "",
    }))
    const graticulePath = path(geoGraticule10()) ?? ""
    const outlinePath = path({ type: "Sphere" } as any) ?? ""
    return { paths, graticulePath, outlinePath }
  }, [])

  const yi = yearIndex(year)
  const similarSet = useMemo(() => new Set(similarIsos), [similarIsos])

  const tooltip = hoverIso ? countryByIso.get(hoverIso) : null

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="h-auto w-full"
        role="img"
        aria-label="World map of country decarbonisation clusters"
      >
        <path d={outlinePath} className="fill-[var(--map-ocean)]" />
        <path
          d={graticulePath}
          className="fill-none stroke-[var(--map-grid)]"
          strokeWidth={0.4}
        />
        {paths.map((p) => {
          const country = countryByIso.get(p.iso)
          const hasData = !!country
          let fill = "var(--map-empty)"
          if (hasData) {
            if (colorMode === "cluster") {
              fill = clusterColor(country!.cluster)
            } else {
              fill = emissionsColor(country!.perCap[yi])
            }
          }

          const isSelected = p.iso === selectedIso
          const isSimilar = similarSet.has(p.iso)
          const clusterDimmed =
            hoverCluster !== null &&
            (!country || country.cluster !== hoverCluster)

          let opacity = 1
          if (!hasData) opacity = 0.55
          else if (clusterDimmed) opacity = 0.2
          else if (
            selectedIso &&
            !isSelected &&
            !isSimilar &&
            hoverCluster === null &&
            colorMode === "cluster"
          )
            opacity = 0.85

          return (
            <path
              key={p.key}
              d={p.d}
              fill={fill}
              fillOpacity={opacity}
              stroke={
                isSelected
                  ? "var(--foreground)"
                  : isSimilar
                    ? "var(--foreground)"
                    : "var(--map-stroke)"
              }
              strokeWidth={isSelected ? 1.6 : isSimilar ? 1.1 : 0.35}
              className={
                hasData
                  ? "cursor-pointer transition-[fill-opacity,stroke-width] duration-150"
                  : "transition-[fill-opacity]"
              }
              onMouseEnter={() => setHoverIso(p.iso)}
              onMouseLeave={() => setHoverIso(null)}
              onClick={() => hasData && onSelect(p.iso)}
            />
          )
        })}
      </svg>

      {tooltip && (
        <div className="pointer-events-none absolute left-3 top-3 rounded-lg border border-border bg-popover/95 px-3 py-2 text-xs shadow-lg backdrop-blur">
          <div className="font-semibold text-popover-foreground">
            {tooltip.country}
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-muted-foreground">
            <span
              className="size-2 rounded-full"
              style={{ backgroundColor: clusterColor(tooltip.cluster) }}
            />
            {clusterById.get(tooltip.cluster)?.name}
          </div>
          <div className="mt-1 font-mono tabular-nums text-muted-foreground">
            {tooltip.perCap[yi]?.toFixed(2)} t CO₂ / person · {year}
          </div>
        </div>
      )}
    </div>
  )
}
