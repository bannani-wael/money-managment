import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function uid() {
  return crypto.randomUUID()
}

export function ordinal(n: number) {
  const v = n % 100
  if (v >= 11 && v <= 13) return `${n}th`
  switch (n % 10) {
    case 1:
      return `${n}st`
    case 2:
      return `${n}nd`
    case 3:
      return `${n}rd`
    default:
      return `${n}th`
  }
}

export function clampDay(payDay: number, year: number, monthIndex: number) {
  const last = new Date(year, monthIndex + 1, 0).getDate()
  return Math.min(Math.max(Math.round(payDay) || 1, 1), last)
}

export function monthKey(date: Date | string = new Date()) {
  const d = typeof date === 'string' ? parseISODate(date) : date
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function parseISODate(iso: string) {
  const [year, month, day] = iso.split('-').map(Number)
  return new Date(year ?? 1970, (month ?? 1) - 1, day ?? 1)
}

export function todayISO() {
  return toISODate(new Date())
}

export function toISODate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function shiftMonth(key: string, delta: number) {
  const [year, month] = key.split('-').map(Number)
  const d = new Date(year ?? 1970, (month ?? 1) - 1 + delta, 1)
  return monthKey(d)
}

export function monthLabel(key: string) {
  const [year, month] = key.split('-').map(Number)
  return new Date(year ?? 1970, (month ?? 1) - 1, 1).toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  })
}

export function cycleStart(key: string, payDay: number) {
  const [year, month] = key.split('-').map(Number)
  const y = year ?? 1970
  const m = (month ?? 1) - 1
  return new Date(y, m, clampDay(payDay, y, m))
}

export function cycleEnd(key: string, payDay: number) {
  const nextStart = cycleStart(shiftMonth(key, 1), payDay)
  return new Date(nextStart.getFullYear(), nextStart.getMonth(), nextStart.getDate() - 1)
}

export function cycleRangeISO(key: string, payDay: number) {
  return {
    start: toISODate(cycleStart(key, payDay)),
    end: toISODate(cycleEnd(key, payDay)),
  }
}

export function cycleKey(date: Date | string = new Date(), payDay = 1) {
  const d = typeof date === 'string' ? parseISODate(date) : date
  const start = clampDay(payDay, d.getFullYear(), d.getMonth())
  if (d.getDate() >= start) return monthKey(d)
  return shiftMonth(monthKey(d), -1)
}

export function inCycle(iso: string, key: string, payDay: number) {
  const { start, end } = cycleRangeISO(key, payDay)
  return iso >= start && iso <= end
}

export function eachCycleDate(key: string, payDay: number) {
  const { start, end } = cycleRangeISO(key, payDay)
  const dates: string[] = []
  const cursor = parseISODate(start)
  const last = parseISODate(end)
  while (cursor <= last) {
    dates.push(toISODate(cursor))
    cursor.setDate(cursor.getDate() + 1)
  }
  return dates
}

export function cycleRangeLabel(key: string, payDay: number) {
  const { start, end } = cycleRangeISO(key, payDay)
  const from = parseISODate(start).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  const to = parseISODate(end).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
  return `${from} – ${to}`
}
