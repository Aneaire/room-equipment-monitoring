import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { alerts } from '@/lib/db/schema'
import { desc, eq } from 'drizzle-orm'

export async function GET() {
  try {
    const activeAlerts = await db
      .select()
      .from(alerts)
      .where(eq(alerts.resolved, false))
      .orderBy(desc(alerts.createdAt))
      .limit(10)

    return NextResponse.json({ alerts: activeAlerts })
  } catch (error) {
    console.error('Failed to fetch alerts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch alerts' },
      { status: 500 }
    )
  }
}