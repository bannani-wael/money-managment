import { Moon, Sun } from 'lucide-react'
import { BackupImportControl } from '@/components/BackupImportControl'
import { PayDaySelect } from '@/components/PayDaySelect'
import { useLedger } from '@/context/LedgerContext'
import { downloadBackup } from '@/lib/backup'
import type { LedgerState } from '@/lib/types'
import { CURRENCIES } from '@/lib/types'
import { cn } from '@/lib/utils'

export function SettingsPanel({
  open,
  onClose,
  onLoadDemo,
  onImported,
}: {
  open: boolean
  onClose: () => void
  onLoadDemo: () => void
  onImported?: (state: LedgerState) => void
}) {
  const { state, dispatch, theme, setTheme } = useLedger()

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[55] flex items-end justify-center sm:items-center sm:p-6">
      <button type="button" className="absolute inset-0 bg-overlay" aria-label="Close" onClick={onClose} />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        className="card-surface relative max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] sm:rounded-3xl"
      >
        <h2 id="settings-title" className="text-lg font-semibold">
          Settings
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">Stored on this device only.</p>

        <label className="mt-5 block">
          <span className="mb-2 block text-sm font-medium text-muted-foreground">Your name</span>
          <input
            value={state.settings.name}
            onChange={(event) => dispatch({ type: 'update-settings', patch: { name: event.target.value } })}
            className="h-12 w-full rounded-2xl bg-raised px-4 outline-none ring-primary focus:ring-2"
            placeholder="Alex"
          />
        </label>

        <label className="mt-4 block">
          <span className="mb-2 block text-sm font-medium text-muted-foreground">Currency</span>
          <select
            value={state.settings.currency}
            onChange={(event) =>
              dispatch({ type: 'update-settings', patch: { currency: event.target.value } })
            }
            className="h-12 w-full rounded-2xl bg-raised px-4 outline-none ring-primary focus:ring-2"
          >
            {CURRENCIES.map((currency) => (
              <option key={currency.code} value={currency.code}>
                {currency.code} — {currency.name}
              </option>
            ))}
          </select>
        </label>

        <label className="mt-4 block">
          <span className="mb-2 block text-sm font-medium text-muted-foreground">
            Expected monthly income
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
            placeholder="0"
          />
        </label>

        <PayDaySelect
          value={state.settings.payDay || 28}
          onChange={(day) => dispatch({ type: 'update-settings', patch: { payDay: day } })}
        />

        <div className="mt-5">
          <p className="mb-2 text-sm font-medium text-muted-foreground">Appearance</p>
          <div className="grid grid-cols-2 gap-2">
            {(['dark', 'light'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setTheme(mode)}
                className={cn(
                  'flex h-12 items-center justify-center gap-2 rounded-2xl border font-medium capitalize',
                  theme === mode ? 'border-primary bg-primary/10' : 'border-transparent bg-raised',
                )}
              >
                {mode === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
                {mode}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-2">
          <button
            type="button"
            onClick={onLoadDemo}
            className="h-12 rounded-2xl bg-secondary font-medium"
          >
            Load a sample month
          </button>
          <button
            type="button"
            onClick={() => downloadBackup(state)}
            className="h-12 rounded-2xl bg-secondary font-medium"
          >
            Export backup
          </button>
          <BackupImportControl
            label="Load from backup"
            className="h-12 w-full rounded-2xl bg-secondary font-medium"
            confirmReplace
            onSuccess={(next) => {
              onImported?.(next)
              onClose()
            }}
          />
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Clear all transactions? Categories and settings stay.')) {
                dispatch({ type: 'reset' })
                onClose()
              }
            }}
            className="h-12 rounded-2xl bg-destructive/10 font-medium text-destructive"
          >
            Clear transactions
          </button>
        </div>
      </section>
    </div>
  )
}
