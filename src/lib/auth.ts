import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import GoogleProvider from 'next-auth/providers/google'
import { prisma } from './prisma'

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

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
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
    redirect: async ({ url, baseUrl }) => {
      if (url.startsWith('/')) {
        if (url === '/auth/login' || url === '/auth/register') {
          return `${baseUrl}/dashboard`
        }
        return `${baseUrl}${url}`
      }

      try {
        const parsedUrl = new URL(url)
        if (parsedUrl.origin === baseUrl) {
          if (
            parsedUrl.pathname === '/auth/login' ||
            parsedUrl.pathname === '/auth/register'
          ) {
            return `${baseUrl}/dashboard`
          }
          return url
        }
      } catch (error) {
        void error
      }

      return `${baseUrl}/dashboard`
    },
  },
  pages: {
    signIn: '/auth/login',
  },
  session: {
    strategy: 'jwt',
  },
}
