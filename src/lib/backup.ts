import { emptyState } from '@/lib/demo'
import type { Budget, Category, LedgerState, Transaction, TxType } from '@/lib/types'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function asTxType(value: unknown): TxType | null {
  return value === 'income' || value === 'expense' ? value : null
}

function parseTransaction(raw: unknown): Transaction | null {
  if (!isRecord(raw)) return null
  const type = asTxType(raw.type)
  const amount = Number(raw.amount)
  const date = String(raw.date ?? '')
  if (!type || !Number.isFinite(amount) || amount < 0) return null
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null
  return {
    id: String(raw.id || crypto.randomUUID()),
    type,
    amount,
    categoryId: String(raw.categoryId ?? ''),
    note: String(raw.note ?? ''),
    date,
    createdAt: String(raw.createdAt || new Date().toISOString()),
  }
}

function parseCategory(raw: unknown): Category | null {
  if (!isRecord(raw)) return null
  const type = asTxType(raw.type)
  const name = String(raw.name ?? '').trim()
  if (!type || !name) return null
  return {
    id: String(raw.id || crypto.randomUUID()),
    name,
    type,
    color: String(raw.color || '#64748B'),
    icon: String(raw.icon || 'dots'),
  }
}

function parseBudget(raw: unknown): Budget | null {
  if (!isRecord(raw)) return null
  const categoryId = String(raw.categoryId ?? '')
  const monthlyLimit = Number(raw.monthlyLimit)
  if (!categoryId || !Number.isFinite(monthlyLimit) || monthlyLimit < 0) return null
  return { categoryId, monthlyLimit }
}

export function parseBackup(text: string): LedgerState {
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    throw new Error('That file is not valid JSON.')
  }

  if (!isRecord(parsed)) {
    throw new Error('That file is not a Folio backup.')
  }

  const defaults = emptyState()
  const transactions = Array.isArray(parsed.transactions)
    ? parsed.transactions.map(parseTransaction).filter((item): item is Transaction => item !== null)
    : []

  if (!Array.isArray(parsed.transactions)) {
    throw new Error('That file has no transactions list. Export again from Folio.')
  }

  const categories = Array.isArray(parsed.categories)
    ? parsed.categories.map(parseCategory).filter((item): item is Category => item !== null)
    : []
  const budgets = Array.isArray(parsed.budgets)
    ? parsed.budgets.map(parseBudget).filter((item): item is Budget => item !== null)
    : defaults.budgets

  const incoming = isRecord(parsed.settings) ? parsed.settings : {}
  const payDay = Number(incoming.payDay)

  return {
    transactions,
    categories: categories.length ? categories : defaults.categories,
    budgets,
    settings: {
      ...defaults.settings,
      name: String(incoming.name ?? defaults.settings.name),
      currency: String(incoming.currency || defaults.settings.currency),
      monthlyIncomeGoal: Number(incoming.monthlyIncomeGoal) || 0,
      payDay: Number.isFinite(payDay) && payDay >= 1 && payDay <= 31 ? payDay : defaults.settings.payDay,
      onboarded: true,
    },
  }
}

export function backupFileName() {
  return `folio-backup-${new Date().toISOString().slice(0, 10)}.json`
}

export function downloadBackup(state: LedgerState) {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = backupFileName()
  link.click()
  URL.revokeObjectURL(url)
}

export function readBackupFile(file: File) {
  return file.text().then(parseBackup)
}
