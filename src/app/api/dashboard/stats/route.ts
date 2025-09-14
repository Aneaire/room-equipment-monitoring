import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users, laboratories, equipment, attendanceLogs, alerts } from '@/lib/db/schema'
import { eq, sql } from 'drizzle-orm'

export async function GET() {
  try {
    const today = new Date()
    const startOfToday = Math.floor(today.getTime() / 1000)
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    const startOfLastWeek = Math.floor(lastWeek.getTime() / 1000)

    // Get total users
    const totalUsers = await db.select({ count: sql`count(*)` }).from(users)
    
    // Get active labs
    const activeLabs = await db
      .select({ count: sql`count(*)` })
      .from(laboratories)
      .where(eq(laboratories.status, 'active'))
    
    // Get total equipment
    const totalEquipment = await db.select({ count: sql`count(*)` }).from(equipment)
    
    // Get active alerts
    const activeAlerts = await db
      .select({ count: sql`count(*)` })
      .from(alerts)
      .where(eq(alerts.resolved, false))
    
    // Get today's attendance using raw SQL
    const todayAttendance = await db
      .select({ count: sql`count(distinct user_id)` })
      .from(attendanceLogs)
      .where(sql`check_in_time >= ${startOfToday}`)

    // Get last week's attendance for comparison using raw SQL
    const lastWeekAttendance = await db
      .select({ count: sql`count(distinct user_id)` })
      .from(attendanceLogs)
      .where(sql`check_in_time >= ${startOfLastWeek} AND check_in_time < ${startOfToday}`)

    return NextResponse.json({
      stats: {
        totalUsers: totalUsers[0].count,
        activeLabs: activeLabs[0].count,
        totalEquipment: totalEquipment[0].count,
        activeAlerts: activeAlerts[0].count,
        currentOccupancy: 0, // Placeholder for real-time occupancy
        todayAttendance: todayAttendance[0].count,
        lastWeekAttendance: lastWeekAttendance[0].count
      }
    })
  } catch (error) {
    console.error('Failed to fetch dashboard stats:', error)
    console.error('Error details:', JSON.stringify(error, null, 2))
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats', details: error.message },
      { status: 500 }
    )
  }
}