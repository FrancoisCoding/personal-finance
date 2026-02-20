import { hashPassword } from './password'

describe('admin auth credential validation', () => {
  const originalEnvironment = { ...process.env }

  beforeEach(() => {
    process.env = { ...originalEnvironment }
    process.env.ADMIN_EMAIL = 'francoiscoding@yahoo.com'
    process.env.ADMIN_SESSION_SECRET = 'session-secret'
    delete process.env.ADMIN_PASSWORD
    delete process.env.ADMIN_PASSWORD_HASH
    vi.resetModules()
  })

  afterAll(() => {
    process.env = originalEnvironment
  })

  it('accepts configured raw admin password', async () => {
    process.env.ADMIN_PASSWORD = 'Godblessed1$'
    const { isValidAdminLogin } = await import('./admin-auth')

    expect(isValidAdminLogin('francoiscoding@yahoo.com', 'Godblessed1$')).toBe(
      true
    )
  })

  it('accepts configured hashed admin password', async () => {
    process.env.ADMIN_PASSWORD_HASH = hashPassword('Godblessed1$')
    const { isValidAdminLogin } = await import('./admin-auth')

    expect(isValidAdminLogin('francoiscoding@yahoo.com', 'Godblessed1$')).toBe(
      true
    )
  })

  it('falls back to raw password when hash does not match', async () => {
    process.env.ADMIN_PASSWORD_HASH = hashPassword('old-password')
    process.env.ADMIN_PASSWORD = 'Godblessed1$'
    const { isValidAdminLogin } = await import('./admin-auth')

    expect(isValidAdminLogin('francoiscoding@yahoo.com', 'Godblessed1$')).toBe(
      true
    )
  })

  it('rejects wrong passwords', async () => {
    process.env.ADMIN_PASSWORD = 'Godblessed1$'
    const { isValidAdminLogin } = await import('./admin-auth')

    expect(isValidAdminLogin('francoiscoding@yahoo.com', 'WrongPassword')).toBe(
      false
    )
  })

  it('normalizes admin email case and whitespace', async () => {
    process.env.ADMIN_PASSWORD = 'Godblessed1$'
    const { isValidAdminLogin } = await import('./admin-auth')

    expect(
      isValidAdminLogin('  FRANCOISCODING@YAHOO.COM  ', 'Godblessed1$')
    ).toBe(true)
  })
})
