export const getCredentialsSignInErrorMessage = (result?: {
  ok?: boolean
  error?: string | null
}) => {
  if (!result || !result.ok || result.error) {
    if (result?.error === 'CredentialsSignin') {
      return 'Invalid email or password'
    }
    return 'Sign in failed. Please try again.'
  }

  return null
}
