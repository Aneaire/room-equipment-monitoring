import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const biometricId = searchParams.get('biometricId')

  if (!biometricId) {
    return NextResponse.json({ error: 'Biometric ID is required' }, { status: 400 })
  }

  try {
    // Find user by biometric ID
    const user = await db
      .select()
      .from(users)
      .where(eq(users.biometricId, biometricId))
      .limit(1)
      .then((rows) => rows[0])

    if (!user) {
      return NextResponse.json({ 
        error: 'User not found with this biometric ID',
        biometricId,
        found: false 
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
        department: user.department,
        biometricId: user.biometricId,
        isActive: user.isActive,
      },
      message: `User found: ${user.fullName} (${user.role})`
    })

  } catch (error) {
    console.error('Biometric lookup error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      biometricId 
    }, { status: 500 })
  }
}