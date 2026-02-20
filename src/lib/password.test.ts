import { hashPassword, verifyPassword } from './password'

describe('password hashing', () => {
  it('hashes and verifies a valid password', () => {
    const password = 'StrongPassword123!'
    const hashedPassword = hashPassword(password)

    expect(hashedPassword.startsWith('scrypt$')).toBe(true)
    expect(verifyPassword(password, hashedPassword)).toBe(true)
  })

  it('fails verification for an invalid password', () => {
    const hashedPassword = hashPassword('StrongPassword123!')

    expect(verifyPassword('WrongPassword456!', hashedPassword)).toBe(false)
  })

  it('generates unique hashes for the same password using different salts', () => {
    const password = 'StrongPassword123!'
    const firstHash = hashPassword(password)
    const secondHash = hashPassword(password)

    expect(firstHash).not.toBe(secondHash)
    expect(verifyPassword(password, firstHash)).toBe(true)
    expect(verifyPassword(password, secondHash)).toBe(true)
  })

  it('rejects malformed stored hashes', () => {
    expect(verifyPassword('password', '')).toBe(false)
    expect(verifyPassword('password', 'not-a-valid-hash')).toBe(false)
    expect(verifyPassword('password', 'bcrypt$salt$key')).toBe(false)
    expect(verifyPassword('password', 'scrypt$$')).toBe(false)
    expect(
      verifyPassword('password', 'scrypt$invalid-base64$invalid-base64')
    ).toBe(false)
  })
})
