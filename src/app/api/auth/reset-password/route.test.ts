import { NextRequest, NextResponse } from 'next/server'

const {
  findResetTokenMock,
  updateUserMock,
  updateResetTokenMock,
  deleteResetTokensMock,
  transactionMock,
  enforceRateLimitMock,
  createRateLimitResponseMock,
  hashPasswordMock,
  hashPasswordResetTokenMock,
} = vi.hoisted(() => {
  return {
    findResetTokenMock: vi.fn(),
    updateUserMock: vi.fn(),
    updateResetTokenMock: vi.fn(),
    deleteResetTokensMock: vi.fn(),
    transactionMock: vi.fn(),
    enforceRateLimitMock: vi.fn(),
    createRateLimitResponseMock: vi.fn(),
    hashPasswordMock: vi.fn(),
    hashPasswordResetTokenMock: vi.fn(),
  }
})

vi.mock('@/lib/prisma', () => {
  return {
    prisma: {
      passwordResetToken: {
        findUnique: findResetTokenMock,
        update: updateResetTokenMock,
        deleteMany: deleteResetTokensMock,
      },
      user: {
        update: updateUserMock,
      },
      $transaction: transactionMock,
    },
  }
})

vi.mock('@/lib/request-rate-limit', () => {
  return {
    enforceRateLimit: enforceRateLimitMock,
    createRateLimitResponse: createRateLimitResponseMock,
  }
})

vi.mock('@/lib/password', () => {
  return {
    hashPassword: hashPasswordMock,
  }
})

vi.mock('@/lib/password-reset', () => {
  return {
    hashPasswordResetToken: hashPasswordResetTokenMock,
  }
})

const createPostRequest = (body: unknown) => {
  return new NextRequest('http://localhost/api/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'content-type': 'application/json',
    },
  })
}

const createGetRequest = (token: string | null) => {
  const url = token
    ? `http://localhost/api/auth/reset-password?token=${encodeURIComponent(token)}`
    : 'http://localhost/api/auth/reset-password'
  return new NextRequest(url, { method: 'GET' })
}

describe('reset password route', () => {
  beforeEach(() => {
    findResetTokenMock.mockReset()
    updateUserMock.mockReset()
    updateResetTokenMock.mockReset()
    deleteResetTokensMock.mockReset()
    transactionMock.mockReset()
    enforceRateLimitMock.mockReset()
    createRateLimitResponseMock.mockReset()
    hashPasswordMock.mockReset()
    hashPasswordResetTokenMock.mockReset()
    enforceRateLimitMock.mockReturnValue({
      isLimited: false,
      remaining: 10,
      resetAt: Date.now() + 60_000,
      retryAfterSeconds: 60,
    })
    hashPasswordResetTokenMock.mockReturnValue('hashed-token')
    hashPasswordMock.mockReturnValue('hashed-password')
    updateUserMock.mockResolvedValue({ id: 'user-1' })
    updateResetTokenMock.mockResolvedValue({ id: 'token-1' })
    deleteResetTokensMock.mockResolvedValue({ count: 0 })
    transactionMock.mockResolvedValue([])
    createRateLimitResponseMock.mockImplementation((result, errorMessage) => {
      return NextResponse.json({ error: errorMessage }, { status: 429 })
    })
    vi.resetModules()
  })

  it('returns invalid for GET requests without token', async () => {
    const { GET } = await import('./route')
    const response = await GET(createGetRequest(null))
    const payload = await response.json()

    expect(response.status).toBe(400)
    expect(payload.valid).toBe(false)
  })

  it('returns valid for active tokens in GET requests', async () => {
    findResetTokenMock.mockResolvedValueOnce({
      id: 'token-1',
      userId: 'user-1',
      expiresAt: new Date(Date.now() + 60_000),
      usedAt: null,
    })
    const { GET } = await import('./route')
    const response = await GET(createGetRequest('raw-token'))
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(payload.valid).toBe(true)
  })

  it('returns 400 for short passwords', async () => {
    const { POST } = await import('./route')
    const response = await POST(
      createPostRequest({
        token: 'raw-token',
        password: 'short',
      })
    )
    const payload = await response.json()

    expect(response.status).toBe(400)
    expect(payload.error).toBe('Password must be between 8 and 128 characters.')
  })

  it('returns 400 for missing or inactive reset tokens', async () => {
    findResetTokenMock.mockResolvedValueOnce(null)
    const { POST } = await import('./route')
    const response = await POST(
      createPostRequest({
        token: 'raw-token',
        password: 'password123',
      })
    )
    const payload = await response.json()

    expect(response.status).toBe(400)
    expect(payload.error).toContain('invalid or has expired')
    expect(transactionMock).not.toHaveBeenCalled()
  })

  it('resets password when token is active', async () => {
    findResetTokenMock.mockResolvedValueOnce({
      id: 'token-1',
      userId: 'user-1',
      expiresAt: new Date(Date.now() + 60_000),
      usedAt: null,
    })
    const { POST } = await import('./route')
    const response = await POST(
      createPostRequest({
        token: 'raw-token',
        password: 'password123',
      })
    )
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(payload.success).toBe(true)
    expect(hashPasswordMock).toHaveBeenCalledWith('password123')
    expect(updateUserMock).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { hashedPassword: 'hashed-password' },
    })
    expect(updateResetTokenMock).toHaveBeenCalled()
    expect(deleteResetTokensMock).toHaveBeenCalled()
    expect(transactionMock).toHaveBeenCalled()
  })

  it('returns rate limit responses when limited', async () => {
    enforceRateLimitMock.mockReturnValueOnce({
      isLimited: true,
      remaining: 0,
      resetAt: Date.now() + 60_000,
      retryAfterSeconds: 60,
    })
    const { POST } = await import('./route')
    const response = await POST(
      createPostRequest({
        token: 'raw-token',
        password: 'password123',
      })
    )
    const payload = await response.json()

    expect(response.status).toBe(429)
    expect(payload.error).toContain('Too many reset attempts')
  })
})
