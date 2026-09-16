"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BrainCircuit, Flame, LineChart, Waypoints } from "lucide-react"

const SECTIONS = [
  { href: "/", label: "Dashboard", icon: Flame },
  { href: "/insights", label: "Overview", icon: BrainCircuit },
  { href: "/insights/supervised", label: "Supervised", icon: LineChart },
  { href: "/insights/unsupervised", label: "Unsupervised", icon: Waypoints },
]

/** Lets every top-level page reach every other one in a single click. */
export function SectionNav() {
  const pathname = usePathname()

  return (
    <nav
      aria-label="Sections"
      className="flex flex-wrap gap-1 rounded-lg border border-border bg-background p-1"
    >
      {SECTIONS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
              active
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            <Icon className="size-3.5" />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
