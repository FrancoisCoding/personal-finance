import { EventEmitter } from 'events'

const requestMock = vi.fn()
const agentMock = vi.fn()
const readFileSyncMock = vi.fn()

class MockAgent {
  constructor(options: unknown) {
    agentMock(options)
  }
}

vi.mock('https', () => ({
  default: {
    request: requestMock,
    Agent: MockAgent,
  },
  request: requestMock,
  Agent: MockAgent,
}))

vi.mock('fs', () => ({
  default: {
    readFileSync: readFileSyncMock,
  },
  readFileSync: readFileSyncMock,
}))

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

const mockRequest = ({
  statusCode,
  body,
  error,
}: {
  statusCode?: number
  body?: string
  error?: Error
}) => {
  requestMock.mockImplementationOnce((_url, _options, callback) => {
    const response = new EventEmitter() as EventEmitter & {
      statusCode?: number
    }
    response.statusCode = statusCode

    const handlers: Record<string, (err: Error) => void> = {}
    const request = {
      on: (event: string, handler: (err: Error) => void) => {
        handlers[event] = handler
        return request
      },
      write: vi.fn(),
      end: () => {
        if (error) {
          handlers.error?.(error)
          return
        }

        callback(response)
        process.nextTick(() => {
          if (body) {
            response.emit('data', body)
          }
          response.emit('end')
        })
      },
    }

    return request
  })
}

describe('teller utilities', () => {
  afterEach(() => {
    resetEnv()
    requestMock.mockReset()
    agentMock.mockClear()
    readFileSyncMock.mockReset()
    vi.resetModules()
  })

  it('reports the active Teller environment', async () => {
    setEnv({ TELLER_ENV: undefined, NEXT_PUBLIC_TELLER_ENV: undefined })
    const { getTellerEnvironment } = await import('./teller')
    expect(getTellerEnvironment()).toBe('sandbox')

    setEnv({ TELLER_ENV: undefined, NEXT_PUBLIC_TELLER_ENV: 'development' })
    vi.resetModules()
    const { getTellerEnvironment: getEnvPublic } = await import('./teller')
    expect(getEnvPublic()).toBe('development')

    setEnv({ TELLER_ENV: 'production' })
    vi.resetModules()
    const { getTellerEnvironment: getEnvAgain } = await import('./teller')
    expect(getEnvAgain()).toBe('production')
  })

  it('fetches Teller data in sandbox mode', async () => {
    setEnv({ TELLER_ENV: 'sandbox' })
    mockRequest({ statusCode: 200, body: '{"ok":true}' })

    const { tellerFetch } = await import('./teller')
    const result = await tellerFetch<{ ok: boolean }>('/accounts', 'token')

    expect(result.ok).toBe(true)
    expect(requestMock).toHaveBeenCalled()
  })

  it('returns empty objects for empty responses', async () => {
    setEnv({ TELLER_ENV: 'sandbox' })
    mockRequest({ statusCode: 204, body: '' })

    const { tellerFetch } = await import('./teller')
    const result = await tellerFetch('/empty', 'token')

    expect(result).toEqual({})
  })

  it('throws on non-2xx responses', async () => {
    setEnv({ TELLER_ENV: 'sandbox' })
    mockRequest({ statusCode: 500, body: 'boom' })

    const { tellerFetch } = await import('./teller')

    await expect(tellerFetch('/fail', 'token')).rejects.toThrow(
      'Teller error 500: boom'
    )
  })

  it('defaults missing status codes to 500', async () => {
    setEnv({ TELLER_ENV: 'sandbox' })
    mockRequest({ statusCode: undefined, body: 'oops' })

    const { tellerFetch } = await import('./teller')

    await expect(tellerFetch('/missing-status', 'token')).rejects.toThrow(
      'Teller error 500: oops'
    )
  })

  it('requires mTLS credentials outside sandbox', async () => {
    setEnv({ TELLER_ENV: 'production' })
    const { tellerFetch } = await import('./teller')

    await expect(tellerFetch('/accounts', 'token')).rejects.toThrow(
      'Teller mTLS credentials are required'
    )
  })

  it('uses mTLS credentials from env or files', async () => {
    setEnv({
      TELLER_ENV: 'production',
      TELLER_CERT: 'cert-value',
      TELLER_KEY: 'key-value',
    })
    mockRequest({ statusCode: 200, body: '{"ok":true}' })

    const { tellerFetch } = await import('./teller')
    await tellerFetch('/accounts', 'token')

    expect(agentMock).toHaveBeenCalledWith({
      cert: 'cert-value',
      key: 'key-value',
    })

    setEnv({
      TELLER_ENV: 'production',
      TELLER_CERT: undefined,
      TELLER_KEY: undefined,
      TELLER_CERT_PATH: './cert.pem',
      TELLER_KEY_PATH: './key.pem',
    })
    readFileSyncMock
      .mockReturnValueOnce('file-cert')
      .mockReturnValueOnce('file-key')
    mockRequest({ statusCode: 200, body: '{"ok":true}' })
    vi.resetModules()

    const { tellerFetch: tellerFetchFiles } = await import('./teller')
    await tellerFetchFiles('/accounts', 'token')

    expect(readFileSyncMock).toHaveBeenCalled()
  })

  it('reuses cached agents between requests', async () => {
    setEnv({
      TELLER_ENV: 'production',
      TELLER_CERT: 'cert-value',
      TELLER_KEY: 'key-value',
    })
    mockRequest({ statusCode: 200, body: '{"ok":true}' })
    mockRequest({ statusCode: 200, body: '{"ok":true}' })

    const { tellerFetch } = await import('./teller')
    await tellerFetch('/accounts', 'token')
    await tellerFetch('/accounts', 'token')

    expect(agentMock).toHaveBeenCalledTimes(1)
  })

  it('writes request bodies and surfaces request errors', async () => {
    setEnv({ TELLER_ENV: 'sandbox' })
    mockRequest({ statusCode: 200, body: '{"ok":true}' })

    const { tellerFetch } = await import('./teller')
    await tellerFetch('/payload', 'token', {
      method: 'post',
      body: 'payload',
    })

    const firstRequest = requestMock.mock.results[0]?.value as {
      write: (value: string | Uint8Array) => void
    }
    expect(firstRequest.write).toHaveBeenCalledWith('payload')

    mockRequest({ statusCode: 200, body: '{"ok":true}' })
    await tellerFetch('/payload', 'token', {
      method: 'post',
      body: new Uint8Array([1, 2, 3]),
    })

    const secondRequest = requestMock.mock.results[1]?.value as {
      write: (value: string | Uint8Array) => void
    }
    expect(secondRequest.write).toHaveBeenCalledWith(new Uint8Array([1, 2, 3]))

    mockRequest({ statusCode: 200, body: '{"ok":true}' })
    await tellerFetch('/payload', 'token', {
      method: 'post',
      body: { value: 1 } as unknown as string,
    })

    const thirdRequest = requestMock.mock.results[2]?.value as {
      write: (value: string | Uint8Array) => void
    }
    expect(thirdRequest.write).toHaveBeenCalledWith('[object Object]')

    mockRequest({
      statusCode: 200,
      body: '{"ok":true}',
      error: new Error('boom'),
    })
    await expect(tellerFetch('/error', 'token')).rejects.toThrow('boom')
  })
})
