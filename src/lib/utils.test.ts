import { describe, expect, it } from 'vitest'
import {
  calculatePercentage,
  formatCurrency,
  getCategoryColor,
  isValidEmail,
  truncateText,
} from './utils'

describe('utils', () => {
  it('formats currency values', () => {
    expect(formatCurrency(1234.5)).toBe('$1,234.50')
  })

  it('calculates percentages safely', () => {
    expect(calculatePercentage(25, 200)).toBe(13)
    expect(calculatePercentage(10, 0)).toBe(0)
  })

  it('returns category colors with a fallback', () => {
    expect(getCategoryColor('Housing')).toBe('#84CC16')
    expect(getCategoryColor('Unknown Category')).toBe('#9CA3AF')
  })

  it('validates email addresses', () => {
    expect(isValidEmail('person@example.com')).toBe(true)
    expect(isValidEmail('invalid-email')).toBe(false)
  })

  it('truncates long text', () => {
    expect(truncateText('Hello world', 20)).toBe('Hello world')
    expect(truncateText('Hello world', 5)).toBe('Hello...')
  })
})
