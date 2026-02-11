import type { FilterFn, Row } from '@tanstack/react-table'

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

export const highlightText = (text: string, query: string | number) => {
  const safeText = String(text ?? '')
  const search = String(query ?? '').trim()

  if (!search) {
    return safeText
  }

  const parts = safeText.split(new RegExp(`(${escapeRegExp(search)})`, 'gi'))

  if (parts.length === 1) {
    return safeText
  }

  return parts.map((part, index) => {
    const isMatch = part.toLowerCase() === search.toLowerCase()

    if (isMatch) {
      return (
        <span
          key={`${part}-${index}`}
          className="rounded-sm bg-amber-100 px-1 text-amber-900 dark:bg-amber-500/20 dark:text-amber-100"
        >
          {part}
        </span>
      )
    }

    return <span key={`${part}-${index}`}>{part}</span>
  })
}

export const getRowValue = <TData, TKey extends keyof TData>(
  row: Row<TData>,
  key: TKey
) => row.getValue(String(key)) as TData[TKey]

export const fuzzyFilter: FilterFn<unknown> = (row, columnId, value) => {
  const search = String(value ?? '')
    .trim()
    .toLowerCase()

  if (!search) {
    return true
  }

  const rowValue = row.getValue(columnId)

  if (rowValue === null || rowValue === undefined) {
    return false
  }

  const normalized = Array.isArray(rowValue)
    ? rowValue.join(' ')
    : typeof rowValue === 'object'
      ? JSON.stringify(rowValue)
      : String(rowValue)

  return normalized.toLowerCase().includes(search)
}
