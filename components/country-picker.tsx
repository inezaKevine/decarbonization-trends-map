"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Search, ChevronDown } from "lucide-react"
import { useDecarbData } from "@/lib/decarb-data"

export function CountryPicker({
  value,
  onChange,
}: {
  value: string
  onChange: (iso: string) => void
}) {
  const { countries, clusterColor } = useDecarbData()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const wrapRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  const selected = countries.find((c) => c.iso === value)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return countries
    return countries.filter((c) => c.country.toLowerCase().includes(q))
  }, [query, countries])

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", onDocClick)
    return () => document.removeEventListener("mousedown", onDocClick)
  }, [])

  useEffect(() => {
    if (open) {
      setQuery("")
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [open])

  function closeAndRefocus() {
    setOpen(false)
    triggerRef.current?.focus()
  }

  function onSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      closeAndRefocus()
    } else if (e.key === "Enter" && filtered.length > 0) {
      onChange(filtered[0].iso)
      closeAndRefocus()
    }
  }

  return (
    <div ref={wrapRef} className="relative w-full">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 rounded-lg border border-border bg-card px-3 py-2.5 text-left text-sm font-medium text-card-foreground transition-colors hover:bg-accent"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2.5 truncate">
          {selected && (
            <span
              className="size-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: clusterColor(selected.cluster) }}
            />
          )}
          <span className="truncate">
            {selected ? selected.country : "Select a country"}
          </span>
        </span>
        <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
      </button>

      {open && (
        <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-lg border border-border bg-popover shadow-xl">
          <div className="flex items-center gap-2 border-b border-border px-3 py-2">
            <Search className="size-4 text-muted-foreground" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onSearchKeyDown}
              placeholder="Search countries…"
              className="w-full bg-transparent text-sm text-popover-foreground outline-none placeholder:text-muted-foreground"
            />
          </div>
          <ul role="listbox" className="max-h-64 overflow-y-auto py-1">
            {filtered.length === 0 && (
              <li className="px-3 py-2 text-sm text-muted-foreground">
                No matches
              </li>
            )}
            {filtered.map((c) => (
              <li key={c.iso}>
                <button
                  type="button"
                  role="option"
                  aria-selected={c.iso === value}
                  onClick={() => {
                    onChange(c.iso)
                    closeAndRefocus()
                  }}
                  className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors hover:bg-accent ${
                    c.iso === value
                      ? "bg-accent font-medium text-accent-foreground"
                      : "text-popover-foreground"
                  }`}
                >
                  <span
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: clusterColor(c.cluster) }}
                  />
                  <span className="truncate">{c.country}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
