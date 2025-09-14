import { DrizzleAdapter } from '@auth/drizzle-adapter'
import bcrypt from 'bcryptjs'
import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { db } from './db'
import { users } from './db/schema'
import { eq } from 'drizzle-orm'

export const authOptions: NextAuthOptions = {
  adapter: DrizzleAdapter(db) as any,
  session: {
    strategy: 'jwt',
  },
  providers: [
    // Traditional username/password provider
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null
        }

        const user = await db
          .select()
          .from(users)
          .where(eq(users.username, credentials.username))
          .limit(1)
          .then((rows) => rows[0])

        if (!user || !user.isActive) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.passwordHash)

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          username: user.username,
          email: user.email,
          name: user.fullName,
          role: user.role,
          department: user.department,
          biometricId: user.biometricId,
        }
      },
    }),
    // Biometric authentication provider
    CredentialsProvider({
      name: 'biometric',
      credentials: {
        biometricId: { label: 'Biometric ID', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.biometricId) {
          return null
        }

        const user = await db
          .select()
          .from(users)
          .where(eq(users.biometricId, credentials.biometricId))
          .limit(1)
          .then((rows) => rows[0])

        if (!user || !user.isActive) {
          return null
        }

        return {
          id: user.id,
          username: user.username,
          email: user.email,
          name: user.fullName,
          role: user.role,
          department: user.department,
          biometricId: user.biometricId,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.department = user.department
        token.biometricId = user.biometricId
        token.username = user.username
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as string
        session.user.department = token.department as string
        session.user.biometricId = token.biometricId as string
        session.user.username = token.username as string
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  secret: process.env.NEXTAUTH_SECRET || 'tabetala-secret-key',
}

declare module 'next-auth' {
  interface User {
    id: string
    username: string
    email: string
    name: string
    role: string
    department?: string
    biometricId?: string
  }

  interface Session {
    user: {
      id: string
      username: string
      email: string
      name: string
      role: string
      department?: string
      biometricId?: string
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: string
    department?: string
    biometricId?: string
    username: string
  }
}