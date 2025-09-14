import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { attendanceLogs, users, schedules, laboratories } from '@/lib/db/schema'
import { eq, and, gte, lte, sql } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { biometricId, labId, verificationMethod = 'biometric' } = body

    if (!biometricId || !labId) {
      return NextResponse.json(
        { error: 'Missing required fields: biometricId, labId' },
        { status: 400 }
      )
    }

    // Find user by biometric ID
    const user = await db
      .select({
        id: users.id,
        fullName: users.fullName,
        email: users.email,
        role: users.role,
        biometricId: users.biometricId
      })
      .from(users)
      .where(eq(users.biometricId, biometricId))
      .limit(1)

    if (!user.length) {
      return NextResponse.json(
        { error: 'User not found with provided biometric ID' },
        { status: 404 }
      )
    }

    const userData = user[0]

    // Check if user is faculty (only faculty can record attendance)
    if (userData.role !== 'faculty') {
      return NextResponse.json(
        { error: 'Only faculty members can record attendance' },
        { status: 403 }
      )
    }

    // Get current date and time
    const now = new Date()
    const currentDay = now.getDay() // 0 = Sunday, 1 = Monday, etc.
    const currentTime = now.toTimeString().slice(0, 5) // HH:MM format
    const currentTimestamp = Math.floor(now.getTime() / 1000)

    // Check if faculty has a scheduled class in this lab at this time
    const scheduledClass = await db
      .select({
        id: schedules.id,
        labId: schedules.labId,
        userId: schedules.userId,
        dayOfWeek: schedules.dayOfWeek,
        startTime: schedules.startTime,
        endTime: schedules.endTime,
        courseCode: schedules.courseCode,
        section: schedules.section,
        subject: schedules.subject,
        isRecurring: schedules.isRecurring,
        startDate: schedules.startDate,
        endDate: schedules.endDate,
        labName: laboratories.name
      })
      .from(schedules)
      .leftJoin(laboratories, eq(schedules.labId, laboratories.id))
      .where(
        and(
          eq(schedules.userId, userData.id),
          eq(schedules.labId, labId),
          or(
            // Check recurring schedule for today
            and(
              eq(schedules.isRecurring, true),
              eq(schedules.dayOfWeek, currentDay),
              lte(schedules.startTime, currentTime),
              gte(schedules.endTime, currentTime)
            ),
            // Check one-time schedule for today
            and(
              eq(schedules.isRecurring, false),
              gte(schedules.startDate, currentTimestamp - 86400), // Within last 24 hours
              lte(schedules.startDate, currentTimestamp + 86400), // Within next 24 hours
              lte(schedules.startTime, currentTime),
              gte(schedules.endTime, currentTime)
            )
          )
        )
      )
      .limit(1)

    if (!scheduledClass.length) {
      return NextResponse.json(
        { 
          error: 'No scheduled class found for this faculty member in the specified laboratory at this time',
          details: {
            currentDay,
            currentTime,
            labId,
            userId: userData.id
          }
        },
        { status: 403 }
      )
    }

    const scheduleData = scheduledClass[0]

    // Check if faculty already has an active attendance session (not checked out)
    const activeSession = await db
      .select()
      .from(attendanceLogs)
      .where(
        and(
          eq(attendanceLogs.userId, userData.id),
          eq(attendanceLogs.labId, labId),
          sql`${attendanceLogs.checkOutTime} IS NULL`
        )
      )
      .limit(1)

    let attendanceRecord
    let action: 'check_in' | 'check_out'

    if (activeSession.length) {
      // Check out from existing session
      const updatedAttendance = await db
        .update(attendanceLogs)
        .set({
          checkOutTime: currentTimestamp,
          updatedAt: sql`unixepoch()`
        })
        .where(eq(attendanceLogs.id, activeSession[0].id))
        .returning()

      attendanceRecord = updatedAttendance[0]
      action = 'check_out'
    } else {
      // Create new attendance record (check in)
      const newAttendance = await db.insert(attendanceLogs).values({
        id: `att-${Date.now()}`,
        userId: userData.id,
        labId: labId,
        checkInTime: currentTimestamp,
        verificationMethod,
        biometricData: biometricId,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        notes: `Scheduled class: ${scheduleData.courseCode || 'N/A'} - ${scheduleData.subject || 'N/A'}`
      }).returning()

      attendanceRecord = newAttendance[0]
      action = 'check_in'
    }

    return NextResponse.json({
      success: true,
      action,
      user: {
        id: userData.id,
        fullName: userData.fullName,
        email: userData.email,
        role: userData.role
      },
      schedule: scheduleData,
      attendance: attendanceRecord,
      timestamp: currentTimestamp
    })

  } catch (error) {
    console.error('Error recording attendance:', error)
    return NextResponse.json(
      { error: 'Failed to record attendance' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const labId = searchParams.get('labId')
    const active = searchParams.get('active') === 'true'

    let query = db
      .select({
        id: attendanceLogs.id,
        userId: attendanceLogs.userId,
        labId: attendanceLogs.labId,
        checkInTime: attendanceLogs.checkInTime,
        checkOutTime: attendanceLogs.checkOutTime,
        verificationMethod: attendanceLogs.verificationMethod,
        biometricData: attendanceLogs.biometricData,
        ipAddress: attendanceLogs.ipAddress,
        notes: attendanceLogs.notes,
        createdAt: attendanceLogs.createdAt,
        userName: users.fullName,
        userEmail: users.email,
        labName: laboratories.name
      })
      .from(attendanceLogs)
      .leftJoin(users, eq(attendanceLogs.userId, users.id))
      .leftJoin(laboratories, eq(attendanceLogs.labId, laboratories.id))

    // Apply filters
    if (userId) {
      query = query.where(eq(attendanceLogs.userId, userId))
    }
    
    if (labId) {
      query = query.where(eq(attendanceLogs.labId, labId))
    }

    if (active) {
      query = query.where(sql`${attendanceLogs.checkOutTime} IS NULL`)
    }

    const result = await query.orderBy(sql`${attendanceLogs.checkInTime} DESC`)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching attendance:', error)
    return NextResponse.json(
      { error: 'Failed to fetch attendance' },
      { status: 500 }
    )
  }
}