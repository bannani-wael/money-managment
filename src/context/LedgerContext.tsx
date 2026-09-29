import { createContext, createElement, useContext, useEffect, useMemo, useReducer, useState, type ReactNode } from 'react'
import { demoState, emptyState } from '@/lib/demo'
import type { Budget, Category, LedgerState, Settings, ThemeMode, Transaction } from '@/lib/types'

const STORAGE_KEY = 'folio-ledger-v1'
const THEME_KEY = 'folio-theme'

type Action =
  | { type: 'replace'; state: LedgerState }
  | { type: 'add-tx'; tx: Transaction }
  | { type: 'update-tx'; tx: Transaction }
  | { type: 'delete-tx'; id: string }
  | { type: 'set-budget'; budget: Budget }
  | { type: 'add-category'; category: Category }
  | { type: 'update-settings'; patch: Partial<Settings> }
  | { type: 'load-demo' }
  | { type: 'reset' }

function reducer(state: LedgerState, action: Action): LedgerState {
  switch (action.type) {
    case 'replace':
      return action.state
    case 'add-tx':
      return { ...state, transactions: [action.tx, ...state.transactions] }
    case 'update-tx':
      return {
        ...state,
        transactions: state.transactions.map((tx) => (tx.id === action.tx.id ? action.tx : tx)),
      }
    case 'delete-tx':
      return { ...state, transactions: state.transactions.filter((tx) => tx.id !== action.id) }
    case 'set-budget':
      return {
        ...state,
        budgets: [
          ...state.budgets.filter((item) => item.categoryId !== action.budget.categoryId),
          action.budget,
        ],
      }
    case 'add-category':
      return { ...state, categories: [...state.categories, action.category] }
    case 'update-settings':
      return { ...state, settings: { ...state.settings, ...action.patch } }
    case 'load-demo':
      return demoState(state)
    case 'reset':
      return { ...emptyState(), settings: { ...emptyState().settings, onboarded: true } }
    default:
      return state
  }
}

function readState(): LedgerState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyState()
    const parsed = JSON.parse(raw) as LedgerState
    const settings = { ...emptyState().settings, ...parsed.settings }
    if (!localStorage.getItem('folio-currency-qar') && settings.currency === 'USD') {
      settings.currency = 'QAR'
    }
    localStorage.setItem('folio-currency-qar', '1')
    return {
      ...emptyState(),
      ...parsed,
      settings,
      categories: parsed.categories?.length ? parsed.categories : emptyState().categories,
    }
  } catch {
    return emptyState()
  }
}

function readTheme(): ThemeMode {
  const stored = localStorage.getItem(THEME_KEY)
  if (stored === 'light' || stored === 'dark') return stored
  return 'dark'
}

function applyTheme(theme: ThemeMode) {
  document.documentElement.classList.toggle('dark', theme === 'dark')
  document.documentElement.classList.toggle('light', theme === 'light')
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', theme === 'dark' ? '#080c14' : '#f4f7fb')
}

interface LedgerContextValue {
  state: LedgerState
  dispatch: (action: Action) => void
  theme: ThemeMode
  setTheme: (theme: ThemeMode) => void
}

const LedgerContext = createContext<LedgerContextValue | null>(null)

export function LedgerProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, readState)
  const [theme, setThemeState] = useState<ThemeMode>(readTheme)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  useEffect(() => {
    localStorage.setItem(THEME_KEY, theme)
    applyTheme(theme)
  }, [theme])

  const value = useMemo(
    () => ({
      state,
      dispatch,
      theme,
      setTheme: (next: ThemeMode) => setThemeState(next),
    }),
    [state, theme],
  )

  return createElement(LedgerContext.Provider, { value }, children)
}

export function useLedger() {
  const ctx = useContext(LedgerContext)
  if (!ctx) throw new Error('useLedger must be used inside LedgerProvider')
  return ctx
}
