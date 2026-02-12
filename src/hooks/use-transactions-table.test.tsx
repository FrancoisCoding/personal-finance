import React from 'react'
import { renderHook, act, waitFor } from '@testing-library/react'
import { Provider, createStore } from 'jotai'
import type { ColumnDef } from '@tanstack/react-table'

import useTransactionsTable from './use-transactions-table'
import { transactionsTablePinningAtom } from '@/store/transactions-table-atoms'

type RowData = {
  id: string
  name: string
}

describe('useTransactionsTable', () => {
  it('pins columns and updates filters', async () => {
    const store = createStore()
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    )

    const data: RowData[] = [
      { id: '1', name: 'Alpha' },
      { id: '2', name: 'Beta' },
    ]
    const columns: ColumnDef<RowData>[] = [
      {
        accessorKey: 'name',
        header: 'Name',
      },
    ]

    const { result } = renderHook(
      () =>
        useTransactionsTable({
          data,
          columns,
          columnsToPinLeft: ['name'],
          getRowId: (row) => row.id,
        }),
      { wrapper }
    )

    await waitFor(() => {
      expect(result.current.columnPinning.left).toEqual(['name'])
    })

    act(() => {
      result.current.setGlobalFilter('beta')
    })

    expect(result.current.globalFilter).toBe('beta')
  })

  it('skips pinning when no columns are provided', async () => {
    const store = createStore()
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    )

    const data: RowData[] = [{ id: '1', name: 'Alpha' }]
    const columns: ColumnDef<RowData>[] = [
      {
        accessorKey: 'name',
        header: 'Name',
      },
    ]

    const { result } = renderHook(
      () =>
        useTransactionsTable({
          data,
          columns,
          columnsToPinLeft: [],
        }),
      { wrapper }
    )

    await act(async () => {})
    await waitFor(() => {
      expect(result.current.columnPinning.left).toEqual([])
    })
  })

  it('defaults to no pinned columns when columnsToPinLeft is omitted', async () => {
    const store = createStore()
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    )

    const data: RowData[] = [{ id: '1', name: 'Alpha' }]
    const columns: ColumnDef<RowData>[] = [
      {
        accessorKey: 'name',
        header: 'Name',
      },
    ]

    const { result } = renderHook(
      () =>
        useTransactionsTable({
          data,
          columns,
        }),
      { wrapper }
    )

    await act(async () => {})
    await waitFor(() => {
      expect(result.current.columnPinning.left).toEqual([])
    })
  })

  it('does not override existing pinned columns', async () => {
    const store = createStore()
    store.set(transactionsTablePinningAtom, { left: ['id'], right: [] })
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    )

    const data: RowData[] = [{ id: '1', name: 'Alpha' }]
    const columns: ColumnDef<RowData>[] = [
      {
        accessorKey: 'name',
        header: 'Name',
      },
    ]

    const { result } = renderHook(
      () =>
        useTransactionsTable({
          data,
          columns,
          columnsToPinLeft: ['name'],
        }),
      { wrapper }
    )

    await act(async () => {})
    await waitFor(() => {
      expect(result.current.columnPinning.left).toEqual(['id'])
    })
  })

  it('leaves left pinning undefined when not provided', async () => {
    const store = createStore()
    store.set(transactionsTablePinningAtom, { right: [] })
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    )

    const data: RowData[] = [{ id: '1', name: 'Alpha' }]
    const columns: ColumnDef<RowData>[] = [
      {
        accessorKey: 'name',
        header: 'Name',
      },
    ]

    const { result } = renderHook(
      () =>
        useTransactionsTable({
          data,
          columns,
          columnsToPinLeft: ['name'],
        }),
      { wrapper }
    )

    await act(async () => {})
    await waitFor(() => {
      expect(result.current.columnPinning.left).toBeUndefined()
    })
  })
})
