import { cycleKey, eachCycleDate, inCycle, shiftMonth, todayISO } from '@/lib/utils'
import type { Budget, Category, Transaction } from '@/lib/types'

export interface CategoryTotal {
  category: Category
  total: number
  budget: number
  percentOfSpend: number
  percentOfBudget: number
}

export interface MonthSummary {
  month: string
  income: number
  expenses: number
  saved: number
  savingsRate: number
  projectedIncome: number
  projectedExpenses: number
  projectedSaved: number
  dailyAverage: number
  dailyBudgetLeft: number
  daysElapsed: number
  daysLeft: number
  daysTotal: number
  expenseByCategory: CategoryTotal[]
  incomeByCategory: CategoryTotal[]
  dailySpend: { date: string; expenses: number; income: number }[]
  vsLastMonth: {
    saved: number
    expenses: number
    income: number
    hasPrevious: boolean
  }
  topExpense: CategoryTotal | null
  hasSalary: boolean
}

export function monthTransactions(transactions: Transaction[], month: string, payDay = 28) {
  return transactions.filter((tx) => inCycle(tx.date, month, payDay))
}

function sumByType(transactions: Transaction[], type: Transaction['type']) {
  return transactions
    .filter((tx) => tx.type === type)
    .reduce((sum, tx) => sum + tx.amount, 0)
}

function categoryTotals(
  transactions: Transaction[],
  categories: Category[],
  budgets: Budget[],
  type: Transaction['type'],
  totalForShare: number,
): CategoryTotal[] {
  const relevant = categories.filter((category) => category.type === type)
  return relevant
    .map((category) => {
      const total = transactions
        .filter((tx) => tx.categoryId === category.id)
        .reduce((sum, tx) => sum + tx.amount, 0)
      const budget = budgets.find((item) => item.categoryId === category.id)?.monthlyLimit ?? 0
      return {
        category,
        total,
        budget,
        percentOfSpend: totalForShare > 0 ? (total / totalForShare) * 100 : 0,
        percentOfBudget: budget > 0 ? (total / budget) * 100 : 0,
      }
    })
    .filter((row) => row.total > 0 || (type === 'expense' && row.budget > 0))
    .sort((a, b) => b.total - a.total)
}

function dailySeries(transactions: Transaction[], month: string, payDay: number) {
  return eachCycleDate(month, payDay).map((date) => {
    const dayTx = transactions.filter((tx) => tx.date === date)
    return {
      date,
      expenses: sumByType(dayTx, 'expense'),
      income: sumByType(dayTx, 'income'),
    }
  })
}

export function summarizeMonth(
  transactions: Transaction[],
  categories: Category[],
  budgets: Budget[],
  month: string,
  incomeGoal: number,
  payDay = 28,
): MonthSummary {
  const current = monthTransactions(transactions, month, payDay)
  const income = sumByType(current, 'income')
  const expenses = sumByType(current, 'expense')
  const saved = income - expenses
  const savingsRate = income > 0 ? (saved / income) * 100 : 0
  const dates = eachCycleDate(month, payDay)
  const totalDays = Math.max(dates.length, 1)
  const today = todayISO()
  const isCurrent = month === cycleKey(new Date(), payDay)
  const daysElapsed = isCurrent ? Math.max(dates.filter((date) => date <= today).length, 1) : totalDays
  const daysLeft = isCurrent ? dates.filter((date) => date > today).length : 0
  const dailyAverage = expenses / daysElapsed
  const projectedExpenses = isCurrent ? dailyAverage * totalDays : expenses
  const projectedIncome = income > 0 ? income : incomeGoal
  const projectedSaved = projectedIncome - projectedExpenses
  const remainingPool = Math.max(projectedIncome - expenses, 0)
  const dailyBudgetLeft = daysLeft > 0 ? remainingPool / daysLeft : remainingPool

  const lastMonth = summarizeQuick(transactions, shiftMonth(month, -1), payDay)
  const lastHasData = lastMonth.income > 0 || lastMonth.expenses > 0

  const expenseByCategory = categoryTotals(current, categories, budgets, 'expense', expenses)
  const incomeByCategory = categoryTotals(current, categories, budgets, 'income', income)
  const hasSalary = current.some((tx) => tx.type === 'income' && tx.categoryId === 'salary')

  return {
    month,
    income,
    expenses,
    saved,
    savingsRate,
    projectedIncome,
    projectedExpenses,
    projectedSaved,
    dailyAverage,
    dailyBudgetLeft,
    daysElapsed,
    daysLeft,
    daysTotal: totalDays,
    expenseByCategory,
    incomeByCategory,
    dailySpend: dailySeries(current, month, payDay),
    vsLastMonth: {
      saved: saved - lastMonth.saved,
      expenses: expenses - lastMonth.expenses,
      income: income - lastMonth.income,
      hasPrevious: lastHasData,
    },
    topExpense: expenseByCategory.find((row) => row.total > 0) ?? null,
    hasSalary,
  }
}

function summarizeQuick(transactions: Transaction[], month: string, payDay: number) {
  const current = monthTransactions(transactions, month, payDay)
  const income = sumByType(current, 'income')
  const expenses = sumByType(current, 'expense')
  return { income, expenses, saved: income - expenses }
}

export function greeting(name: string, date = new Date()) {
  const hour = date.getHours()
  const hello = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
  return name.trim() ? `${hello}, ${name.trim()}` : hello
}

export function parseAmount(raw: string) {
  const cleaned = raw.replace(/[^\d.]/g, '')
  const value = Number.parseFloat(cleaned)
  return Number.isFinite(value) ? value : 0
}

export function sortTransactions(transactions: Transaction[]) {
  return [...transactions].sort((a, b) => {
    if (a.date === b.date) return b.createdAt.localeCompare(a.createdAt)
    return b.date.localeCompare(a.date)
  })
}

export function groupByDate(transactions: Transaction[]) {
  const groups = new Map<string, Transaction[]>()
  for (const tx of sortTransactions(transactions)) {
    const list = groups.get(tx.date) ?? []
    list.push(tx)
    groups.set(tx.date, list)
  }
  return [...groups.entries()]
}
