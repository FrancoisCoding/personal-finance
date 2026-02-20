import { getCredentialsSignInErrorMessage } from './credentials-signin-result'

describe('getCredentialsSignInErrorMessage', () => {
  it('returns a generic error when result is missing', () => {
    expect(getCredentialsSignInErrorMessage(undefined)).toBe(
      'Sign in failed. Please try again.'
    )
  })

  it('returns invalid credentials message for CredentialsSignin', () => {
    expect(
      getCredentialsSignInErrorMessage({
        ok: false,
        error: 'CredentialsSignin',
      })
    ).toBe('Invalid email or password')
  })

  it('returns generic error for unknown sign-in errors', () => {
    expect(
      getCredentialsSignInErrorMessage({
        ok: false,
        error: 'Configuration',
      })
    ).toBe('Sign in failed. Please try again.')
  })

  it('returns null on successful sign-in result', () => {
    expect(
      getCredentialsSignInErrorMessage({
        ok: true,
        error: null,
      })
    ).toBeNull()
  })
})
