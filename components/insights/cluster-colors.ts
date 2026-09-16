// The unsupervised endpoints label clusters 0-2 (from the k=3 model trained on
// 2022 data) without any ordering metadata, unlike /dataset's cluster records.
// A fixed 3-color palette is enough since the model is fixed at k=3.
const UNSUPERVISED_CLUSTER_COLORS = ["#fbbf24", "#34d399", "#a78bfa"]

export function unsupervisedClusterColor(clusterId: number): string {
  return UNSUPERVISED_CLUSTER_COLORS[clusterId % UNSUPERVISED_CLUSTER_COLORS.length]
}
