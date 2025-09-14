import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { equipment, laboratories } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'

export async function GET() {
  try {
    const equipmentList = await db
      .select({
        id: equipment.id,
        labId: equipment.labId,
        type: equipment.type,
        serialNumber: equipment.serialNumber,
        brand: equipment.brand,
        model: equipment.model,
        status: equipment.status,
        lastDetected: equipment.lastDetected,
        positionX: equipment.positionX,
        positionY: equipment.positionY,
        assignedStation: equipment.assignedStation,
        labName: laboratories.name,
      })
      .from(equipment)
      .leftJoin(laboratories, eq(equipment.labId, laboratories.id))
      .orderBy(desc(equipment.createdAt))

    return NextResponse.json(equipmentList)
  } catch (error) {
    console.error('Error fetching equipment:', error)
    return NextResponse.json(
      { error: 'Failed to fetch equipment' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, serialNumber, brand, model, labId, assignedStation } = body

    if (!type || !serialNumber || !brand || !model || !labId || !assignedStation) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const newEquipment = await db.insert(equipment).values({
      id: `${type.substring(0, 2)}-${Date.now()}`,
      type,
      serialNumber,
      brand,
      model,
      labId,
      assignedStation,
      status: 'present',
      positionX: Math.random() * 400 + 50,
      positionY: Math.random() * 300 + 50,
      lastDetected: new Date(),
    }).returning()

    return NextResponse.json(newEquipment[0], { status: 201 })
  } catch (error) {
    console.error('Error creating equipment:', error)
    return NextResponse.json(
      { error: 'Failed to create equipment' },
      { status: 500 }
    )
  }
}