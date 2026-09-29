import { Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { CategoryGlyph } from '@/components/CategoryGlyph'
import { MonthSwitcher } from '@/components/MonthSwitcher'
import { formatDay, formatMoney } from '@/lib/format'
import { groupByDate, monthTransactions } from '@/lib/money'
import type { Category, Transaction, TxType } from '@/lib/types'
import { cn } from '@/lib/utils'

export function ActivityPage({
  month,
  onMonth,
  transactions,
  categories,
  currency,
  onOpen,
  onDelete,
  payDay,
}: {
  month: string
  onMonth: (month: string) => void
  transactions: Transaction[]
  categories: Category[]
  currency: string
  onOpen: (tx: Transaction) => void
  onDelete: (tx: Transaction) => void
  payDay: number
}) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'all' | TxType>('all')

  const grouped = useMemo(() => {
    const monthTx = monthTransactions(transactions, month, payDay).filter((tx) => {
      const category = categories.find((item) => item.id === tx.categoryId)
      const hay = `${tx.note} ${category?.name ?? ''}`.toLowerCase()
      const matchesQuery = hay.includes(query.trim().toLowerCase())
      const matchesType = filter === 'all' || tx.type === filter
      return matchesQuery && matchesType
    })
    return groupByDate(monthTx)
  }, [transactions, month, categories, query, filter, payDay])

  return (
    <div className="grid gap-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Activity</h1>
          <p className="mt-1 text-sm text-muted-foreground">Every payment and deposit this pay cycle.</p>
        </div>
        <div className="w-full max-w-sm lg:w-80">
          <MonthSwitcher month={month} onChange={onMonth} />
        </div>
      </div>

      <label className="relative block">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search notes or categories"
          className="h-12 w-full rounded-2xl bg-card pl-11 pr-4 shadow-sm outline-none ring-1 ring-border focus:ring-2 focus:ring-primary"
        />
      </label>

      <div className="flex gap-2">
        {(['all', 'expense', 'income'] as const).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setFilter(item)}
            className={cn(
              'h-10 rounded-full px-4 text-sm font-medium capitalize',
              filter === item ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground',
            )}
          >
            {item === 'all' ? 'All' : item}
          </button>
        ))}
      </div>

      {grouped.length === 0 ? (
        <div className="card-surface rounded-3xl p-8 text-center text-sm text-muted-foreground">
          Nothing matches this filter.
        </div>
      ) : (
        grouped.map(([date, rows]) => (
          <section key={date}>
            <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {formatDay(date)}
            </h2>
            <ul className="card-surface divide-y divide-border overflow-hidden rounded-3xl">
              {rows.map((tx) => {
                const category = categories.find((item) => item.id === tx.categoryId)
                return (
                  <li key={tx.id} className="flex items-center gap-2 pr-2">
                    <button
                      type="button"
                      onClick={() => onOpen(tx)}
                      className="flex min-w-0 flex-1 items-center gap-3 px-4 py-3 text-left"
                    >
                      <CategoryGlyph
                        icon={category?.icon ?? 'dots'}
                        color={category?.color ?? '#94A3B8'}
                        size={16}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">
                          {tx.note || category?.name || 'Transaction'}
                        </span>
                        <span className="text-xs text-muted-foreground">{category?.name}</span>
                      </span>
                      <span
                        className={`money text-sm font-semibold ${tx.type === 'income' ? 'text-success' : ''}`}
                      >
                        {formatMoney(tx.type === 'income' ? tx.amount : -tx.amount, currency, true)}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(tx)}
                      className="h-11 rounded-xl px-3 text-xs font-medium text-destructive"
                    >
                      Delete
                    </button>
                  </li>
                )
              })}
            </ul>
          </section>
        ))
      )}
    </div>
  )
}
