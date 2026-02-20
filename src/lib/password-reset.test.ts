import {
  createPasswordResetToken,
  getPasswordResetExpiry,
  hashPasswordResetToken,
} from './password-reset'

describe('password reset token utilities', () => {
  it('creates random tokens with expected size', () => {
    const firstToken = createPasswordResetToken()
    const secondToken = createPasswordResetToken()

    expect(firstToken).toHaveLength(64)
    expect(secondToken).toHaveLength(64)
    expect(firstToken).not.toBe(secondToken)
  })

  it('hashes tokens deterministically', () => {
    const token = 'token-value'
    expect(hashPasswordResetToken(token)).toBe(hashPasswordResetToken(token))
    expect(hashPasswordResetToken(token)).not.toBe(
      hashPasswordResetToken('other-token')
    )
  })

  it('returns future expiry timestamps', () => {
    const now = Date.now()
    const expiry = getPasswordResetExpiry(60)
    expect(expiry.getTime()).toBeGreaterThan(now + 59 * 60_000)
    expect(expiry.getTime()).toBeLessThanOrEqual(now + 61 * 60_000)
  })
})
