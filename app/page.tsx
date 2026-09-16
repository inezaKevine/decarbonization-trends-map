import { Dashboard } from "@/components/dashboard"
import { DecarbDataProvider } from "@/lib/decarb-data"
import { API_BASE_URL, fetchDataset } from "@/lib/api"

// Rebuild the page hourly so a redeployed backend is picked up without a
// frontend deploy, while still serving the dashboard from cache in between.
export const revalidate = 3600

export default async function Page() {
  let dataset
  let error: string | null = null

  try {
    dataset = await fetchDataset()
  } catch (cause) {
    error = cause instanceof Error ? cause.message : String(cause)
  }

  if (!dataset) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="flex max-w-md flex-col gap-3 rounded-xl border border-border bg-card p-6">
          <h1 className="text-lg font-semibold text-card-foreground">
            Could not load the dataset
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            The dashboard reads its data from the CarbonScope API at{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
              {API_BASE_URL}
            </code>
            , which did not respond.
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            The API is hosted on Render's free tier and spins down when idle, so
            the first request after a quiet period can time out. Reloading in a
            minute usually fixes it.
          </p>
          {error && (
            <p className="rounded-md bg-muted px-3 py-2 font-mono text-xs text-muted-foreground">
              {error}
            </p>
          )}
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <DecarbDataProvider dataset={dataset}>
        <Dashboard />
      </DecarbDataProvider>
    </main>
  )
}
