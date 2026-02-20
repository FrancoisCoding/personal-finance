import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from './prisma'
import { verifyPassword } from './password'

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

export const authorizeCredentialsWithDependencies = async (
  credentials?: {
    email?: string
    password?: string
  },
  dependencies?: {
    findUserByEmail?: (email: string) => Promise<{
      id: string
      name: string | null
      email: string
      hashedPassword: string | null
    } | null>
    verifyPasswordValue?: (password: string, storedHash: string) => boolean
    onError?: (error: unknown) => void
  }
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
        },
      })
    })
  const verifyPasswordValue =
    dependencies?.verifyPasswordValue ?? verifyPassword
  const onError =
    dependencies?.onError ??
    ((error: unknown) => {
      console.error('Credentials authorize error:', error)
    })

  if (!email || !password) {
    return null
  }
  try {
    const user = await findUserByEmail(email)

    if (!user?.hashedPassword) {
      return null
    }

    const isPasswordValid = verifyPasswordValue(password, user.hashedPassword)
    if (!isPasswordValid) {
      return null
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

export const authorizeCredentials = async (credentials?: {
  email?: string
  password?: string
}) => {
  return authorizeCredentialsWithDependencies(credentials)
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
      authorize: authorizeCredentials,
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
