export const minimumPasswordLength = 12
export const maximumPasswordLength = 128

const lowercasePattern = /[a-z]/
const uppercasePattern = /[A-Z]/
const numberPattern = /\d/
const symbolPattern = /[^A-Za-z0-9]/
const whitespacePattern = /\s/

export interface IPasswordRequirementStatus {
  key:
    | 'length'
    | 'lowercase'
    | 'uppercase'
    | 'number'
    | 'symbol'
    | 'noWhitespace'
  label: string
  isMet: boolean
}

export const getPasswordRequirementStatuses = (
  password: string
): IPasswordRequirementStatus[] => {
  return [
    {
      key: 'length',
      label: `Use ${minimumPasswordLength}-${maximumPasswordLength} characters`,
      isMet:
        password.length >= minimumPasswordLength &&
        password.length <= maximumPasswordLength,
    },
    {
      key: 'lowercase',
      label: 'Include at least one lowercase letter',
      isMet: lowercasePattern.test(password),
    },
    {
      key: 'uppercase',
      label: 'Include at least one uppercase letter',
      isMet: uppercasePattern.test(password),
    },
    {
      key: 'number',
      label: 'Include at least one number',
      isMet: numberPattern.test(password),
    },
    {
      key: 'symbol',
      label: 'Include at least one symbol',
      isMet: symbolPattern.test(password),
    },
    {
      key: 'noWhitespace',
      label: 'Do not include spaces',
      isMet: password.length > 0 && !whitespacePattern.test(password),
    },
  ]
}

export const getPasswordPolicyErrors = (password: string): string[] => {
  return getPasswordRequirementStatuses(password)
    .filter((requirement) => !requirement.isMet)
    .map((requirement) => requirement.label)
}

export const isPasswordPolicyCompliant = (password: string) => {
  return getPasswordPolicyErrors(password).length === 0
}
