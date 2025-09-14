import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { laboratories } from '@/lib/db/schema'
import { desc } from 'drizzle-orm'

export async function GET() {
  try {
    const labs = await db
      .select()
      .from(laboratories)
      .orderBy(desc(laboratories.createdAt))
    return NextResponse.json(labs)
  } catch (error) {
    console.error('Error fetching laboratories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch laboratories' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, building, roomNumber, capacity, status, description } = body

    if (!name || !building || !roomNumber || !capacity) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const newLab = await db.insert(laboratories).values({
      id: `lab-${Date.now()}`,
      name,
      building,
      roomNumber,
      capacity: parseInt(capacity),
      status: status || 'active',
      description: description || null,
    }).returning()

    return NextResponse.json(newLab[0], { status: 201 })
  } catch (error) {
    console.error('Error creating laboratory:', error)
    return NextResponse.json(
      { error: 'Failed to create laboratory' },
      { status: 500 }
    )
  }
}