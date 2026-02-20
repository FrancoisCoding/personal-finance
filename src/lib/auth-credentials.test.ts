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
      hashedPassword: 'scrypt$test-salt$test-key',
    })
    const verifyPasswordValue = vi.fn().mockReturnValueOnce(false)

    const result = await authorizeCredentialsWithDependencies(
      { email: 'user@example.com', password: 'password' },
      { findUserByEmail, verifyPasswordValue }
    )

    expect(result).toBeNull()
    expect(verifyPasswordValue).toHaveBeenCalledWith(
      'password',
      'scrypt$test-salt$test-key'
    )
  })

  it('supports legacy plaintext passwords and upgrades hash after login', async () => {
    const findUserByEmail = vi.fn().mockResolvedValueOnce({
      id: 'legacy-user',
      name: 'Legacy User',
      email: 'legacy@example.com',
      hashedPassword: 'legacy-password',
    })
    const updateUserPasswordHash = vi.fn().mockResolvedValueOnce(undefined)

    const result = await authorizeCredentialsWithDependencies(
      { email: 'legacy@example.com', password: 'legacy-password' },
      { findUserByEmail, updateUserPasswordHash }
    )

    expect(result).toEqual({
      id: 'legacy-user',
      name: 'Legacy User',
      email: 'legacy@example.com',
    })
    expect(updateUserPasswordHash).toHaveBeenCalledTimes(1)
    expect(updateUserPasswordHash).toHaveBeenCalledWith(
      'legacy-user',
      expect.stringMatching(/^scrypt\$/)
    )
  })

  it('returns null for legacy plaintext password mismatch', async () => {
    const findUserByEmail = vi.fn().mockResolvedValueOnce({
      id: 'legacy-user',
      name: 'Legacy User',
      email: 'legacy@example.com',
      hashedPassword: 'legacy-password',
    })
    const updateUserPasswordHash = vi.fn()

    const result = await authorizeCredentialsWithDependencies(
      { email: 'legacy@example.com', password: 'wrong-password' },
      { findUserByEmail, updateUserPasswordHash }
    )

    expect(result).toBeNull()
    expect(updateUserPasswordHash).not.toHaveBeenCalled()
  })
})
