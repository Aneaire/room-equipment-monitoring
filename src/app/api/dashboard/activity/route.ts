import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { attendanceLogs, equipment, alerts, users } from '@/lib/db/schema'
import { desc, eq, sql } from 'drizzle-orm'
import { subDays } from 'date-fns'

export async function GET() {
  try {
    const today = new Date()
    const threeDaysAgo = subDays(today, 3)
    const threeDaysAgoTimestamp = Math.floor(threeDaysAgo.getTime() / 1000)

    // Get recent attendance logs
    const recentAttendance = await db
      .select({
        id: attendanceLogs.id,
        userId: attendanceLogs.userId,
        checkInTime: attendanceLogs.checkInTime,
        userName: users.fullName,
        action: sql`'Checked in to Laboratory'`
      })
      .from(attendanceLogs)
      .leftJoin(users, eq(attendanceLogs.userId, users.id))
      .where(sql`check_in_time >= ${threeDaysAgoTimestamp}`)
      .orderBy(desc(sql`check_in_time`))
      .limit(5)

    // Get recent equipment issues
    const recentEquipment = await db
      .select({
        id: equipment.id,
        type: equipment.type,
        serialNumber: equipment.serialNumber,
        status: equipment.status,
        action: sql`case when ${equipment.status} = 'missing' then 'Reported missing' 
                    when ${equipment.status} = 'damaged' then 'Reported damaged' 
                    else 'Status updated' end`
      })
      .from(equipment)
      .where(eq(equipment.status, 'missing'))
      .orderBy(desc(sql`updated_at`))
      .limit(3)

    // Get recent alerts
    const recentAlerts = await db
      .select({
        id: alerts.id,
        type: alerts.type,
        severity: alerts.severity,
        message: alerts.message,
        createdAt: alerts.createdAt
      })
      .from(alerts)
      .where(eq(alerts.resolved, false))
      .orderBy(desc(sql`created_at`))
      .limit(3)

    // Combine and format activities
    const activities = [
      ...recentAttendance.map(log => ({
        id: log.id,
        type: 'attendance',
        user: log.userName || 'Unknown User',
        action: log.action,
        time: new Date(log.checkInTime * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'success'
      })),
      ...recentEquipment.map(eq => ({
        id: eq.id,
        type: 'equipment',
        user: 'System',
        action: eq.action,
        time: eq.updatedAt ? new Date(eq.updatedAt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A',
        status: 'warning'
      })),
      ...recentAlerts.map(alert => ({
        id: alert.id,
        type: 'alert',
        user: 'System',
        action: alert.message,
        time: new Date(alert.createdAt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: alert.severity === 'high' ? 'warning' : 'info'
      }))
    ].sort((a, b) => {
      // Sort by time (most recent first)
      const timeA = new Date(`2024-01-01 ${a.time}`).getTime()
      const timeB = new Date(`2024-01-01 ${b.time}`).getTime()
      return timeB - timeA
    }).slice(0, 10) // Take top 10 activities

    return NextResponse.json({ activities })
  } catch (error) {
    console.error('Failed to fetch recent activity:', error)
    console.error('Error details:', JSON.stringify(error, null, 2))
    return NextResponse.json(
      { error: 'Failed to fetch recent activity', details: error.message },
      { status: 500 }
    )
  }
}