import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useLedger } from '@/context/LedgerContext'
import { cycleKey, cycleRangeLabel, shiftMonth } from '@/lib/utils'

export function MonthSwitcher({
  month,
  onChange,
}: {
  month: string
  onChange: (next: string) => void
}) {
  const payDay = useLedger().state.settings.payDay || 28
  const current = cycleKey(new Date(), payDay)
  return (
    <div className="flex items-center justify-between gap-2">
      <button
        type="button"
        className="inline-flex size-11 items-center justify-center rounded-full bg-secondary text-foreground transition hover:bg-muted"
        aria-label="Previous pay cycle"
        onClick={() => onChange(shiftMonth(month, -1))}
      >
        <ChevronLeft size={18} />
      </button>
      <div className="text-center">
        <p className="text-sm font-semibold tracking-tight">{cycleRangeLabel(month, payDay)}</p>
        {month === current ? (
          <p className="text-xs text-muted-foreground">This pay cycle</p>
        ) : (
          <button
            type="button"
            className="text-xs font-medium text-primary"
            onClick={() => onChange(current)}
          >
            Jump to now
          </button>
        )}
      </div>
      <button
        type="button"
        className="inline-flex size-11 items-center justify-center rounded-full bg-secondary text-foreground transition hover:bg-muted disabled:opacity-40"
        aria-label="Next pay cycle"
        disabled={month >= current}
        onClick={() => onChange(shiftMonth(month, 1))}
      >
        <ChevronRight size={18} />
      </button>
    </div>
  )
}
