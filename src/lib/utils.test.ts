import {
  calculatePercentage,
  cn,
  debounce,
  formatCurrency,
  formatDate,
  formatDateTime,
  generateId,
  getCategoryColor,
  getCategoryIcon,
  getMonthRange,
  getRelativeTime,
  getWeekRange,
  isValidEmail,
  truncateText,
} from './utils'

describe('utils', () => {
  it('merges class names', () => {
    expect(cn('base', { active: true }, 'extra')).toContain('base')
    expect(cn('base', { active: true }, 'extra')).toContain('active')
  })

  it('formats currency values', () => {
    expect(formatCurrency(1234.5)).toBe('$1,234.50')
  })

  it('formats dates and times', () => {
    expect(formatDate('2024-02-01')).toContain('2024')
    expect(formatDateTime('2024-02-01T15:30:00Z')).toContain('2024')
    const date = new Date('2024-02-02T05:00:00Z')
    expect(formatDate(date)).toContain('2024')
    expect(formatDateTime(date)).toContain('2024')
  })

  it('returns relative times across ranges', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-02-01T00:00:00Z'))

    expect(getRelativeTime(new Date('2024-02-01T00:00:00Z'))).toBe('Just now')
    expect(getRelativeTime('2024-02-01T00:00:30Z')).toBe('Just now')
    expect(getRelativeTime('2024-01-31T23:59:00Z')).toBe('1m ago')
    expect(getRelativeTime('2024-01-31T22:30:00Z')).toBe('1h ago')
    expect(getRelativeTime('2024-01-31T00:00:00Z')).toBe('1d ago')
    expect(getRelativeTime('2024-01-01T00:00:00Z')).toBe('1mo ago')
    expect(getRelativeTime('2023-12-01T00:00:00Z')).toBe('2mo ago')
    expect(getRelativeTime('2022-01-01T00:00:00Z')).toBe('2y ago')

    vi.useRealTimers()
  })

  it('calculates percentages safely', () => {
    expect(calculatePercentage(25, 200)).toBe(13)
    expect(calculatePercentage(10, 0)).toBe(0)
  })

  it('returns month and week ranges', () => {
    const monthRange = getMonthRange(2, 2024)
    expect(monthRange.startDate.getMonth()).toBe(1)
    expect(monthRange.endDate.getDate()).toBe(29)

    const weekRange = getWeekRange(new Date('2024-02-07T12:00:00Z'))
    expect(weekRange.startDate.getDay()).toBe(0)
    expect(weekRange.endDate.getDay()).toBe(6)
  })

  it('generates an id', () => {
    const id = generateId()
    expect(id.length).toBeGreaterThan(0)
  })

  it('debounces calls', () => {
    vi.useFakeTimers()
    const spy = vi.fn()
    const debounced = debounce(spy, 100)

    debounced()
    debounced()
    expect(spy).not.toHaveBeenCalled()

    vi.advanceTimersByTime(100)
    expect(spy).toHaveBeenCalledTimes(1)
    vi.useRealTimers()
  })

  it('returns category colors with a fallback', () => {
    expect(getCategoryColor('Housing')).toBe('#84CC16')
    expect(getCategoryColor('Unknown Category')).toBe('#9CA3AF')
  })

  it('returns category icons with a fallback', () => {
    expect(getCategoryIcon('Travel')).toBe('✈️')
    expect(getCategoryIcon('Unknown Category')).toBe('📋')
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
