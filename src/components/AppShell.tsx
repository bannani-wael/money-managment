import type { ReactNode } from 'react'
import {
  LayoutDashboard,
  PieChart,
  Plus,
  Receipt,
  Settings,
  Wallet,
} from 'lucide-react'
import type { TabId } from '@/lib/types'
import { cn } from '@/lib/utils'

const NAV: { id: TabId; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'home', label: 'Home', icon: LayoutDashboard },
  { id: 'activity', label: 'Activity', icon: Receipt },
  { id: 'budgets', label: 'Budgets', icon: Wallet },
  { id: 'insights', label: 'Insights', icon: PieChart },
]

export function AppShell({
  tab,
  onTab,
  onAdd,
  onSettings,
  children,
}: {
  tab: TabId
  onTab: (tab: TabId) => void
  onAdd: () => void
  onSettings: () => void
  children: ReactNode
}) {
  return (
    <div className="mesh-bg min-h-dvh">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[80] focus:rounded-lg focus:bg-card focus:px-3 focus:py-2"
      >
        Skip to main content
      </a>

      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r bg-card/80 p-5 backdrop-blur-xl lg:flex">
        <div className="flex items-center gap-3 px-2">
          <Mark />
          <div>
            <p className="text-lg font-bold tracking-tight">Folio</p>
            <p className="text-xs text-muted-foreground">Monthly money map</p>
          </div>
        </div>
        <nav className="mt-8 grid gap-1" aria-label="Primary">
          {NAV.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onTab(item.id)}
              className={cn(
                'flex h-12 items-center gap-3 rounded-2xl px-3 text-sm font-medium transition',
                tab === item.id
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>
        <button
          type="button"
          onClick={onAdd}
          className="mt-6 flex h-12 items-center justify-center gap-2 rounded-2xl bg-accent font-semibold text-accent-foreground"
        >
          <Plus size={18} />
          Add transaction
        </button>
        <button
          type="button"
          onClick={onSettings}
          className="mt-auto flex h-12 items-center gap-3 rounded-2xl px-3 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <Settings size={18} />
          Settings
        </button>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b bg-background/80 px-4 py-3 pt-[calc(0.75rem+env(safe-area-inset-top))] backdrop-blur-xl lg:hidden">
          <div className="flex items-center gap-2">
            <Mark />
            <span className="text-base font-bold">Folio</span>
          </div>
          <button
            type="button"
            onClick={onSettings}
            className="inline-flex size-11 items-center justify-center rounded-full bg-secondary"
            aria-label="Open settings"
          >
            <Settings size={18} />
          </button>
        </header>

        <main
          id="main"
          className="mx-auto w-full max-w-6xl px-4 pb-[calc(7.5rem+env(safe-area-inset-bottom))] pt-4 lg:px-8 lg:pb-10 lg:pt-8"
        >
          {children}
        </main>
      </div>

      <button
        type="button"
        onClick={onAdd}
        className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] right-4 z-40 inline-flex size-14 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lg transition hover:scale-[0.97] lg:hidden"
        aria-label="Add transaction"
      >
        <Plus size={24} />
      </button>

      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t bg-card/90 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden"
        aria-label="Primary"
      >
        <div className="mx-auto grid max-w-lg grid-cols-4">
          {NAV.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onTab(item.id)}
              className={cn(
                'flex min-h-14 flex-col items-center justify-center gap-1 text-[11px] font-medium',
                tab === item.id ? 'text-primary' : 'text-muted-foreground',
              )}
            >
              <item.icon size={20} />
              {item.label}
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}

function Mark() {
  return (
    <span className="inline-flex size-9 items-center justify-center rounded-xl bg-primary font-mono text-sm font-bold text-primary-foreground">
      F
    </span>
  )
}
