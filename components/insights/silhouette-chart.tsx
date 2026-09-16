import type { SilhouetteScore } from "@/lib/insights-types"

const W = 320
const H = 160
const PAD = { top: 10, right: 10, bottom: 24, left: 32 }
const CHOSEN_K = 3

export function SilhouetteChart({ scores }: { scores: SilhouetteScore[] }) {
  const maxScore = Math.max(...scores.map((s) => s.silhouette))
  const minK = scores[0]?.k ?? 0
  const maxK = scores[scores.length - 1]?.k ?? 0

  const xScale = (k: number) =>
    PAD.left + ((k - minK) / (maxK - minK)) * (W - PAD.left - PAD.right)
  const yScale = (v: number) =>
    H - PAD.bottom - (v / maxScore) * (H - PAD.top - PAD.bottom)

  const barWidth = (W - PAD.left - PAD.right) / scores.length - 6

  return (
    <section className="rounded-xl border border-border bg-card p-4 md:p-5">
      <div className="mb-1 flex flex-col">
        <h2 className="text-sm font-semibold text-foreground">
          Choosing k for k-means
        </h2>
        <p className="text-xs text-muted-foreground">
          Silhouette score by cluster count · the model uses k = {CHOSEN_K}
        </p>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="mt-3 h-auto w-full max-w-sm"
        role="img"
        aria-label="Silhouette score by number of clusters"
      >
        {scores.map((s) => {
          const x = xScale(s.k) - barWidth / 2
          const y = yScale(s.silhouette)
          const isChosen = s.k === CHOSEN_K
          return (
            <g key={s.k}>
              <rect
                x={x}
                y={y}
                width={Math.max(barWidth, 1)}
                height={H - PAD.bottom - y}
                rx={2}
                className={isChosen ? "fill-foreground" : "fill-foreground/30"}
              />
              <text
                x={xScale(s.k)}
                y={H - PAD.bottom + 14}
                textAnchor="middle"
                className="fill-muted-foreground font-mono text-[9px] tabular-nums"
              >
                {s.k}
              </text>
            </g>
          )
        })}
        <text
          x={PAD.left - 6}
          y={yScale(maxScore)}
          textAnchor="end"
          dominantBaseline="middle"
          className="fill-muted-foreground font-mono text-[9px] tabular-nums"
        >
          {maxScore.toFixed(2)}
        </text>
        <text
          x={PAD.left - 6}
          y={H - PAD.bottom}
          textAnchor="end"
          dominantBaseline="middle"
          className="fill-muted-foreground font-mono text-[9px] tabular-nums"
        >
          0
        </text>
      </svg>
    </section>
  )
}
