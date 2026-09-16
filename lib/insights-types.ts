/** Shapes returned by the CarbonScope API's model & unsupervised-learning routes. */

export type ModelMetric = {
  name: string
  mae: number
  rmse: number
  r2: number
}

export type ModelsResponse = {
  models: ModelMetric[]
}

export type BestModel = {
  model: string
  r2: number
  rmse: number
  mae: number
}

export type FeatureImportance = {
  feature: string
  importance: number
}

export type Prediction = {
  country: string
  year: number
  actual_co2_per_capita: number
  predictions: {
    linear_regression: number
    knn: number
    random_forest: number
  }
}

export type SilhouetteScore = {
  k: number
  silhouette: number
}

export type ClusterSizes = Record<string, number>

/** One row per cluster, averaged over the features used to build it. */
export type ClusterMeansRow = {
  cluster: number
  population: number
  gdp: number
  co2: number
  co2_per_capita: number
  coal_co2: number
  oil_co2: number
  gas_co2: number
  primary_energy_consumption: number
  energy_per_capita: number
  energy_per_gdp: number
  co2_per_unit_energy: number
}

export type PcaPoint = {
  country: string
  iso_code: string
  cluster: number
  pca_1: number
  pca_2: number
}

export type PcaResponse = {
  explained_variance: number[]
  data: PcaPoint[]
}

/** A pivoted 2000 -> 2022 cluster-membership row; the years are the raw dict keys. */
export type TrajectoryRow = {
  country: string
  2000: number
  2022: number
  trajectory: string
}

export type CountryTrajectory = {
  country: string
  cluster_2000: number
  cluster_2022: number
  trajectory: string
}
