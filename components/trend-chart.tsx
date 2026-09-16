"use client"

import { useMemo, useState } from "react"
import {
  years,
  countryByIso,
  clusterColor,
  minYear,
  maxYear,
} from "@/lib/decarb-data"

const W = 720
const H = 300
const PAD = { top: 16, right: 16, bottom: 30, left: 40 }

export function TrendChart({
  selectedIso,
  similarIsos,
  year,
  onYearHover,
}: {
  selectedIso: string
  similarIsos: string[]
  year: number
  onYearHover: (year: number) => void
}) {
  const [hoverLine, setHoverLine] = useState<string | null>(null)

  const selected = countryByIso.get(selectedIso)

  const { lines, maxVal, xScale, yScale } = useMemo(() => {
    const series = [selectedIso, ...similarIsos]
      .map((iso) => countryByIso.get(iso))
      .filter(Boolean) as NonNullable<ReturnType<typeof countryByIso.get>>[]

    let maxVal = 0
    for (const s of series) {
      for (const v of s.perCap) if (v > maxVal) maxVal = v
    }
    maxVal = Math.ceil(maxVal / 5) * 5 || 5

    const xScale = (i: number) =>
      PAD.left +
      (i / (years.length - 1)) * (W - PAD.left - PAD.right)
    const yScale = (v: number) =>
      H - PAD.bottom - (v / maxVal) * (H - PAD.top - PAD.bottom)

    const lines = series.map((s) => {
      const d = s.perCap
        .map((v, i) => `${i === 0 ? "M" : "L"}${xScale(i)},${yScale(v)}`)
        .join(" ")
      return {
        iso: s.iso,
        name: s.country,
        d,
        color: clusterColor(s.cluster),
        isSelected: s.iso === selectedIso,
      }
    })
    return { lines, maxVal, xScale, yScale }
  }, [selectedIso, similarIsos])

  const yTicks = useMemo(() => {
    const ticks: number[] = []
    const step = maxVal / 4
    for (let i = 0; i <= 4; i++) ticks.push(+(i * step).toFixed(1))
    return ticks
  }, [maxVal])

  const xTicks = useMemo(() => {
    const out: number[] = []
    for (let y = minYear; y <= maxYear; y += 8) out.push(y)
    if (out[out.length - 1] !== maxYear) out.push(maxYear)
    return out
  }, [])

  const yi = years.indexOf(year)
  const markerX = PAD.left + (yi / (years.length - 1)) * (W - PAD.left - PAD.right)

  function handleMove(e: React.MouseEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    const px = ((e.clientX - rect.left) / rect.width) * W
    const frac = Math.min(
      1,
      Math.max(0, (px - PAD.left) / (W - PAD.left - PAD.right)),
    )
    const idx = Math.round(frac * (years.length - 1))
    onYearHover(years[idx])
  }

  return (
    <div className="flex flex-col gap-3">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full"
        onMouseMove={handleMove}
        role="img"
        aria-label="Per-capita CO2 emissions over time"
      >
        {yTicks.map((t) => (
          <g key={t}>
            <line
              x1={PAD.left}
              x2={W - PAD.right}
              y1={yScale(t)}
              y2={yScale(t)}
              className="stroke-border"
              strokeWidth={0.5}
            />
            <text
              x={PAD.left - 6}
              y={yScale(t)}
              textAnchor="end"
              dominantBaseline="middle"
              className="fill-muted-foreground font-mono text-[9px] tabular-nums"
            >
              {t}
            </text>
          </g>
        ))}

        {xTicks.map((t) => {
          const i = years.indexOf(t)
          return (
            <text
              key={t}
              x={xScale(i)}
              y={H - PAD.bottom + 16}
              textAnchor="middle"
              className="fill-muted-foreground font-mono text-[9px] tabular-nums"
            >
              {t}
            </text>
          )
        })}

        {/* year marker */}
        <line
          x1={markerX}
          x2={markerX}
          y1={PAD.top}
          y2={H - PAD.bottom}
          className="stroke-foreground/50"
          strokeWidth={1}
          strokeDasharray="3 3"
        />

        {/* similar lines first, selected on top */}
        {lines
          .filter((l) => !l.isSelected)
          .map((l) => {
            const dim = hoverLine && hoverLine !== l.iso
            return (
              <path
                key={l.iso}
                d={l.d}
                fill="none"
                stroke={l.color}
                strokeWidth={hoverLine === l.iso ? 2.5 : 1.5}
                strokeOpacity={dim ? 0.15 : 0.65}
                className="transition-all duration-150"
                onMouseEnter={() => setHoverLine(l.iso)}
                onMouseLeave={() => setHoverLine(null)}
              />
            )
          })}
        {lines
          .filter((l) => l.isSelected)
          .map((l) => (
            <g key={l.iso}>
              <path
                d={l.d}
                fill="none"
                stroke={l.color}
                strokeWidth={3}
                strokeLinejoin="round"
              />
              {selected && (
                <circle
                  cx={markerX}
                  cy={yScale(selected.perCap[yi])}
                  r={4}
                  fill={l.color}
                  stroke="var(--background)"
                  strokeWidth={1.5}
                />
              )}
            </g>
          ))}
      </svg>

      <div className="flex flex-wrap gap-x-4 gap-y-1.5">
        {lines.map((l) => (
          <button
            key={l.iso}
            type="button"
            onMouseEnter={() => setHoverLine(l.iso)}
            onMouseLeave={() => setHoverLine(null)}
            className="flex items-center gap-1.5 text-xs"
          >
            <span
              className="h-0.5 w-4 rounded-full"
              style={{
                backgroundColor: l.color,
                height: l.isSelected ? 3 : 2,
              }}
            />
            <span
              className={
                l.isSelected
                  ? "font-semibold text-foreground"
                  : "text-muted-foreground"
              }
            >
              {l.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
