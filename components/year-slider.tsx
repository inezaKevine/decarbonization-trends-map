"use client"

import { minYear, maxYear } from "@/lib/decarb-data"

export function YearSlider({
  year,
  onChange,
}: {
  year: number
  onChange: (year: number) => void
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Year
        </span>
        <span className="font-mono text-lg font-semibold tabular-nums text-foreground">
          {year}
        </span>
      </div>
      <input
        type="range"
        min={minYear}
        max={maxYear}
        step={1}
        value={year}
        onChange={(e) => onChange(Number(e.target.value))}
        className="decarb-range w-full"
        aria-label="Select year"
      />
      <div className="flex justify-between font-mono text-[11px] tabular-nums text-muted-foreground">
        <span>{minYear}</span>
        <span>{maxYear}</span>
      </div>
    </div>
  )
}
