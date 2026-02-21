const {
  findUniqueMock,
  createMock,
  hashPasswordMock,
  isCompromisedPasswordMock,
  enforceRateLimitMock,
  createRateLimitResponseMock,
} = vi.hoisted(() => {
  return {
    findUniqueMock: vi.fn(),
    createMock: vi.fn(),
    hashPasswordMock: vi.fn(),
    isCompromisedPasswordMock: vi.fn(),
    enforceRateLimitMock: vi.fn(),
    createRateLimitResponseMock: vi.fn(),
  }
})

vi.mock('@/lib/prisma', () => {
  return {
    prisma: {
      user: {
        findUnique: findUniqueMock,
        create: createMock,
      },
    },
  }
})

vi.mock('@/lib/password', () => {
  return {
    hashPassword: hashPasswordMock,
  }
})

vi.mock('@/lib/compromised-password', () => {
  return {
    isCompromisedPassword: isCompromisedPasswordMock,
  }
})

vi.mock('@/lib/request-rate-limit', () => {
  return {
    enforceRateLimit: enforceRateLimitMock,
    createRateLimitResponse: createRateLimitResponseMock,
  }
})

const createPostRequest = (body: unknown) => {
  return new Request('http://localhost/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'content-type': 'application/json',
    },
  })
}

