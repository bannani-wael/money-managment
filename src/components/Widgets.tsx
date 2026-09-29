import { formatMoney, formatPercent } from '@/lib/format'
import type { CategoryTotal } from '@/lib/money'
import { cn } from '@/lib/utils'
import { CategoryGlyph } from '@/components/CategoryGlyph'

export function SavingsHero({
  saved,
  rate,
  currency,
  subtitle,
}: {
  saved: number
  rate: number
  currency: string
  subtitle: string
}) {
  const positive = saved >= 0
  return (
    <section className="card-surface overflow-hidden rounded-3xl p-5 sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Saved this cycle</p>
          <p
            className={cn(
              'money mt-2 text-4xl font-semibold tracking-tight sm:text-5xl',
              positive ? 'text-success' : 'text-destructive',
            )}
          >
            {formatMoney(saved, currency, true)}
          </p>
          <p className="mt-2 max-w-[18rem] text-sm leading-5 text-muted-foreground">{subtitle}</p>
        </div>
        <Ring value={Math.max(rate, 0)} label={formatPercent(rate)} />
      </div>
    </section>
  )
}

function Ring({ value, label }: { value: number; label: string }) {
  const r = 36
  const c = 2 * Math.PI * r
  const clamped = Math.min(value, 100)
  const offset = c - (clamped / 100) * c
  return (
    <div className="relative size-24 shrink-0">
      <svg viewBox="0 0 96 96" className="size-24 -rotate-90">
        <circle cx="48" cy="48" r={r} fill="none" stroke="currentColor" className="text-muted" strokeWidth="8" />
        <circle
          cx="48"
          cy="48"
          r={r}
          fill="none"
          stroke="currentColor"
          className="text-success"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
      </svg>
      <span className="money absolute inset-0 grid place-items-center text-sm font-semibold">{label}</span>
    </div>
  )
}

export function StatGrid({
  items,
}: {
  items: { label: string; value: string; hint?: string }[]
}) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {items.map((item) => (
        <article key={item.label} className="card-surface rounded-3xl p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{item.label}</p>
          <p className="money mt-2 text-xl font-semibold">{item.value}</p>
          {item.hint ? <p className="mt-1 text-xs text-muted-foreground">{item.hint}</p> : null}
        </article>
      ))}
    </div>
  )
}

export function CategoryBars({
  rows,
  currency,
}: {
  rows: CategoryTotal[]
  currency: string
}) {
  const max = Math.max(...rows.map((row) => row.total), 1)
  if (rows.length === 0) {
    return <p className="text-sm text-muted-foreground">No spending in this month yet.</p>
  }

  return (
    <ul className="grid gap-3">
      {rows
        .filter((row) => row.total > 0)
        .map((row) => (
          <li key={row.category.id} className="grid gap-2">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <CategoryGlyph icon={row.category.icon} color={row.category.color} size={16} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{row.category.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {Math.round(row.percentOfSpend)}% of spend
                    {row.budget ? ` · budget ${formatMoney(row.budget, currency)}` : ''}
                  </p>
                </div>
              </div>
              <p className="money text-sm font-semibold">{formatMoney(row.total, currency)}</p>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.max((row.total / max) * 100, 4)}%`,
                  background: row.category.color,
                }}
              />
            </div>
          </li>
        ))}
    </ul>
  )
}

export function Sparkline({ values }: { values: number[] }) {
  const width = 280
  const height = 72
  const max = Math.max(...values, 1)
  const step = values.length > 1 ? width / (values.length - 1) : width
  const points = values
    .map((value, index) => `${index * step},${height - (value / max) * (height - 8) - 4}`)
    .join(' ')

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-20 w-full" role="img" aria-label="Daily spending trend">
      <polyline
        fill="none"
        stroke="currentColor"
        className="text-primary"
        strokeWidth="3"
        strokeLinejoin="round"
        strokeLinecap="round"
        points={points}
      />
    </svg>
  )
}
