import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import crypto from 'crypto'

// In production, you would store these tokens in a database with expiration
const resetTokens = new Map<string, { email: string; expires: Date }>()

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Check if user exists
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1)

    // Always return success even if user doesn't exist (security best practice)
    // This prevents email enumeration attacks
    if (user.length === 0) {
      return NextResponse.json(
        { message: 'If an account exists with this email, a reset link has been sent.' },
        { status: 200 }
      )
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const expires = new Date()
    expires.setHours(expires.getHours() + 1) // Token expires in 1 hour

    // Store token (in production, save to database)
    resetTokens.set(resetToken, { email, expires })

    // In production, you would send an actual email here
    // For now, we'll log the reset link
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/reset-password?token=${resetToken}`
    
    console.log('=================================')
    console.log('Password Reset Link Generated:')
    console.log(resetLink)
    console.log('This link expires in 1 hour')
    console.log('=================================')

    // In production, send email using a service like SendGrid, AWS SES, etc.
    // await sendPasswordResetEmail(email, resetLink)

    return NextResponse.json(
      { 
        message: 'If an account exists with this email, a reset link has been sent.',
        // Include reset link in development only
        ...(process.env.NODE_ENV === 'development' && { resetLink })
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Export the tokens for use in reset-password route
export { resetTokens }