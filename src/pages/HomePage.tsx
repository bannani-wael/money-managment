import { Plus } from 'lucide-react'
import { CategoryBars, SavingsHero, Sparkline, StatGrid } from '@/components/Widgets'
import { formatMoney } from '@/lib/format'
import type { MonthSummary } from '@/lib/money'
import type { Category, Transaction } from '@/lib/types'
import { CategoryGlyph } from '@/components/CategoryGlyph'
import { MonthSwitcher } from '@/components/MonthSwitcher'
import { ordinal } from '@/lib/utils'

export function HomePage({
  summary,
  currency,
  greetingText,
  month,
  onMonth,
  onAdd,
  recent,
  categories,
  onOpenTx,
  onAddSalary,
  payDay,
}: {
  summary: MonthSummary
  currency: string
  greetingText: string
  month: string
  onMonth: (month: string) => void
  onAdd: () => void
  recent: Transaction[]
  categories: Category[]
  onOpenTx: (tx: Transaction) => void
  onAddSalary: () => void
  payDay: number
}) {
  const subtitle =
    summary.income > 0
      ? `${Math.round(summary.savingsRate)}% of this cycle’s income stayed put.`
      : summary.projectedIncome > 0
        ? 'Log salary to lock in savings. Projection uses your expected pay.'
        : 'Add income and payments to see what you kept.'

  return (
    <div className="grid gap-4 lg:gap-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{greetingText}</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">Your pay cycle, in one look</h1>
        </div>
        <div className="w-full max-w-sm lg:w-80">
          <MonthSwitcher month={month} onChange={onMonth} />
        </div>
      </div>

      {!summary.hasSalary ? (
        <button
          type="button"
          onClick={onAddSalary}
          className="card-surface flex w-full items-start justify-between gap-3 rounded-3xl p-4 text-left"
        >
          <span>
            <span className="block text-sm font-semibold">Payday is the {ordinal(payDay)}</span>
            <span className="mt-1 block text-sm leading-5 text-muted-foreground">
              Salary isn’t in this cycle yet. Tap to log it — anything before payday sits in the previous cycle.
            </span>
          </span>
          <span className="shrink-0 text-sm font-semibold text-primary">Add salary</span>
        </button>
      ) : null}

      <SavingsHero saved={summary.saved} rate={summary.savingsRate} currency={currency} subtitle={subtitle} />

      <StatGrid
        items={[
          {
            label: 'Income',
            value: formatMoney(summary.income, currency),
            hint: summary.projectedIncome && !summary.income ? `Goal ${formatMoney(summary.projectedIncome, currency)}` : undefined,
          },
          {
            label: 'Spent',
            value: formatMoney(summary.expenses, currency),
            hint: `${formatMoney(summary.dailyAverage, currency)} / day so far`,
          },
          {
            label: 'On track to save',
            value: formatMoney(summary.projectedSaved, currency, true),
            hint: summary.daysLeft ? `${summary.daysLeft} day${summary.daysLeft === 1 ? '' : 's'} left` : 'Cycle complete',
          },
          {
            label: 'Daily room',
            value: formatMoney(summary.dailyBudgetLeft, currency),
            hint: 'Spendable per remaining day',
          },
        ]}
      />

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="card-surface rounded-3xl p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold">By category</h2>
            <p className="text-xs text-muted-foreground">This pay cycle</p>
          </div>
          <CategoryBars rows={summary.expenseByCategory} currency={currency} />
        </section>
        <section className="card-surface rounded-3xl p-5">
          <h2 className="text-base font-semibold">Daily spend</h2>
          <Sparkline values={summary.dailySpend.filter((_, i) => i < summary.daysElapsed).map((d) => d.expenses)} />
          <p className="mt-2 text-sm text-muted-foreground">
            Biggest leak:{' '}
            {summary.topExpense
              ? `${summary.topExpense.category.name} · ${formatMoney(summary.topExpense.total, currency)}`
              : '—'}
          </p>
        </section>
      </div>

      <section className="card-surface rounded-3xl p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold">Recent</h2>
          <button type="button" onClick={onAdd} className="inline-flex items-center gap-1 text-sm font-medium text-primary">
            <Plus size={16} />
            Add
          </button>
        </div>
        {recent.length === 0 ? (
          <EmptyAdd onAdd={onAdd} />
        ) : (
          <ul className="grid divide-y divide-border">
            {recent.map((tx) => {
              const category = categories.find((item) => item.id === tx.categoryId)
              return (
                <li key={tx.id}>
                  <button
                    type="button"
                    onClick={() => onOpenTx(tx)}
                    className="flex w-full items-center gap-3 py-3 text-left"
                  >
                    <CategoryGlyph
                      icon={category?.icon ?? 'dots'}
                      color={category?.color ?? '#94A3B8'}
                      size={16}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{tx.note || category?.name}</span>
                      <span className="text-xs text-muted-foreground">{tx.date}</span>
                    </span>
                    <span
                      className={`money text-sm font-semibold ${tx.type === 'income' ? 'text-success' : ''}`}
                    >
                      {formatMoney(tx.type === 'income' ? tx.amount : -tx.amount, currency, true)}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}

function EmptyAdd({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="grid place-items-center py-8 text-center">
      <p className="text-sm text-muted-foreground">No payments yet this cycle.</p>
      <button
        type="button"
        onClick={onAdd}
        className="mt-3 h-11 rounded-2xl bg-primary px-4 text-sm font-semibold text-primary-foreground"
      >
        Add your first transaction
      </button>
    </div>
  )
}
