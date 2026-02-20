import {
  getPasswordPolicyErrors,
  getPasswordRequirementStatuses,
  isPasswordPolicyCompliant,
} from './password-policy'

describe('password policy', () => {
  it('returns unmet requirements for weak passwords', () => {
    const errors = getPasswordPolicyErrors('12345678')

    expect(errors).toContain('Use 12-128 characters')
    expect(errors).toContain('Include at least one lowercase letter')
    expect(errors).toContain('Include at least one uppercase letter')
    expect(errors).toContain('Include at least one symbol')
    expect(errors).not.toContain('Include at least one number')
  })

  it('marks every requirement as met for a strong password', () => {
    const statuses = getPasswordRequirementStatuses('StrongPassword123!')
    const unmetRequirements = statuses.filter((item) => !item.isMet)

    expect(unmetRequirements).toHaveLength(0)
    expect(isPasswordPolicyCompliant('StrongPassword123!')).toBe(true)
  })

  it('rejects passwords that include whitespace', () => {
    expect(isPasswordPolicyCompliant('Strong Password123!')).toBe(false)
  })
})
