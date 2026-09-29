import { lazy, Suspense } from 'react'
import { MonthSwitcher } from '@/components/MonthSwitcher'
import { formatMoney, formatPercent } from '@/lib/format'
import type { MonthSummary } from '@/lib/money'

const InsightCharts = lazy(() => import('@/components/InsightCharts'))

export function InsightsPage({
  month,
  onMonth,
  summary,
  currency,
}: {
  month: string
  onMonth: (month: string) => void
  summary: MonthSummary
  currency: string
}) {
  const vsSaved = summary.vsLastMonth.saved
  const vsSpend = summary.vsLastMonth.expenses

  return (
    <div className="grid gap-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Insights</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Charts, category totals, and the math behind this pay cycle.
          </p>
        </div>
        <div className="w-full max-w-sm lg:w-80">
          <MonthSwitcher month={month} onChange={onMonth} />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <CalcCard
          label="Saved so far"
          value={formatMoney(summary.saved, currency, true)}
          detail={
            summary.income > 0
              ? `${formatPercent(summary.savingsRate)} of income`
              : 'Income minus spending'
          }
        />
        <CalcCard
          label="Vs last month"
          value={summary.vsLastMonth.hasPrevious ? formatMoney(vsSaved, currency, true) : '—'}
          detail={
            summary.vsLastMonth.hasPrevious
              ? `Spending ${vsSpend <= 0 ? 'down' : 'up'} ${formatMoney(Math.abs(vsSpend), currency)}`
              : 'No previous-month comparison yet'
          }
        />
        <CalcCard
          label="Projected cycle-end"
          value={formatMoney(summary.projectedSaved, currency, true)}
          detail={`If you keep spending ${formatMoney(summary.dailyAverage, currency)}/day`}
        />
      </div>

      <section className="card-surface rounded-3xl p-5">
        <h2 className="text-base font-semibold">How the numbers are built</h2>
        <dl className="mt-4 grid gap-3 text-sm">
          <Row label="Income logged" value={formatMoney(summary.income, currency)} />
          <Row label="Payments logged" value={formatMoney(summary.expenses, currency)} />
          <Row label="Saved" value={`${formatMoney(summary.income, currency)} − ${formatMoney(summary.expenses, currency)}`} />
          <Row
            label="Average daily spend"
            value={`${formatMoney(summary.expenses, currency)} ÷ ${summary.daysElapsed} days`}
          />
          <Row
            label="Projected spend"
            value={`${formatMoney(summary.dailyAverage, currency)} × ${summary.daysTotal} days`}
          />
        </dl>
      </section>

      <section className="card-surface overflow-hidden rounded-3xl">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">Category totals for this pay cycle</caption>
          <thead className="bg-raised text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Total</th>
              <th className="hidden px-4 py-3 font-medium sm:table-cell">Share</th>
              <th className="hidden px-4 py-3 font-medium sm:table-cell">Budget</th>
            </tr>
          </thead>
          <tbody>
            {summary.expenseByCategory
              .filter((row) => row.total > 0)
              .map((row) => (
                <tr key={row.category.id} className="border-t border-border">
                  <td className="px-4 py-3">{row.category.name}</td>
                  <td className="money px-4 py-3">{formatMoney(row.total, currency)}</td>
                  <td className="hidden px-4 py-3 sm:table-cell">{formatPercent(row.percentOfSpend)}</td>
                  <td className="hidden px-4 py-3 sm:table-cell">
                    {row.budget ? formatMoney(row.budget, currency) : '—'}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </section>

      <Suspense
        fallback={<div className="card-surface h-72 animate-pulse rounded-3xl" aria-hidden />}
      >
        <InsightCharts summary={summary} currency={currency} />
      </Suspense>
    </div>
  )
}

function CalcCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <article className="card-surface rounded-3xl p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="money mt-2 text-2xl font-semibold">{value}</p>
      <p className="mt-2 text-xs leading-5 text-muted-foreground">{detail}</p>
    </article>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border pb-3 last:border-0 last:pb-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="money text-right font-medium">{value}</dd>
    </div>
  )
}
