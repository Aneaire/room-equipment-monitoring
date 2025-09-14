import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { equipment } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const deletedEquipment = await db
      .delete(equipment)
      .where(eq(equipment.id, id))
      .returning()

    if (deletedEquipment.length === 0) {
      return NextResponse.json(
        { error: 'Equipment not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: 'Equipment deleted successfully' })
  } catch (error) {
    console.error('Error deleting equipment:', error)
    return NextResponse.json(
      { error: 'Failed to delete equipment' },
      { status: 500 }
    )
  }
}