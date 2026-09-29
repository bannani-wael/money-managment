import { useState } from 'react'
import { CategoryGlyph } from '@/components/CategoryGlyph'
import { MonthSwitcher } from '@/components/MonthSwitcher'
import { useLedger } from '@/context/LedgerContext'
import { formatMoney, formatPercent } from '@/lib/format'
import type { MonthSummary } from '@/lib/money'
import { cn, uid } from '@/lib/utils'

export function BudgetsPage({
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
  const { state, dispatch } = useLedger()
  const [newName, setNewName] = useState('')
  const expenses = state.categories.filter((category) => category.type === 'expense')

  return (
    <div className="grid gap-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Budgets</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Caps per category for this pay cycle. Progress updates as you log payments.
          </p>
        </div>
        <div className="w-full max-w-sm lg:w-80">
          <MonthSwitcher month={month} onChange={onMonth} />
        </div>
      </div>

      <section className="card-surface rounded-3xl p-5">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-muted-foreground">
            Expected income this month
          </span>
          <input
            inputMode="decimal"
            value={state.settings.monthlyIncomeGoal || ''}
            onChange={(event) =>
              dispatch({
                type: 'update-settings',
                patch: { monthlyIncomeGoal: Number(event.target.value) || 0 },
              })
            }
            className="h-12 w-full rounded-2xl bg-raised px-4 outline-none ring-primary focus:ring-2"
          />
        </label>
        <p className="mt-3 text-sm text-muted-foreground">
          Used for savings projections when salary is not logged yet this cycle.
        </p>
      </section>

      <ul className="grid gap-3">
        {expenses.map((category) => {
          const row = summary.expenseByCategory.find((item) => item.category.id === category.id)
          const spent = row?.total ?? 0
          const budget =
            state.budgets.find((item) => item.categoryId === category.id)?.monthlyLimit ?? 0
          const pct = budget > 0 ? (spent / budget) * 100 : 0
          const over = budget > 0 && spent > budget
          return (
            <li key={category.id} className="card-surface rounded-3xl p-4">
              <div className="flex items-start gap-3">
                <CategoryGlyph icon={category.icon} color={category.color} size={16} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium">{category.name}</p>
                    <p className={cn('money text-sm font-semibold', over && 'text-destructive')}>
                      {formatMoney(spent, currency)}
                      {budget ? ` / ${formatMoney(budget, currency)}` : ''}
                    </p>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.min(Math.max(pct, budget ? 3 : 0), 100)}%`,
                        background: over ? 'var(--destructive)' : category.color,
                      }}
                    />
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <p className="text-xs text-muted-foreground">
                      {budget ? (over ? `${formatPercent(pct)} used — over` : `${formatPercent(pct)} used`) : 'No cap'}
                    </p>
                    <label className="flex items-center gap-2 text-xs text-muted-foreground">
                      Cap
                      <input
                        inputMode="decimal"
                        className="h-10 w-24 rounded-xl bg-raised px-3 text-sm text-foreground outline-none ring-primary focus:ring-2"
                        value={budget || ''}
                        onChange={(event) =>
                          dispatch({
                            type: 'set-budget',
                            budget: {
                              categoryId: category.id,
                              monthlyLimit: Number(event.target.value) || 0,
                            },
                          })
                        }
                      />
                    </label>
                  </div>
                </div>
              </div>
            </li>
          )
        })}
      </ul>

      <form
        className="card-surface flex flex-col gap-3 rounded-3xl p-4 sm:flex-row"
        onSubmit={(event) => {
          event.preventDefault()
          const name = newName.trim()
          if (!name) return
          dispatch({
            type: 'add-category',
            category: {
              id: uid(),
              name,
              type: 'expense',
              color: '#64748B',
              icon: 'dots',
            },
          })
          setNewName('')
        }}
      >
        <input
          value={newName}
          onChange={(event) => setNewName(event.target.value)}
          placeholder="New category name"
          className="h-12 flex-1 rounded-2xl bg-raised px-4 outline-none ring-primary focus:ring-2"
        />
        <button type="submit" className="h-12 rounded-2xl bg-secondary px-5 font-medium">
          Add category
        </button>
      </form>
    </div>
  )
}
