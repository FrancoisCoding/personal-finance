import { hashPassword } from './password'
import { authorizeCredentialsWithDependencies } from './auth'

describe('authorizeCredentials', () => {
  it('returns null when credentials are missing', async () => {
    const findUserByEmail = vi.fn()

    expect(
      await authorizeCredentialsWithDependencies(undefined, { findUserByEmail })
    ).toBeNull()
    expect(
      await authorizeCredentialsWithDependencies(
        { email: '', password: '' },
        { findUserByEmail }
      )
    ).toBeNull()
    expect(findUserByEmail).not.toHaveBeenCalled()
  })

  it('returns null when no user is found', async () => {
    const findUserByEmail = vi.fn().mockResolvedValueOnce(null)

    const result = await authorizeCredentialsWithDependencies(
      { email: 'missing@example.com', password: 'password' },
      { findUserByEmail }
    )

    expect(result).toBeNull()
    expect(findUserByEmail).toHaveBeenCalledWith('missing@example.com')
  })

  it('returns null when user has no password hash', async () => {
    const findUserByEmail = vi.fn().mockResolvedValueOnce({
      id: 'user-1',
      name: 'User',
      email: 'user@example.com',
      hashedPassword: null,
    })

    const result = await authorizeCredentialsWithDependencies(
      { email: 'user@example.com', password: 'password' },
      { findUserByEmail }
    )

    expect(result).toBeNull()
  })

  it('returns null when password does not match', async () => {
    const findUserByEmail = vi.fn().mockResolvedValueOnce({
      id: 'user-1',
      name: 'User',
      email: 'user@example.com',
      hashedPassword: hashPassword('correct-password'),
    })

    const result = await authorizeCredentialsWithDependencies(
      { email: 'user@example.com', password: 'wrong-password' },
      { findUserByEmail }
    )

    expect(result).toBeNull()
  })

  it('returns a user when password is valid', async () => {
    const findUserByEmail = vi.fn().mockResolvedValueOnce({
      id: 'user-1',
      name: 'User',
      email: 'user@example.com',
      hashedPassword: hashPassword('correct-password'),
    })

    const result = await authorizeCredentialsWithDependencies(
      { email: 'USER@EXAMPLE.COM', password: 'correct-password' },
      { findUserByEmail }
    )

    expect(result).toEqual({
      id: 'user-1',
      name: 'User',
      email: 'user@example.com',
    })
    expect(findUserByEmail).toHaveBeenCalledWith('user@example.com')
  })

  it('returns null and logs when user lookup throws', async () => {
    const onError = vi.fn()
    const findUserByEmail = vi
      .fn()
      .mockRejectedValueOnce(new Error('database unavailable'))

    const result = await authorizeCredentialsWithDependencies(
      { email: 'user@example.com', password: 'password' },
      { findUserByEmail, onError }
    )

    expect(result).toBeNull()
    expect(onError).toHaveBeenCalled()
  })

  it('returns null when password verifier returns false', async () => {
    const findUserByEmail = vi.fn().mockResolvedValueOnce({
      id: 'user-1',
      name: 'User',
      email: 'user@example.com',
      hashedPassword: 'hash',
    })
    const verifyPasswordValue = vi.fn().mockReturnValueOnce(false)

    const result = await authorizeCredentialsWithDependencies(
      { email: 'user@example.com', password: 'password' },
      { findUserByEmail, verifyPasswordValue }
    )

    expect(result).toBeNull()
    expect(verifyPasswordValue).toHaveBeenCalledWith('password', 'hash')
  })
})
