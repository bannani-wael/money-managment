import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatMoney, formatShortDay } from '@/lib/format'
import type { MonthSummary } from '@/lib/money'

export default function InsightCharts({
  summary,
  currency,
}: {
  summary: MonthSummary
  currency: string
}) {
  const spendRows = summary.expenseByCategory
    .filter((row) => row.total > 0)
    .slice(0, 8)
    .map((row) => ({
      name: row.category.name.split(' &')[0],
      total: Math.round(row.total * 100) / 100,
      fill: row.category.color,
    }))

  const daily = summary.dailySpend
    .filter((row) => row.expenses > 0 || row.income > 0)
    .map((row) => ({
      label: formatShortDay(row.date),
      expenses: row.expenses,
      income: row.income,
    }))

  const compare = [
    { name: 'Income', amount: summary.income, fill: 'var(--chart-2)' },
    { name: 'Spent', amount: summary.expenses, fill: 'var(--chart-5)' },
    { name: 'Saved', amount: Math.max(summary.saved, 0), fill: 'var(--chart-1)' },
  ]

  if (spendRows.length === 0 && daily.length === 0) {
    return (
      <div className="card-surface rounded-3xl p-8 text-center text-sm text-muted-foreground">
        Charts appear after you add a few transactions.
      </div>
    )
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <article className="card-surface rounded-3xl p-4 sm:p-5">
        <h3 className="text-sm font-semibold">Spending by category</h3>
        <p className="mt-1 text-xs text-muted-foreground">Largest at the top. Tap a bar for the exact amount.</p>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={spendRows} layout="vertical" margin={{ left: 8, right: 12, top: 8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" width={72} tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} />
              <Tooltip
                formatter={(value) => formatMoney(Number(value ?? 0), currency)}
                contentStyle={tooltipStyle}
              />
              <Bar dataKey="total" radius={[0, 8, 8, 0]} barSize={14}>
                {spendRows.map((row) => (
                  <Cell key={row.name} fill={row.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </article>

      <article className="card-surface rounded-3xl p-4 sm:p-5">
        <h3 className="text-sm font-semibold">Income vs spent vs saved</h3>
        <p className="mt-1 text-xs text-muted-foreground">How this month splits at a glance.</p>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={compare} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} />
              <YAxis hide />
              <Tooltip
                formatter={(value) => formatMoney(Number(value ?? 0), currency)}
                contentStyle={tooltipStyle}
              />
              <Bar dataKey="amount" radius={[8, 8, 0, 0]} barSize={36}>
                {compare.map((row) => (
                  <Cell key={row.name} fill={row.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </article>

      <article className="card-surface rounded-3xl p-4 sm:p-5 lg:col-span-2">
        <h3 className="text-sm font-semibold">Daily flow</h3>
        <p className="mt-1 text-xs text-muted-foreground">Solid line is spending. Dashed line is income on that day.</p>
        <div className="mt-4 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={daily.length ? daily : [{ label: '—', expenses: 0, income: 0 }]}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="label" tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} minTickGap={24} />
              <YAxis tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} width={40} />
              <Tooltip
                formatter={(value, name) => [
                  formatMoney(Number(value ?? 0), currency),
                  name === 'expenses' ? 'Spent' : 'Income',
                ]}
                contentStyle={tooltipStyle}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="expenses"
                stroke="var(--chart-5)"
                strokeWidth={2.5}
                dot={{ r: 3 }}
                name="Spent"
              />
              <Line
                type="monotone"
                dataKey="income"
                stroke="var(--chart-2)"
                strokeWidth={2.5}
                strokeDasharray="6 4"
                dot={{ r: 3 }}
                name="Income"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </article>
    </div>
  )
}

const tooltipStyle = {
  background: 'var(--popover)',
  border: '1px solid var(--border)',
  borderRadius: 12,
  color: 'var(--popover-foreground)',
}
