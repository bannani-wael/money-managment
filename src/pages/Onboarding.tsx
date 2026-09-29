import { useState } from 'react'
import { PayDaySelect } from '@/components/PayDaySelect'
import { useLedger } from '@/context/LedgerContext'
import { CURRENCIES } from '@/lib/types'

export function Onboarding() {
  const { state, dispatch } = useLedger()
  const [name, setName] = useState(state.settings.name)
  const [currency, setCurrency] = useState(state.settings.currency)
  const [payDay, setPayDay] = useState(state.settings.payDay || 28)
  const [income, setIncome] = useState(
    state.settings.monthlyIncomeGoal ? String(state.settings.monthlyIncomeGoal) : '',
  )

  return (
    <div className="mesh-bg flex min-h-dvh items-end justify-center p-4 sm:items-center">
      <section className="card-surface w-full max-w-md rounded-3xl p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Folio</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">See where the month actually goes</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Log payments, split them by category, and watch savings, charts, and budgets update live.
          Everything stays on this device.
        </p>

        <label className="mt-6 block">
          <span className="mb-2 block text-sm font-medium">What should we call you?</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="h-12 w-full rounded-2xl bg-raised px-4 outline-none ring-primary focus:ring-2"
            placeholder="Optional"
          />
        </label>

        <label className="mt-4 block">
          <span className="mb-2 block text-sm font-medium">Currency</span>
          <select
            value={currency}
            onChange={(event) => setCurrency(event.target.value)}
            className="h-12 w-full rounded-2xl bg-raised px-4 outline-none ring-primary focus:ring-2"
          >
            {CURRENCIES.map((item) => (
              <option key={item.code} value={item.code}>
                {item.code} — {item.name}
              </option>
            ))}
          </select>
        </label>

        <label className="mt-4 block">
          <span className="mb-2 block text-sm font-medium">Typical monthly income</span>
          <input
            inputMode="decimal"
            value={income}
            onChange={(event) => setIncome(event.target.value)}
            className="h-12 w-full rounded-2xl bg-raised px-4 outline-none ring-primary focus:ring-2"
            placeholder="Helps project savings"
          />
        </label>

        <PayDaySelect value={payDay} onChange={setPayDay} />

        <button
          type="button"
          className="mt-6 h-12 w-full rounded-2xl bg-primary font-semibold text-primary-foreground"
          onClick={() =>
            dispatch({
              type: 'update-settings',
              patch: {
                onboarded: true,
                name: name.trim(),
                currency,
                monthlyIncomeGoal: Number(income) || 0,
                payDay,
              },
            })
          }
        >
          Start tracking
        </button>
        <button
          type="button"
          className="mt-2 h-12 w-full rounded-2xl text-sm font-medium text-muted-foreground"
          onClick={() => {
            dispatch({
              type: 'update-settings',
              patch: {
                onboarded: true,
                name: name.trim(),
                currency,
                monthlyIncomeGoal: Number(income) || 0,
                payDay,
              },
            })
            dispatch({ type: 'load-demo' })
          }}
        >
          Preview with sample data
        </button>
      </section>
    </div>
  )
}
