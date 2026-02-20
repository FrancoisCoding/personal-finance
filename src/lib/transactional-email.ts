import nodemailer from 'nodemailer'

interface IPasswordResetEmailOptions {
  toEmail: string
  recipientName?: string | null
  resetUrl: string
}

const parseSmtpPort = () => {
  const rawPort = process.env.SMTP_PORT?.trim()
  if (!rawPort) {
    return 587
  }
  const parsedPort = Number(rawPort)
  if (!Number.isFinite(parsedPort) || parsedPort <= 0) {
    return 587
  }
  return parsedPort
}

const getSmtpSecure = () => {
  return process.env.SMTP_SECURE === 'true'
}

const getFromEmail = () => {
  return process.env.EMAIL_FROM?.trim() || 'support@financeflow.dev'
}

const hasSmtpConfiguration = () => {
  return Boolean(
    process.env.SMTP_HOST?.trim() &&
      process.env.SMTP_USER?.trim() &&
      process.env.SMTP_PASS?.trim()
  )
}

export const sendPasswordResetEmail = async ({
  toEmail,
  recipientName,
  resetUrl,
}: IPasswordResetEmailOptions) => {
  if (!hasSmtpConfiguration()) {
    console.warn('SMTP is not configured. Password reset email was not sent.')
    if (process.env.NODE_ENV !== 'production') {
      console.info(`Password reset URL for ${toEmail}: ${resetUrl}`)
    }
    return false
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST?.trim(),
    port: parseSmtpPort(),
    secure: getSmtpSecure(),
    auth: {
      user: process.env.SMTP_USER?.trim(),
      pass: process.env.SMTP_PASS?.trim(),
    },
  })

  const displayName = recipientName?.trim() || 'there'
  const subject = 'Reset your FinanceFlow password'
  const text = [
    `Hi ${displayName},`,
    '',
    'We received a request to reset your FinanceFlow password.',
    'Use the link below to set a new password. This link expires in 60 minutes.',
    '',
    resetUrl,
    '',
    'If you did not request this, you can safely ignore this email.',
  ].join('\n')
  const html = `
    <p>Hi ${displayName},</p>
    <p>We received a request to reset your FinanceFlow password.</p>
    <p>Use the link below to set a new password. This link expires in 60 minutes.</p>
    <p><a href="${resetUrl}">Reset your password</a></p>
    <p>If you did not request this, you can safely ignore this email.</p>
  `

  await transporter.sendMail({
    from: getFromEmail(),
    to: toEmail,
    subject,
    text,
    html,
  })

  return true
}
