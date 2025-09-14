import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { laboratories } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const deletedLab = await db
      .delete(laboratories)
      .where(eq(laboratories.id, id))
      .returning()

    if (deletedLab.length === 0) {
      return NextResponse.json(
        { error: 'Laboratory not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: 'Laboratory deleted successfully' })
  } catch (error) {
    console.error('Error deleting laboratory:', error)
    return NextResponse.json(
      { error: 'Failed to delete laboratory' },
      { status: 500 }
    )
  }
}