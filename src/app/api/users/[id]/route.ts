import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, params.id))
      .limit(1)

    if (user.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ user: user[0] })
  } catch (error) {
    console.error('Failed to fetch user:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { username, email, fullName, department, role, biometricId, password } = body

    // Validate required fields
    if (!username || !email || !fullName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Check if user exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, params.id))
      .limit(1)

    if (existingUser.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check for duplicate username/email (excluding current user)
    const duplicateCheck = await db
      .select()
      .from(users)
      .where(
        or(
          eq(users.username, username),
          eq(users.email, email)
        )
      )
      .limit(1)

    if (duplicateCheck.length > 0 && duplicateCheck[0].id !== params.id) {
      if (duplicateCheck[0].username === username) {
        return NextResponse.json(
          { error: 'Username already taken' },
          { status: 409 }
        )
      }
      if (duplicateCheck[0].email === email) {
        return NextResponse.json(
          { error: 'Email already registered' },
          { status: 409 }
        )
      }
    }

    // Prepare update data
    const updateData: any = {
      username,
      email,
      fullName,
      department: department || null,
      role: role || 'faculty',
      biometricId: biometricId || null,
      updatedAt: new Date(),
    }

    // Hash password if provided
    if (password) {
      if (password.length < 8) {
        return NextResponse.json(
          { error: 'Password must be at least 8 characters' },
          { status: 400 }
        )
      }
      updateData.passwordHash = await bcrypt.hash(password, 10)
    }

    // Update user
    await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, params.id))

    // Fetch updated user
    const updatedUser = await db
      .select()
      .from(users)
      .where(eq(users.id, params.id))
      .limit(1)

    return NextResponse.json(
      { 
        message: 'User updated successfully',
        user: updatedUser[0]
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('User update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Check if user exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, params.id))
      .limit(1)

    if (existingUser.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Prevent deletion of admin users
    if (existingUser[0].role === 'admin') {
      return NextResponse.json(
        { error: 'Cannot delete admin users' },
        { status: 403 }
      )
    }

    // Delete user
    await db
      .delete(users)
      .where(eq(users.id, params.id))

    return NextResponse.json(
      { 
        message: 'User deleted successfully'
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('User deletion error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}