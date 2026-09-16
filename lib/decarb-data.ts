import raw from "./data/decarbonisation.json"
import worldGeo from "./data/world-geo.json"

export type SimilarCountry = {
  iso: string
  country: string
  similarity: number
}

export type CountryStats = {
  level2022: number
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

type Dataset = {
  years: number[]
  countries: Country[]
  clusters: Record<string, ClusterMeta>
}

const dataset = raw as Dataset

export const years: number[] = dataset.years
export const countries: Country[] = [...dataset.countries].sort((a, b) =>
  a.country.localeCompare(b.country),
)
export const clusters: ClusterMeta[] = Object.values(dataset.clusters).sort(
  (a, b) => a.order - b.order,
)

export const countryByIso = new Map<string, Country>(
  countries.map((c) => [c.iso, c]),
)

export const clusterById = new Map<number, ClusterMeta>(
  clusters.map((c) => [c.id, c]),
)

// Distinct, order-based palette (ramp from rising -> decarbonising is intentional).
// Ordered by cluster.order which is sorted by ascending emission level.
const CLUSTER_COLORS = [
  "#fbbf24", // 0 amber  - emerging emitters (low, rising)
  "#fb923c", // 1 orange - rising emitters
  "#34d399", // 2 emerald- established decarbonisers
  "#f43f5e", // 3 rose   - fast-industrialising
  "#a78bfa", // 4 violet - high-carbon petrostates
]

export function clusterColor(clusterId: number): string {
  const meta = clusterById.get(clusterId)
  const order = meta ? meta.order : 0
  return CLUSTER_COLORS[order % CLUSTER_COLORS.length]
}

export const world = worldGeo as {
  type: "FeatureCollection"
  features: Array<{
    type: "Feature"
    id: string
    properties: { name: string }
    geometry: any
  }>
}

export const yearIndex = (year: number) => years.indexOf(year)
export const minYear = years[0]
export const maxYear = years[years.length - 1]

export const dataSource =
  "Our World in Data — CO₂ and Greenhouse Gas Emissions (owid/co2-data)"
