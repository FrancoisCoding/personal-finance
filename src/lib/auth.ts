import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { timingSafeEqual } from 'crypto'
import { prisma } from './prisma'
import { hashPassword, verifyPassword } from './password'
import {
  enforceIdentifierRateLimit,
  type IRateLimitResult,
} from './request-rate-limit'

// Extend the built-in session types
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }
}

interface ICredentialsRequestContext {
  headers?: Headers | Record<string, string | string[] | undefined>
}

interface ICredentialsAuthorizeDependencies {
  findUserByEmail?: (email: string) => Promise<{
    id: string
    name: string | null
    email: string
    hashedPassword: string | null
    emailVerified: Date | null
  } | null>
  verifyPasswordValue?: (password: string, storedHash: string) => boolean
  updateUserPasswordHash?: (
    userId: string,
    hashedPassword: string
  ) => Promise<void>
  updateUserEmailVerified?: (userId: string) => Promise<void>
  consumeCredentialsRateLimit?: (
    identifier: string
  ) => Promise<IRateLimitResult>
  onError?: (error: unknown) => void
}

const getRequestHeaderValue = (
  requestContext: ICredentialsRequestContext | undefined,
  headerName: string
) => {
  const headers = requestContext?.headers
  if (!headers) {
    return ''
  }

  if (headers instanceof Headers) {
    return headers.get(headerName)?.trim() ?? ''
  }

  const rawHeaderValue = headers[headerName]
  if (Array.isArray(rawHeaderValue)) {
    return rawHeaderValue[0]?.trim() ?? ''
  }
  return typeof rawHeaderValue === 'string' ? rawHeaderValue.trim() : ''
}

const getClientAddressFromRequestContext = (
  requestContext?: ICredentialsRequestContext
) => {
  const forwardedFor = getRequestHeaderValue(requestContext, 'x-forwarded-for')
  if (forwardedFor) {
    const firstForwardedAddress = forwardedFor
      .split(',')
      .map((value) => value.trim())
      .find(Boolean)
    if (firstForwardedAddress) {
      return firstForwardedAddress
    }
  }

  const realIp = getRequestHeaderValue(requestContext, 'x-real-ip')
  if (realIp) {
    return realIp
  }

  return ''
}

const createOpenRateLimitResult = (): IRateLimitResult => ({
  isLimited: false,
  remaining: Number.MAX_SAFE_INTEGER,
  resetAt: Date.now(),
  retryAfterSeconds: 0,
})

export const authorizeCredentialsWithDependencies = async (
  credentials?: {
    email?: string
    password?: string
  },
  dependencies?: ICredentialsAuthorizeDependencies,
  requestContext?: ICredentialsRequestContext
) => {
  const email = credentials?.email?.trim().toLowerCase()
  const password = credentials?.password
  const findUserByEmail =
    dependencies?.findUserByEmail ??
    ((emailValue: string) => {
      return prisma.user.findUnique({
        where: { email: emailValue },
        select: {
          id: true,
          name: true,
          email: true,
          hashedPassword: true,
          emailVerified: true,
        },
      })
    })
  const verifyPasswordValue =
    dependencies?.verifyPasswordValue ?? verifyPassword
  const updateUserPasswordHash =
    dependencies?.updateUserPasswordHash ??
    (async (userId: string, hashedPasswordValue: string) => {
      await prisma.user.update({
        where: { id: userId },
        data: {
          hashedPassword: hashedPasswordValue,
        },
      })
    })
  const updateUserEmailVerified =
    dependencies?.updateUserEmailVerified ??
    (async (userId: string) => {
      await prisma.user.update({
        where: { id: userId },
        data: {
          emailVerified: new Date(),
        },
      })
    })
  const consumeCredentialsRateLimit =
    dependencies?.consumeCredentialsRateLimit ??
    (process.env.NODE_ENV === 'test'
      ? async () => createOpenRateLimitResult()
      : async (identifier: string) => {
          return enforceIdentifierRateLimit({
            identifier,
            scope: 'auth-credentials',
            maxRequests: 25,
            windowMs: 10 * 60_000,
          })
        })
  const onError =
    dependencies?.onError ??
    ((error: unknown) => {
      console.error('Credentials authorize error:', error)
    })

  if (!email || !password) {
    return null
  }

  const clientAddress = getClientAddressFromRequestContext(requestContext)

  const emailRateLimit = await consumeCredentialsRateLimit(`email:${email}`)
  if (emailRateLimit.isLimited) {
    return null
  }

  if (clientAddress) {
    const clientRateLimit = await consumeCredentialsRateLimit(
      `ip:${clientAddress}`
    )
    if (clientRateLimit.isLimited) {
      return null
    }
  }

  try {
    const user = await findUserByEmail(email)

    if (!user?.hashedPassword) {
      return null
    }

    let shouldUpgradeLegacyPassword = false
    const isScryptPasswordHash = user.hashedPassword.startsWith('scrypt$')
    const isPasswordValid = isScryptPasswordHash
      ? verifyPasswordValue(password, user.hashedPassword)
      : (() => {
          const providedPasswordBuffer = Buffer.from(password, 'utf8')
          const storedPasswordBuffer = Buffer.from(user.hashedPassword, 'utf8')
          if (providedPasswordBuffer.length !== storedPasswordBuffer.length) {
            return false
          }
          const isMatch = timingSafeEqual(
            providedPasswordBuffer,
            storedPasswordBuffer
          )
          shouldUpgradeLegacyPassword = isMatch
          return isMatch
        })()

    if (!isPasswordValid) {
      return null
    }

    if (shouldUpgradeLegacyPassword) {
      try {
        await updateUserPasswordHash(user.id, hashPassword(password))
      } catch (error) {
        onError(error)
      }
    }

    if (!user.emailVerified) {
      try {
        await updateUserEmailVerified(user.id)
      } catch (error) {
        onError(error)
      }
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
    }
  } catch (error) {
    onError(error)
    return null
  }
}

export const authorizeCredentials = async (
  credentials?: {
    email?: string
    password?: string
  },
  requestContext?: ICredentialsRequestContext
) => {
  return authorizeCredentialsWithDependencies(
    credentials,
    undefined,
    requestContext
  )
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: 'Email and Password',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: (credentials, request) =>
        authorizeCredentials(
          credentials,
          request as ICredentialsRequestContext
        ),
    }),
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
  ],
  callbacks: {
    session: async ({ session, token }) => {
      if (session?.user && token?.sub) {
        session.user.id = token.sub
      }
      return session
    },
    jwt: async ({ user, token }) => {
      if (user) {
        token.sub = user.id
      }
      return token
    },
  },
  pages: {
    signIn: '/auth/login',
  },
  session: {
    strategy: 'jwt',
  },
}
