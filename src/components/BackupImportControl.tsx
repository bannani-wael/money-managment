import { useRef, useState } from 'react'
import { useLedger } from '@/context/LedgerContext'
import { readBackupFile } from '@/lib/backup'
import type { LedgerState } from '@/lib/types'

export function BackupImportControl({
  label,
  className,
  confirmReplace,
  onSuccess,
}: {
  label: string
  className: string
  confirmReplace: boolean
  onSuccess?: (state: LedgerState) => void
}) {
  const { state, dispatch } = useLedger()
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState('')
  const [note, setNote] = useState('')

  async function handleFile(file: File | undefined) {
    if (!file) return
    if (confirmReplace && state.transactions.length > 0) {
      const ok = window.confirm(
        'This replaces all transactions, budgets, and settings on this device with the backup.',
      )
      if (!ok) {
        if (inputRef.current) inputRef.current.value = ''
        return
      }
    }

    try {
      const next = await readBackupFile(file)
      dispatch({ type: 'replace', state: next })
      setError('')
      setNote(
        `Loaded ${next.transactions.length} transaction${next.transactions.length === 1 ? '' : 's'}.`,
      )
      onSuccess?.(next)
    } catch (err) {
      setNote('')
      setError(err instanceof Error ? err.message : 'Could not read that file.')
    } finally {
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="grid gap-2">
      <input
        ref={inputRef}
        type="file"
        accept="application/json,.json"
        className="sr-only"
        onChange={(event) => void handleFile(event.target.files?.[0])}
      />
      <button type="button" className={className} onClick={() => inputRef.current?.click()}>
        {label}
      </button>
      {error ? (
        <p className="px-1 text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      {note ? <p className="px-1 text-sm text-muted-foreground">{note}</p> : null}
    </div>
  )
}
