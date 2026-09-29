import { ordinal } from '@/lib/utils'

const DAYS = Array.from({ length: 31 }, (_, index) => index + 1)

export function PayDaySelect({
  value,
  onChange,
}: {
  value: number
  onChange: (day: number) => void
}) {
  return (
    <label className="mt-4 block">
      <span className="mb-2 block text-sm font-medium text-muted-foreground">Payday</span>
      <select
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-12 w-full rounded-2xl bg-raised px-4 outline-none ring-primary focus:ring-2"
      >
        {DAYS.map((day) => (
          <option key={day} value={day}>
            {ordinal(day)} of each month
          </option>
        ))}
      </select>
      <span className="mt-2 block text-xs leading-5 text-muted-foreground">
        Your cycle runs from this day until the day before the next payday. Spending before payday
        counts in the previous cycle.
      </span>
    </label>
  )
}
