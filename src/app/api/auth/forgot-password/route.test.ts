import { NextRequest, NextResponse } from 'next/server'

const {
  findUniqueMock,
  createPasswordResetTokenRecordMock,
  sendPasswordResetEmailMock,
  enforceRateLimitMock,
  createRateLimitResponseMock,
  createPasswordResetTokenMock,
  hashPasswordResetTokenMock,
  getPasswordResetExpiryMock,
} = vi.hoisted(() => {
  return {
    findUniqueMock: vi.fn(),
    createPasswordResetTokenRecordMock: vi.fn(),
    sendPasswordResetEmailMock: vi.fn(),
    enforceRateLimitMock: vi.fn(),
    createRateLimitResponseMock: vi.fn(),
    createPasswordResetTokenMock: vi.fn(),
    hashPasswordResetTokenMock: vi.fn(),
    getPasswordResetExpiryMock: vi.fn(),
  }
})

vi.mock('@/lib/prisma', () => {
  return {
    prisma: {
      user: {
        findUnique: findUniqueMock,
      },
      passwordResetToken: {
        create: createPasswordResetTokenRecordMock,
      },
    },
  }
})

vi.mock('@/lib/transactional-email', () => {
  return {
    sendPasswordResetEmail: sendPasswordResetEmailMock,
  }
})

vi.mock('@/lib/request-rate-limit', () => {
  return {
    enforceRateLimit: enforceRateLimitMock,
    createRateLimitResponse: createRateLimitResponseMock,
  }
})

vi.mock('@/lib/password-reset', () => {
  return {
    createPasswordResetToken: createPasswordResetTokenMock,
    hashPasswordResetToken: hashPasswordResetTokenMock,
    getPasswordResetExpiry: getPasswordResetExpiryMock,
  }
})

const createPostRequest = (body: unknown) => {
  return new NextRequest('http://localhost/api/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'content-type': 'application/json',
    },
  })
}

describe('forgot password route', () => {
  beforeEach(() => {
    findUniqueMock.mockReset()
    createPasswordResetTokenRecordMock.mockReset()
    sendPasswordResetEmailMock.mockReset()
    enforceRateLimitMock.mockReset()
    createRateLimitResponseMock.mockReset()
    createPasswordResetTokenMock.mockReset()
    hashPasswordResetTokenMock.mockReset()
    getPasswordResetExpiryMock.mockReset()
    enforceRateLimitMock.mockReturnValue({
      isLimited: false,
      remaining: 4,
      resetAt: Date.now() + 60_000,
      retryAfterSeconds: 60,
    })
    createPasswordResetTokenMock.mockReturnValue('raw-reset-token')
    hashPasswordResetTokenMock.mockReturnValue('hashed-reset-token')
    getPasswordResetExpiryMock.mockReturnValue(
      new Date('2030-01-01T00:00:00.000Z')
    )
    createRateLimitResponseMock.mockImplementation((result, errorMessage) => {
      return NextResponse.json({ error: errorMessage }, { status: 429 })
    })
    vi.resetModules()
  })

  it('returns 400 for invalid email', async () => {
    const { POST } = await import('./route')
    const response = await POST(createPostRequest({ email: 'invalid' }))
    const payload = await response.json()

    expect(response.status).toBe(400)
    expect(payload.error).toBe('Please enter a valid email address.')
  })

  it('returns a success response when account is not found', async () => {
    findUniqueMock.mockResolvedValueOnce(null)
    const { POST } = await import('./route')
    const response = await POST(
      createPostRequest({ email: 'missing@example.com' })
    )
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(payload.success).toBe(true)
    expect(createPasswordResetTokenRecordMock).not.toHaveBeenCalled()
    expect(sendPasswordResetEmailMock).not.toHaveBeenCalled()
  })

  it('creates a reset token and sends email for known users', async () => {
    findUniqueMock.mockResolvedValueOnce({
      id: 'user-1',
      email: 'user@example.com',
      name: 'User Name',
    })
    sendPasswordResetEmailMock.mockResolvedValueOnce(true)
    const { POST } = await import('./route')
    const response = await POST(
      createPostRequest({ email: 'user@example.com' })
    )
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(payload.success).toBe(true)
    expect(createPasswordResetTokenRecordMock).toHaveBeenCalledWith({
      data: {
        userId: 'user-1',
        tokenHash: 'hashed-reset-token',
        expiresAt: new Date('2030-01-01T00:00:00.000Z'),
      },
    })
    expect(sendPasswordResetEmailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        toEmail: 'user@example.com',
        recipientName: 'User Name',
      })
    )
  })

  it('still returns success if email delivery fails', async () => {
    findUniqueMock.mockResolvedValueOnce({
      id: 'user-1',
      email: 'user@example.com',
      name: 'User Name',
    })
    sendPasswordResetEmailMock.mockRejectedValueOnce(
      new Error('smtp unavailable')
    )
    const { POST } = await import('./route')
    const response = await POST(
      createPostRequest({ email: 'user@example.com' })
    )
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(payload.success).toBe(true)
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
      createPostRequest({ email: 'user@example.com' })
    )
    const payload = await response.json()

    expect(response.status).toBe(429)
    expect(payload.error).toContain('Too many password reset attempts')
    expect(findUniqueMock).not.toHaveBeenCalled()
  })
})
