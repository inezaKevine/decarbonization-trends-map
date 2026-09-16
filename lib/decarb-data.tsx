"use client"

import { createContext, useContext, useMemo } from "react"
import worldGeo from "./data/world-geo.json"

export type SimilarCountry = {
  iso: string
  country: string
  similarity: number
}

export type CountryStats = {
  latestYear: number
  latestLevel: number
  peak: number
  peakYear: number
  declineFromPeakPct: number
  changeSince1990Pct: number
}

export type Country = {
  iso: string
  country: string
  pop: number
  perCap: number[]
  co2: (number | null)[]
  cluster: number
  stats: CountryStats
  similar: SimilarCountry[]
}

export type ClusterMeta = {
  id: number
  order: number
  name: string
  desc: string
  size: number
  avgLevel: number
  avgDeclineFromPeakPct: number
  avgChangePct: number
}

/** Shape of the backend's GET /dataset response. */
export type Dataset = {
  years: number[]
  countries: Country[]
  clusters: Record<string, ClusterMeta>
}

// Distinct, order-based palette (ramp from rising -> decarbonising is intentional).
// Ordered by cluster.order which is sorted by ascending emission level.
const CLUSTER_COLORS = [
  "#fbbf24", // 0 amber  - emerging emitters (low, rising)
  "#fb923c", // 1 orange - rising emitters
  "#34d399", // 2 emerald- established decarbonisers
  "#f43f5e", // 3 rose   - fast-industrialising
  "#a78bfa", // 4 violet - high-carbon petrostates
]

/** The dataset plus the lookups and helpers the components read. */
export type DecarbData = {
  years: number[]
  countries: Country[]
  clusters: ClusterMeta[]
  countryByIso: Map<string, Country>
  clusterById: Map<number, ClusterMeta>
  clusterColor: (clusterId: number) => string
  yearIndex: (year: number) => number
  minYear: number
  maxYear: number
}

function buildDecarbData(dataset: Dataset): DecarbData {
  const countries = [...dataset.countries].sort((a, b) =>
    a.country.localeCompare(b.country),
  )

  const clusters = Object.values(dataset.clusters).sort(
    (a, b) => a.order - b.order,
  )

  const countryByIso = new Map(countries.map((c) => [c.iso, c]))
  const clusterById = new Map(clusters.map((c) => [c.id, c]))

  const years = dataset.years

  return {
    years,
    countries,
    clusters,
    countryByIso,
    clusterById,
    clusterColor: (clusterId: number) => {
      const meta = clusterById.get(clusterId)
      const order = meta ? meta.order : 0
      return CLUSTER_COLORS[order % CLUSTER_COLORS.length]
    },
    yearIndex: (year: number) => years.indexOf(year),
    minYear: years[0],
    maxYear: years[years.length - 1],
  }
}

const DecarbDataContext = createContext<DecarbData | null>(null)

export function DecarbDataProvider({
  dataset,
  children,
}: {
  dataset: Dataset
  children: React.ReactNode
}) {
  // The dataset arrives from a server component and never changes for the life
  // of the page, so the lookups are built once instead of on every render.
  const value = useMemo(() => buildDecarbData(dataset), [dataset])

  return (
    <DecarbDataContext.Provider value={value}>
      {children}
    </DecarbDataContext.Provider>
  )
}

export function useDecarbData(): DecarbData {
  const value = useContext(DecarbDataContext)

  if (!value) {
    throw new Error("useDecarbData must be used inside a DecarbDataProvider")
  }

  return value
}

// Map geometry is static artwork, not API data, so it stays a plain import.
export const world = worldGeo as {
  type: "FeatureCollection"
  features: Array<{
    type: "Feature"
    id: string
    properties: { name: string }
    geometry: any
  }>
}

export const dataSource =
  "Our World in Data — CO₂ and Greenhouse Gas Emissions (owid/co2-data)"
