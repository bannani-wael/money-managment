import { DEFAULT_BUDGETS, DEFAULT_CATEGORIES } from '@/lib/defaults'
import type { LedgerState, Transaction } from '@/lib/types'
import { cycleKey, cycleRangeISO, eachCycleDate, shiftMonth, todayISO, uid } from '@/lib/utils'

export function emptyState(): LedgerState {
  return {
    transactions: [],
    categories: DEFAULT_CATEGORIES,
    budgets: DEFAULT_BUDGETS,
    settings: {
      onboarded: false,
      name: '',
      currency: 'QAR',
      monthlyIncomeGoal: 0,
      payDay: 28,
    },
  }
}

export function demoState(base: LedgerState): LedgerState {
  const payDay = base.settings.payDay || 28
  const currentKey = cycleKey(new Date(), payDay)
  const prevKey = shiftMonth(currentKey, -1)
  const prevDates = eachCycleDate(prevKey, payDay)
  const currentStart = cycleRangeISO(currentKey, payDay).start
  const today = todayISO()
  const now = new Date().toISOString()
  const goal = base.settings.monthlyIncomeGoal || 4800
  const at = (index: number) => prevDates[Math.min(index, prevDates.length - 1)] ?? currentStart

  const transactions: Transaction[] = [
    { id: uid(), type: 'income', amount: goal, categoryId: 'salary', note: 'Monthly salary', date: at(0), createdAt: now },
    { id: uid(), type: 'expense', amount: Math.round(goal * 0.29), categoryId: 'housing', note: 'Rent', date: at(0), createdAt: now },
    { id: uid(), type: 'expense', amount: 86.4, categoryId: 'food', note: 'Groceries', date: at(2), createdAt: now },
    { id: uid(), type: 'expense', amount: 24.5, categoryId: 'food', note: 'Lunch with friends', date: at(3), createdAt: now },
    { id: uid(), type: 'expense', amount: 18.9, categoryId: 'transport', note: 'Transit card', date: at(5), createdAt: now },
    { id: uid(), type: 'expense', amount: 62, categoryId: 'bills', note: 'Internet', date: at(6), createdAt: now },
    { id: uid(), type: 'expense', amount: 41.2, categoryId: 'shopping', note: 'Toiletries', date: at(8), createdAt: now },
    { id: uid(), type: 'expense', amount: 15.8, categoryId: 'food', note: 'Coffee & pastry', date: at(9), createdAt: now },
    { id: uid(), type: 'expense', amount: 32, categoryId: 'fun', note: 'Cinema', date: at(11), createdAt: now },
    { id: uid(), type: 'income', amount: 420, categoryId: 'freelance', note: 'Weekend project', date: at(12), createdAt: now },
    { id: uid(), type: 'expense', amount: 74.9, categoryId: 'food', note: 'Weekly groceries', date: at(14), createdAt: now },
    { id: uid(), type: 'expense', amount: 48, categoryId: 'health', note: 'Pharmacy', date: at(16), createdAt: now },
    { id: uid(), type: 'expense', amount: 22.3, categoryId: 'transport', note: 'Ride share', date: at(18), createdAt: now },
    { id: uid(), type: 'expense', amount: 119, categoryId: 'bills', note: 'Electricity', date: at(20), createdAt: now },
    { id: uid(), type: 'expense', amount: 39, categoryId: 'fun', note: 'Streaming & apps', date: at(21), createdAt: now },
    { id: uid(), type: 'expense', amount: 27.6, categoryId: 'personal', note: 'Haircut', date: at(23), createdAt: now },
    { id: uid(), type: 'expense', amount: 55.4, categoryId: 'food', note: 'Dinner out', date: at(25), createdAt: now },
    { id: uid(), type: 'expense', amount: 16.2, categoryId: 'transport', note: 'Fuel', date: at(27), createdAt: now },
  ]

  if (today >= currentStart) {
    transactions.push({
      id: uid(),
      type: 'income',
      amount: goal,
      categoryId: 'salary',
      note: 'Monthly salary',
      date: currentStart,
      createdAt: now,
    })
  }

  return {
    ...base,
    transactions: [...transactions, ...base.transactions],
    settings: {
      ...base.settings,
      monthlyIncomeGoal: goal,
      payDay,
      onboarded: true,
    },
  }
}
