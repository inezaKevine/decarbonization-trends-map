"use client"

import { useMemo, useState } from "react"

import type { PcaResponse } from "@/lib/insights-types"
import { unsupervisedClusterColor } from "./cluster-colors"

const W = 400
const H = 300
const PAD = 24

export function PcaScatter({ pca }: { pca: PcaResponse }) {
  const [hovered, setHovered] = useState<string | null>(null)

  const { points, xScale, yScale } = useMemo(() => {
    const xs = pca.data.map((p) => p.pca_1)
    const ys = pca.data.map((p) => p.pca_2)
    const xMin = Math.min(...xs)
    const xMax = Math.max(...xs)
    const yMin = Math.min(...ys)
    const yMax = Math.max(...ys)

    const xScale = (v: number) =>
      PAD + ((v - xMin) / (xMax - xMin || 1)) * (W - PAD * 2)
    // SVG y grows downward; flip so higher PCA-2 renders higher on screen.
    const yScale = (v: number) =>
      H - PAD - ((v - yMin) / (yMax - yMin || 1)) * (H - PAD * 2)

    return { points: pca.data, xScale, yScale }
  }, [pca])

  const tooltip = hovered ? points.find((p) => p.iso_code === hovered) : null
  const [var1, var2] = pca.explained_variance

  return (
    <section className="rounded-xl border border-border bg-card p-4 md:p-5">
      <div className="mb-1 flex flex-col">
        <h2 className="text-sm font-semibold text-foreground">
          Country clusters in PCA space
        </h2>
        <p className="text-xs text-muted-foreground">
          2022 emissions & energy profile, reduced to 2 components (
          {((var1 + var2) * 100).toFixed(0)}% of variance explained)
        </p>
      </div>

      <div className="relative mt-3">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="h-auto w-full"
          role="img"
          aria-label="PCA scatter plot of country clusters"
        >
          <line
            x1={PAD}
            x2={W - PAD}
            y1={H / 2}
            y2={H / 2}
            className="stroke-border"
            strokeWidth={0.5}
          />
          <line
            x1={W / 2}
            x2={W / 2}
            y1={PAD}
            y2={H - PAD}
            className="stroke-border"
            strokeWidth={0.5}
          />
          {points.map((p) => (
            <circle
              key={p.iso_code}
              cx={xScale(p.pca_1)}
              cy={yScale(p.pca_2)}
              r={hovered === p.iso_code ? 5 : 3.5}
              fill={unsupervisedClusterColor(p.cluster)}
              fillOpacity={hovered && hovered !== p.iso_code ? 0.35 : 0.9}
              stroke="var(--background)"
              strokeWidth={0.75}
              className="cursor-pointer transition-all duration-100"
              onMouseEnter={() => setHovered(p.iso_code)}
              onMouseLeave={() => setHovered(null)}
            />
          ))}
        </svg>

        {tooltip && (
          <div className="pointer-events-none absolute left-3 top-3 rounded-lg border border-border bg-popover/95 px-3 py-2 text-xs shadow-lg backdrop-blur">
            <div className="font-semibold text-popover-foreground">
              {tooltip.country}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-muted-foreground">
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: unsupervisedClusterColor(tooltip.cluster) }}
              />
              Cluster {tooltip.cluster}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
