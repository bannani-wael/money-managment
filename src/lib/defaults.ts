import type { Category } from '@/lib/types'

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'food', name: 'Food & dining', type: 'expense', color: '#F59E0B', icon: 'utensils' },
  { id: 'transport', name: 'Transport', type: 'expense', color: '#38BDF8', icon: 'car' },
  { id: 'shopping', name: 'Shopping', type: 'expense', color: '#A78BFA', icon: 'bag' },
  { id: 'bills', name: 'Bills & utilities', type: 'expense', color: '#FB7185', icon: 'bolt' },
  { id: 'housing', name: 'Housing', type: 'expense', color: '#818CF8', icon: 'home' },
  { id: 'health', name: 'Health', type: 'expense', color: '#34D399', icon: 'heart' },
  { id: 'fun', name: 'Entertainment', type: 'expense', color: '#F472B6', icon: 'film' },
  { id: 'education', name: 'Education', type: 'expense', color: '#22D3EE', icon: 'book' },
  { id: 'personal', name: 'Personal', type: 'expense', color: '#FBBF24', icon: 'user' },
  { id: 'other-out', name: 'Other', type: 'expense', color: '#94A3B8', icon: 'dots' },
  { id: 'salary', name: 'Salary', type: 'income', color: '#10B981', icon: 'briefcase' },
  { id: 'freelance', name: 'Freelance', type: 'income', color: '#3B82F6', icon: 'laptop' },
  { id: 'invest', name: 'Investments', type: 'income', color: '#8B5CF6', icon: 'trend' },
  { id: 'gifts', name: 'Gifts', type: 'income', color: '#EC4899', icon: 'gift' },
  { id: 'other-in', name: 'Other income', type: 'income', color: '#64748B', icon: 'plus' },
]

export const DEFAULT_BUDGETS = [
  { categoryId: 'food', monthlyLimit: 500 },
  { categoryId: 'transport', monthlyLimit: 180 },
  { categoryId: 'shopping', monthlyLimit: 200 },
  { categoryId: 'bills', monthlyLimit: 220 },
  { categoryId: 'housing', monthlyLimit: 1400 },
  { categoryId: 'health', monthlyLimit: 120 },
  { categoryId: 'fun', monthlyLimit: 150 },
]