describe('register route', () => {
  beforeEach(() => {
    findUniqueMock.mockReset()
    createMock.mockReset()
    hashPasswordMock.mockReset()
    isCompromisedPasswordMock.mockReset()
    enforceRateLimitMock.mockReset()
    createRateLimitResponseMock.mockReset()
    isCompromisedPasswordMock.mockResolvedValue(false)
    enforceRateLimitMock.mockResolvedValue({
      isLimited: false,
      remaining: 7,
      resetAt: Date.now() + 60_000,
      retryAfterSeconds: 60,
    })
    createRateLimitResponseMock.mockImplementation((result, errorMessage) => {
      return Response.json({ error: errorMessage }, { status: 429 })
    })
    vi.resetModules()
  })

  it('returns 400 for an invalid full name', async () => {
    const { POST } = await import('./route')
    const response = await POST(
      createPostRequest({
        name: 'A',
        email: 'valid@example.com',
        password: 'StrongPassword123!',
      })
    )
    const payload = await response.json()

    expect(response.status).toBe(400)
    expect(payload.error).toBe('Please enter your full name.')
  })

  it('returns 400 for an invalid email', async () => {
    const { POST } = await import('./route')
    const response = await POST(
      createPostRequest({
        name: 'Valid Name',
        email: 'invalid-email',
        password: 'StrongPassword123!',
      })
    )
    const payload = await response.json()

    expect(response.status).toBe(400)
    expect(payload.error).toBe('Please enter a valid email address.')
  })

  it('returns 400 for an invalid password policy', async () => {
    const { POST } = await import('./route')
    const response = await POST(
      createPostRequest({
        name: 'Valid Name',
        email: 'valid@example.com',
        password: '12345678',
      })
    )
    const payload = await response.json()

    expect(response.status).toBe(400)
    expect(payload.error).toBe('Password does not meet security requirements.')
    expect(payload.details).toContain('Use 12-128 characters')
    expect(payload.details).toContain('Include at least one symbol')
  })

  it('returns 409 when an email already exists with password credentials', async () => {
    findUniqueMock.mockResolvedValueOnce({
      id: 'existing-user',
      hashedPassword: 'existing-hash',
    })
    const { POST } = await import('./route')
    const response = await POST(
      createPostRequest({
        name: 'Valid Name',
        email: 'valid@example.com',
        password: 'StrongPassword123!',
      })
    )
    const payload = await response.json()

    expect(response.status).toBe(409)
    expect(payload.error).toBe('An account with this email already exists.')
    expect(createMock).not.toHaveBeenCalled()
  })

  it('returns 409 when an email already exists for another sign-in method', async () => {
    findUniqueMock.mockResolvedValueOnce({
      id: 'oauth-user',
      hashedPassword: null,
    })
    const { POST } = await import('./route')
    const response = await POST(
      createPostRequest({
        name: 'Valid Name',
        email: 'valid@example.com',
        password: 'StrongPassword123!',
      })
    )
    const payload = await response.json()

    expect(response.status).toBe(409)
    expect(payload.error).toBe(
      'This email is linked to a different sign-in method.'
    )
    expect(createMock).not.toHaveBeenCalled()
  })

  it('creates a user for a valid request', async () => {
    findUniqueMock.mockResolvedValueOnce(null)
    isCompromisedPasswordMock.mockResolvedValueOnce(false)
    hashPasswordMock.mockReturnValueOnce('hashed-password')
    createMock.mockResolvedValueOnce({
      id: 'created-user',
      name: 'Valid Name',
      email: 'valid@example.com',
    })
    const { POST } = await import('./route')
    const response = await POST(
      createPostRequest({
        name: '  Valid Name  ',
        email: '  VALID@example.com  ',
        password: 'StrongPassword123!',
      })
    )
    const payload = await response.json()

    expect(response.status).toBe(201)
    expect(payload.user).toEqual({
      id: 'created-user',
      name: 'Valid Name',
      email: 'valid@example.com',
    })
    expect(isCompromisedPasswordMock).toHaveBeenCalledWith('StrongPassword123!')
    expect(hashPasswordMock).toHaveBeenCalledWith('StrongPassword123!')
    expect(createMock).toHaveBeenCalledWith({
      data: {
        name: 'Valid Name',
        email: 'valid@example.com',
        emailVerified: expect.any(Date),
        hashedPassword: 'hashed-password',
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    })
  })

  it('returns 500 when create fails', async () => {
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined)
    findUniqueMock.mockResolvedValueOnce(null)
    isCompromisedPasswordMock.mockResolvedValueOnce(false)
    hashPasswordMock.mockReturnValueOnce('hashed-password')
    createMock.mockRejectedValueOnce(new Error('database unavailable'))
    const { POST } = await import('./route')
    const response = await POST(
      createPostRequest({
        name: 'Valid Name',
        email: 'valid@example.com',
        password: 'StrongPassword123!',
      })
    )
    const payload = await response.json()

    expect(response.status).toBe(500)
    expect(payload.error).toBe('Failed to create account. Please try again.')
    expect(consoleErrorSpy).toHaveBeenCalled()
    consoleErrorSpy.mockRestore()
  })

  it('returns 400 when password has known breach exposure', async () => {
    findUniqueMock.mockResolvedValueOnce(null)
    isCompromisedPasswordMock.mockResolvedValueOnce(true)
    const { POST } = await import('./route')
    const response = await POST(
      createPostRequest({
        name: 'Valid Name',
        email: 'valid@example.com',
        password: 'StrongPassword123!',
      })
    )
    const payload = await response.json()

    expect(response.status).toBe(400)
    expect(payload.error).toBe(
      'This password has appeared in known data breaches. Choose a different password.'
    )
    expect(hashPasswordMock).not.toHaveBeenCalled()
    expect(createMock).not.toHaveBeenCalled()
  })

  it('returns a rate limit response when registration is throttled', async () => {
    enforceRateLimitMock.mockResolvedValueOnce({
      isLimited: true,
      remaining: 0,
      resetAt: Date.now() + 60_000,
      retryAfterSeconds: 60,
    })
    const { POST } = await import('./route')
    const response = await POST(
      createPostRequest({
        name: 'Valid Name',
        email: 'valid@example.com',
        password: 'StrongPassword123!',
      })
    )
    const payload = await response.json()

    expect(response.status).toBe(429)
    expect(payload.error).toContain('Too many signup attempts')
    expect(findUniqueMock).not.toHaveBeenCalled()
  })
})
