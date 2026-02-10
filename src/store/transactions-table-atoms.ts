import { atom } from 'jotai'
import type {
  ColumnFiltersState,
  ColumnPinningState,
  PaginationState,
  SortingState,
  VisibilityState,
} from '@tanstack/react-table'

export const transactionsTableSortingAtom = atom<SortingState>([])
export const transactionsTableFiltersAtom = atom<ColumnFiltersState>([])
export const transactionsTablePinningAtom = atom<ColumnPinningState>({
  left: [],
  right: [],
})
export const transactionsTableVisibilityAtom = atom<VisibilityState>({})
export const transactionsTableGlobalFilterAtom = atom<string>('')
export const transactionsTableRowSelectionAtom = atom<Record<string, boolean>>(
  {}
)
export const transactionsTablePaginationAtom = atom<PaginationState>({
  pageIndex: 0,
  pageSize: 20,
})
