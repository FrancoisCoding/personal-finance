const findManySpy = vi.fn()
const createSpy = vi.fn()

vi.mock('@/lib/prisma', () => ({
  prisma: {
    category: {
      findMany: (...args: unknown[]) => findManySpy(...args),
      create: (...args: unknown[]) => createSpy(...args),
    },
  },
}))

describe('seedCategories', () => {
  beforeEach(() => {
    findManySpy.mockReset()
    createSpy.mockReset()
  })

  it('returns existing categories without seeding', async () => {
    findManySpy.mockResolvedValueOnce([{ id: 'existing' }])
    const { seedCategories } = await import('./seed-categories')

    const result = await seedCategories('user-1')
    expect(result).toEqual([{ id: 'existing' }])
    expect(createSpy).not.toHaveBeenCalled()
  })

  it('creates default categories when none exist', async () => {
    findManySpy.mockResolvedValueOnce([])
    createSpy.mockImplementation(
      async ({ data }: { data: { name: string } }) => ({
        id: data.name,
        name: data.name,
      })
    )
    const { seedCategories } = await import('./seed-categories')

    const result = await seedCategories('user-2')
    expect(result.length).toBeGreaterThan(0)
    expect(createSpy).toHaveBeenCalled()
  })

  it('throws when prisma fails', async () => {
    findManySpy.mockRejectedValueOnce(new Error('fail'))
    const { seedCategories } = await import('./seed-categories')

    await expect(seedCategories('user-3')).rejects.toThrow('fail')
  })
})
