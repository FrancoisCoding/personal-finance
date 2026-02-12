describe('prisma singleton', () => {
  it('reuses prisma instance in non-production', async () => {
    delete (globalThis as { prisma?: unknown }).prisma
    process.env.NODE_ENV = 'development'
    vi.resetModules()

    const first = await import('./prisma')
    const second = await import('./prisma')

    expect(first.prisma).toBe(second.prisma)
    expect((globalThis as { prisma?: unknown }).prisma).toBe(first.prisma)
  })

  it('does not store prisma on global in production', async () => {
    delete (globalThis as { prisma?: unknown }).prisma
    process.env.NODE_ENV = 'production'
    vi.resetModules()

    const { prisma } = await import('./prisma')
    expect(prisma).toBeDefined()
    expect((globalThis as { prisma?: unknown }).prisma).toBeUndefined()
  })

  it('uses an existing global prisma instance when provided', async () => {
    const existing = {} as unknown
    ;(globalThis as { prisma?: unknown }).prisma = existing
    process.env.NODE_ENV = 'development'
    vi.resetModules()

    const { prisma } = await import('./prisma')
    expect(prisma).toBe(existing)
  })

  it('creates a new prisma instance when the global is null', async () => {
    ;(globalThis as { prisma?: unknown }).prisma = null
    process.env.NODE_ENV = 'development'
    vi.resetModules()

    const { prisma } = await import('./prisma')
    expect(prisma).toBeDefined()
    expect(prisma).not.toBeNull()
  })
})
