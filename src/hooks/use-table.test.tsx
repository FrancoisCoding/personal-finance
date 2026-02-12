import { renderHook, act } from '@testing-library/react'
import type { ColumnDef } from '@tanstack/react-table'

import useTable from './use-table'

type RowData = {
  id: string
  name: string
}

describe('useTable', () => {
  it('creates a table instance with filtering', () => {
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

    const { result } = renderHook(() =>
      useTable({
        data,
        columns,
        columnsToPinLeft: ['name'],
        getRowId: (row) => row.id,
      })
    )

    expect(result.current.table.getRowModel().rows).toHaveLength(2)

    act(() => {
      result.current.setGlobalFilter('alpha')
    })

    expect(result.current.globalFilter).toBe('alpha')
  })

  it('uses default column pinning when none is provided', () => {
    const data: RowData[] = [{ id: '1', name: 'Alpha' }]
    const columns: ColumnDef<RowData>[] = [
      {
        accessorKey: 'name',
        header: 'Name',
      },
    ]

    const { result } = renderHook(() =>
      useTable({
        data,
        columns,
      })
    )

    expect(result.current.columnPinning.left).toEqual([])
  })
})
