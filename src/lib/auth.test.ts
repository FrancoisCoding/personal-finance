describe('auth options', () => {
  it('builds providers and callbacks', async () => {
    process.env.GOOGLE_CLIENT_ID = 'google-id'
    process.env.GOOGLE_CLIENT_SECRET = 'google-secret'

    vi.resetModules()
    const { authOptions } = await import('./auth')

    expect(authOptions.providers?.length).toBe(1)

    const sessionResult = await authOptions.callbacks?.session?.({
      session: { user: {} } as { user: { id?: string } },
      token: { sub: 'user-1' },
    })
    expect(sessionResult?.user.id).toBe('user-1')

    const sessionNoToken = await authOptions.callbacks?.session?.({
      session: { user: {} } as { user: { id?: string } },
      token: {},
    })
    expect(sessionNoToken?.user.id).toBeUndefined()

    const sessionMissing = await authOptions.callbacks?.session?.({
      session: null as unknown as { user?: { id?: string } },
      token: { sub: 'user-2' },
    })
    expect(sessionMissing).toBeNull()

    const sessionNoUser = await authOptions.callbacks?.session?.({
      session: {} as { user?: { id?: string } },
      token: { sub: 'user-3' },
    })
    expect(sessionNoUser?.user).toBeUndefined()

    const sessionUndefinedToken = await authOptions.callbacks?.session?.({
      session: { user: {} } as { user: { id?: string } },
      token: undefined as unknown as { sub?: string },
    })
    expect(sessionUndefinedToken?.user.id).toBeUndefined()

    const sessionUndefined = await authOptions.callbacks?.session?.({
      session: undefined as unknown as { user?: { id?: string } },
      token: { sub: 'user-4' },
    })
    expect(sessionUndefined).toBeUndefined()

    const jwtResult = await authOptions.callbacks?.jwt?.({
      token: { sub: 'existing' },
      user: { id: 'user-2' },
    })
    expect(jwtResult?.sub).toBe('user-2')

    const jwtNoUser = await authOptions.callbacks?.jwt?.({
      token: { sub: 'keep' },
      user: undefined,
    })
    expect(jwtNoUser?.sub).toBe('keep')

    const redirectRelative = await authOptions.callbacks?.redirect?.({
      url: '/dashboard',
      baseUrl: 'https://example.com',
    })
    expect(redirectRelative).toBe('https://example.com/dashboard')

    const redirectSignIn = await authOptions.callbacks?.redirect?.({
      url: '/auth/login',
      baseUrl: 'https://example.com',
    })
    expect(redirectSignIn).toBe('https://example.com/dashboard')

    const redirectExternal = await authOptions.callbacks?.redirect?.({
      url: 'https://malicious.example/phish',
      baseUrl: 'https://example.com',
    })
    expect(redirectExternal).toBe('https://example.com/dashboard')

    expect(authOptions.pages?.signIn).toBe('/auth/login')
    expect(authOptions.session?.strategy).toBe('jwt')
  })
})
