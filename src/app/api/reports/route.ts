import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users, laboratories, equipment, attendanceLogs, alerts, occupancyLogs } from '@/lib/db/schema'
import { sql, count, avg } from 'drizzle-orm'

export async function GET() {
  try {
    // Get current date for calculations
    const today = new Date()
    const todayStart = new Date(today.setHours(0, 0, 0, 0))
    const todayEnd = new Date(today.setHours(23, 59, 59, 999))

    // Get total users count
    const totalUsersResult = await db.select({ count: count() }).from(users)
    const totalUsers = totalUsersResult[0]?.count || 0

    // Get active laboratories count
    const activeLabsResult = await db
      .select({ count: count() })
      .from(laboratories)
      .where(sql`${laboratories.status} = 'active'`)
    const activeLabs = activeLabsResult[0]?.count || 0

    // Get total equipment count
    const totalEquipmentResult = await db.select({ count: count() }).from(equipment)
    const totalEquipment = totalEquipmentResult[0]?.count || 0

    // Get active alerts count
    const activeAlertsResult = await db
      .select({ count: count() })
      .from(alerts)
      .where(sql`${alerts.resolved} = false`)
    const activeAlerts = activeAlertsResult[0]?.count || 0

    // Get today's attendance count
    const todayAttendanceResult = await db
      .select({ count: count() })
      .from(attendanceLogs)
      .where(
        sql`${attendanceLogs.checkInTime} >= ${todayStart.getTime()} AND ${attendanceLogs.checkInTime} <= ${todayEnd.getTime()}`
      )
    const todayAttendance = todayAttendanceResult[0]?.count || 0

    // Get average occupancy rate
    const avgOccupancyResult = await db
      .select({
        avgOccupancy: avg(sql`CAST(${occupancyLogs.peopleCount} AS REAL) * 100 / CAST(${laboratories.capacity} AS REAL)`)
      })
      .from(occupancyLogs)
      .leftJoin(laboratories, sql`${occupancyLogs.labId} = ${laboratories.id}`)
      .where(
        sql`${occupancyLogs.timestamp} >= ${todayStart.getTime()} AND ${occupancyLogs.timestamp} <= ${todayEnd.getTime()}`
      )
    const avgOccupancy = Math.round(avgOccupancyResult[0]?.avgOccupancy || 0)

    const reportData = {
      totalUsers,
      activeLabs,
      totalEquipment,
      activeAlerts,
      todayAttendance,
      avgOccupancy
    }

    return NextResponse.json(reportData)
  } catch (error) {
    console.error('Error fetching report data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch report data' },
      { status: 500 }
    )
  }
}