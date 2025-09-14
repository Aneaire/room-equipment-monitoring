import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { laboratories, equipment } from '@/lib/db/schema'
import { eq, sql, desc } from 'drizzle-orm'

export async function GET() {
  try {
    const allLabs = await db
      .select()
      .from(laboratories)
      .orderBy(desc(laboratories.createdAt))

    const laboratoriesWithStats = await Promise.all(
      allLabs.map(async (lab) => {
        // Get equipment count for this lab
        const equipmentCount = await db
          .select({ count: sql`count(*)` })
          .from(equipment)
          .where(eq(equipment.labId, lab.id))

        // Get issues count (missing or damaged equipment)
        const issuesCount = await db
          .select({ count: sql`count(*)` })
          .from(equipment)
          .where(eq(equipment.labId, lab.id))
          .where(sql`${equipment.status} = 'missing' OR ${equipment.status} = 'damaged'`)

        // Calculate occupancy (placeholder - would need real-time data)
        const occupancy = Math.floor(Math.random() * lab.capacity * 0.8) // Mock occupancy

        return {
          ...lab,
          occupancy,
          equipmentCount: equipmentCount[0].count,
          issues: issuesCount[0].count
        }
      })
    )

    return NextResponse.json({ laboratories: laboratoriesWithStats })
  } catch (error) {
    console.error('Failed to fetch laboratories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch laboratories' },
      { status: 500 }
    )
  }
}