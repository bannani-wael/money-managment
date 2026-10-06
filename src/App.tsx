import { useEffect, useMemo, useState } from 'react'
import { AppShell } from '@/components/AppShell'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { SettingsPanel } from '@/components/SettingsPanel'
import { TransactionSheet } from '@/components/TransactionSheet'
import { useLedger } from '@/context/LedgerContext'
import { greeting, monthTransactions, sortTransactions, summarizeMonth } from '@/lib/money'
import type { TabId, Transaction } from '@/lib/types'
import { cycleKey } from '@/lib/utils'
import { ActivityPage } from '@/pages/ActivityPage'
import { BudgetsPage } from '@/pages/BudgetsPage'
import { HomePage } from '@/pages/HomePage'
import { InsightsPage } from '@/pages/InsightsPage'
import { Onboarding } from '@/pages/Onboarding'

export default function App() {
  const { state, dispatch } = useLedger()
  const payDay = state.settings.payDay || 28
  const [tab, setTab] = useState<TabId>('home')
  const [month, setMonth] = useState(() => cycleKey(new Date(), 28))
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editing, setEditing] = useState<Transaction | null>(null)
  const [preset, setPreset] = useState<'salary' | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<Transaction | null>(null)

  useEffect(() => {
    setMonth(cycleKey(new Date(), payDay))
  }, [payDay])

  const summary = useMemo(
    () =>
      summarizeMonth(
        state.transactions,
        state.categories,
        state.budgets,
        month,
        state.settings.monthlyIncomeGoal,
        payDay,
      ),
    [state.transactions, state.categories, state.budgets, month, state.settings.monthlyIncomeGoal, payDay],
  )

  const recent = useMemo(
    () => sortTransactions(monthTransactions(state.transactions, month, payDay)).slice(0, 6),
    [state.transactions, month, payDay],
  )

  if (!state.settings.onboarded) {
    return <Onboarding />
  }

  function openNew() {
    setEditing(null)
    setPreset(null)
    setSheetOpen(true)
  }

  function openEdit(tx: Transaction) {
    setEditing(tx)
    setSheetOpen(true)
  }

  return (
    <>
      <AppShell
        tab={tab}
        onTab={setTab}
        onAdd={openNew}
        onSettings={() => setSettingsOpen(true)}
      >
        {tab === 'home' ? (
          <HomePage
            summary={summary}
            currency={state.settings.currency}
            greetingText={greeting(state.settings.name)}
            month={month}
            onMonth={setMonth}
            onAdd={openNew}
            recent={recent}
            categories={state.categories}
            onOpenTx={openEdit}
            onAddSalary={() => {
              setEditing(null)
              setPreset('salary')
              setSheetOpen(true)
            }}
            payDay={payDay}
          />
        ) : null}
        {tab === 'activity' ? (
          <ActivityPage
            month={month}
            onMonth={setMonth}
            transactions={state.transactions}
            categories={state.categories}
            currency={state.settings.currency}
            onOpen={openEdit}
            onDelete={setPendingDelete}
            payDay={payDay}
          />
        ) : null}
        {tab === 'budgets' ? (
          <BudgetsPage
            month={month}
            onMonth={setMonth}
            summary={summary}
            currency={state.settings.currency}
          />
        ) : null}
        {tab === 'insights' ? (
          <InsightsPage
            month={month}
            onMonth={setMonth}
            summary={summary}
            currency={state.settings.currency}
          />
        ) : null}
      </AppShell>

      <TransactionSheet
        open={sheetOpen}
        month={month}
        editing={editing}
        preset={preset}
        onClose={() => {
          setSheetOpen(false)
          setEditing(null)
          setPreset(null)
        }}
      />
      <SettingsPanel
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onLoadDemo={() => {
          dispatch({ type: 'load-demo' })
          setMonth(cycleKey(new Date(), payDay))
          setSettingsOpen(false)
        }}
        onImported={(next) => setMonth(cycleKey(new Date(), next.settings.payDay || 28))}
      />
      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete this transaction?"
        body="This cannot be undone. Category totals and savings will update immediately."
        onClose={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) dispatch({ type: 'delete-tx', id: pendingDelete.id })
          setPendingDelete(null)
        }}
      />
    </>
  )
}
