import Link from "next/link"
import { ArrowRight, BrainCircuit, LineChart, Waypoints } from "lucide-react"

import { SectionNav } from "@/components/section-nav"

export default function InsightsHubPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-5 px-4 py-6 md:px-8 lg:py-8">
        <header className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-lg bg-foreground text-background">
                <BrainCircuit className="size-4" />
              </span>
              <h1 className="text-balance text-xl font-semibold tracking-tight text-foreground md:text-2xl">
                Models &amp; Insights
              </h1>
            </div>
            <SectionNav />
          </div>
          <p className="max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground">
            How the models behind the dashboard were built: supervised
            regression models that predict CO₂ per capita, and the
            unsupervised clustering that groups countries by decarbonisation
            path.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <HubCard
            href="/insights/supervised"
            icon={<LineChart className="size-4" />}
            title="Supervised learning"
            description="Compare Linear Regression, KNN and Random Forest, see which features drive the best model, and predict CO₂ per capita for any country and year."
          />
          <HubCard
            href="/insights/unsupervised"
            icon={<Waypoints className="size-4" />}
            title="Unsupervised learning"
            description="See how k-means groups countries into 3 clusters, explore the PCA projection, and track how each country's cluster shifted from 2000 to 2022."
          />
        </div>
      </div>
    </main>
  )
}

function HubCard({
  href,
  icon,
  title,
  description,
}: {
  href: string
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col gap-3 rounded-xl border border-border bg-card p-5 transition-colors hover:bg-accent"
    >
      <div className="flex items-center justify-between">
        <span className="flex size-9 items-center justify-center rounded-lg bg-muted text-foreground">
          {icon}
        </span>
        <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
      </div>
      <div className="flex flex-col gap-1">
        <h2 className="text-sm font-semibold text-card-foreground">{title}</h2>
        <p className="text-xs leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
    </Link>
  )
}
