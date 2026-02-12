import { createFetchResponse } from '../../tests/test-utils'

const originalEnv = { ...process.env }

const resetEnv = () => {
  process.env = { ...originalEnv }
}

const setEnv = (next: Record<string, string | undefined>) => {
  Object.entries(next).forEach(([key, value]) => {
    if (value === undefined) {
      delete process.env[key]
    } else {
      process.env[key] = value
    }
  })
}

describe('ai helpers', () => {
  afterEach(() => {
    resetEnv()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
    vi.resetModules()
  })

  it('skips testing when the API key is missing', async () => {
    setEnv({ OPENROUTER_API_KEY: '' })
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined)

    const { testHuggingFaceAPI } = await import('./ai')
    await testHuggingFaceAPI()

    expect(fetchMock).not.toHaveBeenCalled()
    expect(logSpy).toHaveBeenCalledWith('OpenRouter API key not configured')
  })

  it('logs successful OpenRouter model checks', async () => {
    setEnv({
      OPENROUTER_API_KEY: 'key',
      OPENROUTER_BASE_URL: 'https://openrouter.test',
      OPENROUTER_SITE_URL: 'https://site.test',
      OPENROUTER_SITE_NAME: 'Finance',
    })

    const fetchMock = vi.fn().mockResolvedValue(
      createFetchResponse({
        ok: true,
        json: { data: [{ id: 'model-1' }, { id: 'model-2' }] },
      })
    )
    vi.stubGlobal('fetch', fetchMock)
    vi.spyOn(console, 'log').mockImplementation(() => undefined)

    const { testHuggingFaceAPI } = await import('./ai')
    await testHuggingFaceAPI()

    expect(fetchMock).toHaveBeenCalledWith(
      'https://openrouter.test/models',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer key',
          'HTTP-Referer': 'https://site.test',
          'X-Title': 'Finance',
        }),
      })
    )
  })

  it('logs API errors and network failures during model checks', async () => {
    setEnv({ OPENROUTER_API_KEY: 'key', OPENROUTER_BASE_URL: 'https://api' })
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        createFetchResponse({ ok: false, status: 500, text: 'nope' })
      )
      .mockRejectedValueOnce(new Error('network'))
    vi.stubGlobal('fetch', fetchMock)
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined)

    const { testHuggingFaceAPI } = await import('./ai')
    await testHuggingFaceAPI()
    await testHuggingFaceAPI()

    expect(logSpy).toHaveBeenCalledWith('Error response:', 'nope')
    expect(logSpy).toHaveBeenCalledWith('Network error:', expect.any(Error))
  })

  it('falls back to the default model when the configured model is missing', async () => {
    setEnv({
      OPENROUTER_API_KEY: 'key',
      OPENROUTER_BASE_URL: 'https://openrouter.test',
      OPENROUTER_MODEL: 'missing-model',
    })

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        createFetchResponse({ ok: false, status: 404, text: 'missing' })
      )
      .mockResolvedValueOnce(
        createFetchResponse({
          ok: true,
          json: { choices: [{ message: { content: 'Shopping' } }] },
        })
      )
    vi.stubGlobal('fetch', fetchMock)

    const { categorizeTransaction } = await import('./ai')
    const result = await categorizeTransaction('Target store', 45)

    expect(result.category).toBe('Shopping')
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('uses simple categories when AI requests fail', async () => {
    setEnv({ OPENROUTER_API_KEY: '' })
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    const { categorizeTransaction } = await import('./ai')
    const result = await categorizeTransaction('Starbucks Coffee', 6)

    expect(result.category).toBe('Food & Dining')
    expect(result.confidence).toBe(0.3)
  })

  it('returns other when no category keywords match', async () => {
    setEnv({ OPENROUTER_API_KEY: '' })
    const { categorizeTransaction } = await import('./ai')
    const result = await categorizeTransaction('Random charge', 12)

    expect(result.category).toBe('Other')
  })

  it('handles API error status codes for categorization', async () => {
    setEnv({ OPENROUTER_API_KEY: 'key', OPENROUTER_BASE_URL: 'https://api' })

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        createFetchResponse({ ok: false, status: 401, text: 'bad key' })
      )
    vi.stubGlobal('fetch', fetchMock)

    const { categorizeTransaction } = await import('./ai')
    const result = await categorizeTransaction('Uber Ride', 12)

    expect(result.category).toBe('Transportation')
    expect(result.tags).toEqual(['fallback'])
  })

  it('returns a helpful response when chat results are empty', async () => {
    setEnv({ OPENROUTER_API_KEY: 'key', OPENROUTER_BASE_URL: 'https://api' })

    const fetchMock = vi.fn().mockResolvedValue(
      createFetchResponse({
        ok: true,
        json: { choices: [{ message: { content: '   ' } }] },
      })
    )
    vi.stubGlobal('fetch', fetchMock)

    const { chatWithAI } = await import('./ai')
    const response = await chatWithAI('Hello', {
      transactions: [],
      budgets: [],
      goals: [],
    })

    expect(response).toBe(
      'I understand your question. Could you please be more specific?'
    )
  })

  it('falls back when chat encounters rate limits', async () => {
    setEnv({ OPENROUTER_API_KEY: 'key', OPENROUTER_BASE_URL: 'https://api' })

    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        createFetchResponse({ ok: false, status: 429, text: 'rate limited' })
      )
    vi.stubGlobal('fetch', fetchMock)

    const { chatWithAI } = await import('./ai')
    const response = await chatWithAI('Help', {
      transactions: [],
      budgets: [],
      goals: [],
    })

    expect(response).toContain('trouble connecting')
  })

  it('handles chat calls without API keys', async () => {
    setEnv({ OPENROUTER_API_KEY: '' })
    const { chatWithAI } = await import('./ai')
    const response = await chatWithAI('Hello', {
      transactions: [],
      budgets: [],
      goals: [],
    })

    expect(response).toContain('trouble connecting')
  })

  it('generates AI insights or uses fallback summaries', async () => {
    setEnv({ OPENROUTER_API_KEY: 'key', OPENROUTER_BASE_URL: 'https://api' })
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        createFetchResponse({
          ok: true,
          json: { choices: [{ message: { content: 'Trim spending.' } }] },
        })
      )
      .mockResolvedValueOnce(
        createFetchResponse({ ok: false, status: 500, text: 'fail' })
      )
    vi.stubGlobal('fetch', fetchMock)

    const { generateFinancialInsights } = await import('./ai')

    const insights = await generateFinancialInsights(
      [
        {
          id: 't1',
          description: 'Coffee',
          amount: 5,
          date: new Date(),
          type: 'EXPENSE',
        },
      ],
      [],
      []
    )

    expect(insights[0].description).toBe('Trim spending.')

    const fallback = await generateFinancialInsights([], [], [])
    expect(fallback[0].title).toBe('Spending Summary')
  })

  it('handles unexpected response formats and network errors', async () => {
    setEnv({ OPENROUTER_API_KEY: 'key', OPENROUTER_BASE_URL: 'https://api' })
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        createFetchResponse({
          ok: true,
          json: { choices: [{ message: { content: '' } }] },
        })
      )
      .mockRejectedValueOnce(new Error('network'))
    vi.stubGlobal('fetch', fetchMock)

    const { categorizeTransaction } = await import('./ai')

    const first = await categorizeTransaction('Flight ticket', 300)
    const second = await categorizeTransaction('Flight ticket', 300)

    expect(first.category).toBe('Travel')
    expect(second.category).toBe('Travel')
  })

  it('throws model-not-found errors for missing defaults', async () => {
    setEnv({ OPENROUTER_API_KEY: 'key', OPENROUTER_BASE_URL: 'https://api' })
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        createFetchResponse({ ok: false, status: 404, text: 'missing' })
      )
    vi.stubGlobal('fetch', fetchMock)

    const { generateFinancialInsights } = await import('./ai')
    const insights = await generateFinancialInsights([], [], [])

    expect(insights[0].title).toBe('Spending Summary')
  })
})
