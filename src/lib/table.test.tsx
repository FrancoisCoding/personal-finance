import React from 'react'
import { render, screen } from '@testing-library/react'
import type { Row } from '@tanstack/react-table'

import { fuzzyFilter, getRowValue, highlightText } from './table'

describe('table helpers', () => {
  it('returns the original text when query is empty', () => {
    expect(highlightText('Hello', '')).toBe('Hello')
  })

  it('handles nullish text and query values', () => {
    expect(
      highlightText(
        undefined as unknown as string,
        undefined as unknown as string
      )
    ).toBe('')
  })

  it('returns the original text when no match is found', () => {
    expect(highlightText('Hello', 'xyz')).toBe('Hello')
  })

  it('highlights matching text segments', () => {
    render(<>{highlightText('Hello World', 'world')}</>)

    expect(screen.getByText('Hello')).not.toHaveClass('bg-amber-100')
    expect(screen.getByText('World')).toHaveClass('bg-amber-100')
  })

  it('returns highlighted fragments when matches exist', () => {
    const result = highlightText('Budget review', 'bud')

    expect(Array.isArray(result)).toBe(true)
    const nodes = result as React.ReactNode[]
    const highlighted = nodes.find(
      (node) =>
        React.isValidElement(node) &&
        String(node.props.className).includes('bg-amber-100')
    )

    expect(highlighted).toBeDefined()
  })

  it('filters rows using fuzzy matching', () => {
    const stringRow = {
      getValue: () => 'Alpha Beta',
    } as Row<unknown>

    expect(fuzzyFilter(stringRow, 'name', '')).toBe(true)
    expect(fuzzyFilter(stringRow, 'name', undefined)).toBe(true)
    expect(fuzzyFilter(stringRow, 'name', 'alpha')).toBe(true)
    expect(fuzzyFilter(stringRow, 'name', 'gamma')).toBe(false)

    const arrayRow = {
      getValue: () => ['Home', 'Auto'],
    } as Row<unknown>

    expect(fuzzyFilter(arrayRow, 'tags', 'auto')).toBe(true)

    const objectRow = {
      getValue: () => ({ label: 'Travel' }),
    } as Row<unknown>

    expect(fuzzyFilter(objectRow, 'meta', 'travel')).toBe(true)

    const emptyRow = {
      getValue: () => null,
    } as Row<unknown>

    expect(fuzzyFilter(emptyRow, 'meta', 'any')).toBe(false)

    const undefinedRow = {
      getValue: () => undefined,
    } as Row<unknown>

    expect(fuzzyFilter(undefinedRow, 'meta', 'any')).toBe(false)
  })

  it('reads row values with typed keys', () => {
    const row = {
      getValue: () => 42,
    } as Row<{ count: number }>

    expect(getRowValue(row, 'count')).toBe(42)
  })
})
