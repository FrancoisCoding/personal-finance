/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    // Database
    DATABASE_URL: process.env.DATABASE_URL,

    // NextAuth.js
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,

    // OAuth Providers
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GITHUB_ID: process.env.GITHUB_ID,
    GITHUB_SECRET: process.env.GITHUB_SECRET,

    // Teller
    NEXT_PUBLIC_TELLER_APPLICATION_ID:
      process.env.NEXT_PUBLIC_TELLER_APPLICATION_ID,
    NEXT_PUBLIC_TELLER_ENV: process.env.NEXT_PUBLIC_TELLER_ENV,
    TELLER_ENV: process.env.TELLER_ENV,
    TELLER_CERT_PATH: process.env.TELLER_CERT_PATH,
    TELLER_KEY_PATH: process.env.TELLER_KEY_PATH,

    // Email
    EMAIL_SERVER_HOST: process.env.EMAIL_SERVER_HOST,
    EMAIL_SERVER_PORT: process.env.EMAIL_SERVER_PORT,
    EMAIL_SERVER_USER: process.env.EMAIL_SERVER_USER,
    EMAIL_SERVER_PASSWORD: process.env.EMAIL_SERVER_PASSWORD,
    EMAIL_FROM: process.env.EMAIL_FROM,
  },
  images: {
    domains: ['lh3.googleusercontent.com', 'avatars.githubusercontent.com'],
  },
}

module.exports = nextConfig
