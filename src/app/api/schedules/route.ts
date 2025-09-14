import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { schedules, users, laboratories } from '@/lib/db/schema'
import { eq, and, gte, lte, desc, or, sql } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const labId = searchParams.get('labId')
    const userId = searchParams.get('userId')
    const upcoming = searchParams.get('upcoming') === 'true'

    let query = db
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
        createdAt: schedules.createdAt,
        updatedAt: schedules.updatedAt,
        userName: users.fullName,
        userEmail: users.email,
        labName: laboratories.name,
        userBiometricId: users.biometricId
      })
      .from(schedules)
      .leftJoin(users, eq(schedules.userId, users.id))
      .leftJoin(laboratories, eq(schedules.labId, laboratories.id))

    // Apply filters
    if (labId) {
      query = query.where(eq(schedules.labId, labId))
    }
    
    if (userId) {
      query = query.where(eq(schedules.userId, userId))
    }

    if (upcoming) {
      const now = new Date()
      const today = now.getDay() // 0 = Sunday, 1 = Monday, etc.
      const currentTime = now.toTimeString().slice(0, 5) // HH:MM format
      
      query = query.where(
        or(
          // Recurring schedules for today with future start time
          and(
            eq(schedules.isRecurring, true),
            eq(schedules.dayOfWeek, today),
            gte(schedules.startTime, currentTime)
          ),
          // One-time schedules with future start date
          and(
            eq(schedules.isRecurring, false),
            gte(schedules.startDate, Math.floor(now.getTime() / 1000))
          )
        )
      )
    }

    const result = await query.orderBy(desc(schedules.createdAt))

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching schedules:', error)
    return NextResponse.json(
      { error: 'Failed to fetch schedules' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      labId,
      userId,
      dayOfWeek,
      startTime,
      endTime,
      courseCode,
      section,
      subject,
      isRecurring = true,
      startDate,
      endDate
    } = body

    // Validate required fields
    if (!labId || !userId || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'Missing required fields: labId, userId, startTime, endTime' },
        { status: 400 }
      )
    }

    // For recurring schedules, dayOfWeek is required
    if (isRecurring && !dayOfWeek) {
      return NextResponse.json(
        { error: 'dayOfWeek is required for recurring schedules' },
        { status: 400 }
      )
    }

    // For one-time schedules, startDate is required
    if (!isRecurring && !startDate) {
      return NextResponse.json(
        { error: 'startDate is required for one-time schedules' },
        { status: 400 }
      )
    }

    // Check if user has biometric ID
    const user = await db
      .select({ biometricId: users.biometricId })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)

    if (!user.length || !user[0].biometricId) {
      return NextResponse.json(
        { error: 'Teacher must have biometric ID registered before scheduling' },
        { status: 400 }
      )
    }

    // TODO: Implement proper schedule conflict detection
    // For now, skip conflict detection to allow schedule creation

    // Create the schedule
    const newSchedule = await db.insert(schedules).values({
      id: `sched-${Date.now()}`,
      labId,
      userId,
      dayOfWeek: isRecurring ? dayOfWeek : null,
      startTime,
      endTime,
      courseCode,
      section,
      subject,
      isRecurring,
      startDate: isRecurring ? null : startDate,
      endDate: isRecurring && endDate ? endDate : null
    }).returning()

    return NextResponse.json(newSchedule[0], { status: 201 })
  } catch (error) {
    console.error('Error creating schedule:', error)
    return NextResponse.json(
      { error: 'Failed to create schedule' },
      { status: 500 }
    )
  }
}