export type TxType = 'income' | 'expense'
export type TabId = 'home' | 'activity' | 'budgets' | 'insights'
export type ThemeMode = 'dark' | 'light'

export interface Category {
  id: string
  name: string
  type: TxType
  color: string
  icon: string
}

export interface Transaction {
  id: string
  type: TxType
  amount: number
  categoryId: string
  note: string
  date: string
  createdAt: string
}

export interface Budget {
  categoryId: string
  monthlyLimit: number
}

export interface Settings {
  onboarded: boolean
  name: string
  currency: string
  monthlyIncomeGoal: number
  payDay: number
}

export interface LedgerState {
  transactions: Transaction[]
  categories: Category[]
  budgets: Budget[]
  settings: Settings
}

export const CURRENCIES = [
  { code: 'QAR', name: 'Qatari Riyal' },
  { code: 'USD', name: 'US Dollar' },
  { code: 'EUR', name: 'Euro' },
  { code: 'GBP', name: 'British Pound' },
  { code: 'AED', name: 'UAE Dirham' },
  { code: 'SAR', name: 'Saudi Riyal' },
  { code: 'KWD', name: 'Kuwaiti Dinar' },
  { code: 'BHD', name: 'Bahraini Dinar' },
  { code: 'OMR', name: 'Omani Rial' },
  { code: 'EGP', name: 'Egyptian Pound' },
  { code: 'JOD', name: 'Jordanian Dinar' },
  { code: 'ILS', name: 'Israeli Shekel' },
  { code: 'TRY', name: 'Turkish Lira' },
] as const
