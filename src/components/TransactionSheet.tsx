import { useEffect, useMemo, useState } from 'react'
import { X } from 'lucide-react'
import { CategoryGlyph } from '@/components/CategoryGlyph'
import { useLedger } from '@/context/LedgerContext'
import { parseAmount } from '@/lib/money'
import type { Transaction, TxType } from '@/lib/types'
import { cn, cycleRangeISO, inCycle, todayISO, uid } from '@/lib/utils'

export function TransactionSheet({
  open,
  month,
  editing,
  preset,
  onClose,
}: {
  open: boolean
  month: string
  editing: Transaction | null
  preset?: 'salary' | null
  onClose: () => void
}) {
  const { state, dispatch } = useLedger()
  const [type, setType] = useState<TxType>('expense')
  const [amount, setAmount] = useState('')
  const [categoryId, setCategoryId] = useState(state.categories[0]?.id ?? '')
  const [date, setDate] = useState(todayISO())
  const [note, setNote] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    if (editing) {
      setType(editing.type)
      setAmount(String(editing.amount))
      setCategoryId(editing.categoryId)
      setDate(editing.date)
      setNote(editing.note)
      setError('')
      return
    }
    if (preset === 'salary') {
      setType('income')
      setAmount(state.settings.monthlyIncomeGoal ? String(state.settings.monthlyIncomeGoal) : '')
      setCategoryId(state.categories.find((c) => c.id === 'salary')?.id ?? '')
      setDate(cycleRangeISO(month, state.settings.payDay || 28).start)
      setNote('Monthly salary')
      setError('')
      return
    }
    setType('expense')
    setAmount('')
    setCategoryId(state.categories.find((c) => c.type === 'expense')?.id ?? '')
    const payDay = state.settings.payDay || 28
    const today = todayISO()
    setDate(inCycle(today, month, payDay) ? today : cycleRangeISO(month, payDay).start)
    setNote('')
    setError('')
  }, [open, editing, month, preset, state.categories, state.settings.monthlyIncomeGoal, state.settings.payDay])

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const categories = useMemo(
    () => state.categories.filter((category) => category.type === type),
    [state.categories, type],
  )

  if (!open) return null

  function submit() {
    const value = parseAmount(amount)
    if (value <= 0) {
      setError('Enter an amount greater than zero.')
      return
    }
    if (!categoryId) {
      setError('Pick a category.')
      return
    }
    const tx: Transaction = {
      id: editing?.id ?? uid(),
      type,
      amount: value,
      categoryId,
      note: note.trim(),
      date,
      createdAt: editing?.createdAt ?? new Date().toISOString(),
    }
    dispatch({ type: editing ? 'update-tx' : 'add-tx', tx })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-6">
      <button type="button" className="absolute inset-0 bg-overlay" aria-label="Close" onClick={onClose} />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="tx-title"
        className="card-surface relative max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] sm:rounded-3xl"
      >
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-border sm:hidden" />
        <div className="flex items-center justify-between">
          <h2 id="tx-title" className="text-lg font-semibold">
            {editing ? 'Edit transaction' : 'Add transaction'}
          </h2>
          <button
            type="button"
            className="inline-flex size-11 items-center justify-center rounded-full bg-secondary"
            aria-label="Close"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 rounded-2xl bg-secondary p-1">
          {(['expense', 'income'] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                setType(option)
                const next = state.categories.find((c) => c.type === option)
                if (next) setCategoryId(next.id)
              }}
              className={cn(
                'h-11 rounded-xl text-sm font-semibold capitalize transition',
                type === option ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground',
              )}
            >
              {option}
            </button>
          ))}
        </div>

        <label className="mt-5 block">
          <span className="mb-2 block text-sm font-medium text-muted-foreground">Amount</span>
          <input
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            inputMode="decimal"
            placeholder="0.00"
            autoFocus
            className="money h-16 w-full rounded-2xl bg-raised px-4 text-3xl font-semibold outline-none ring-primary focus:ring-2"
          />
        </label>
        {error ? (
          <p className="mt-2 text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}

        <fieldset className="mt-5">
          <legend className="mb-2 text-sm font-medium text-muted-foreground">Category</legend>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => setCategoryId(category.id)}
                className={cn(
                  'flex min-h-14 items-center gap-3 rounded-2xl border px-3 py-2 text-left transition',
                  categoryId === category.id
                    ? 'border-primary bg-primary/10'
                    : 'border-transparent bg-raised',
                )}
              >
                <CategoryGlyph icon={category.icon} color={category.color} size={16} />
                <span className="text-sm font-medium leading-tight">{category.name}</span>
              </button>
            ))}
          </div>
        </fieldset>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-muted-foreground">Date</span>
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="h-12 w-full rounded-2xl bg-raised px-4 outline-none ring-primary focus:ring-2"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-muted-foreground">Note</span>
            <input
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Optional"
              className="h-12 w-full rounded-2xl bg-raised px-4 outline-none ring-primary focus:ring-2"
            />
          </label>
        </div>

        <button
          type="button"
          onClick={submit}
          className="mt-6 h-[3.25rem] w-full rounded-2xl bg-primary text-base font-semibold text-primary-foreground transition hover:opacity-90"
        >
          {editing ? 'Save changes' : type === 'income' ? 'Add income' : 'Add payment'}
        </button>
      </section>
    </div>
  )
}
