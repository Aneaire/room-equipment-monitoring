import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { schedules } from '@/lib/db/schema'
import { eq, and, or, gte, lte } from 'drizzle-orm'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const schedule = await db
      .select()
      .from(schedules)
      .where(eq(schedules.id, params.id))
      .limit(1)

    if (!schedule.length) {
      return NextResponse.json(
        { error: 'Schedule not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(schedule[0])
  } catch (error) {
    console.error('Error fetching schedule:', error)
    return NextResponse.json(
      { error: 'Failed to fetch schedule' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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
      isRecurring,
      startDate,
      endDate
    } = body

    // Check if schedule exists
    const existingSchedule = await db
      .select()
      .from(schedules)
      .where(eq(schedules.id, params.id))
      .limit(1)

    if (!existingSchedule.length) {
      return NextResponse.json(
        { error: 'Schedule not found' },
        { status: 404 }
      )
    }

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

    // Check for schedule conflicts (excluding current schedule)
    const conflictQuery = db
      .select()
      .from(schedules)
      .where(
        and(
          eq(schedules.labId, labId),
          or(
            // Recurring schedule conflict
            and(
              eq(schedules.isRecurring, true),
              eq(schedules.dayOfWeek, dayOfWeek),
              or(
                and(lte(schedules.startTime, startTime), gte(schedules.endTime, startTime)),
                and(lte(schedules.startTime, endTime), gte(schedules.endTime, endTime)),
                and(gte(schedules.startTime, startTime), lte(schedules.endTime, endTime))
              )
            ),
            // One-time schedule conflict
            and(
              eq(schedules.isRecurring, false),
              eq(schedules.startDate, startDate),
              or(
                and(lte(schedules.startTime, startTime), gte(schedules.endTime, startTime)),
                and(lte(schedules.startTime, endTime), gte(schedules.endTime, endTime)),
                and(gte(schedules.startTime, startTime), lte(schedules.endTime, endTime))
              )
            )
          ),
          // Exclude current schedule
          eq(schedules.id, params.id).not()
        )
      )

    const conflicts = await conflictQuery

    if (conflicts.length > 0) {
      return NextResponse.json(
        { error: 'Schedule conflict detected for the specified room and time' },
        { status: 409 }
      )
    }

    // Update schedule
    const updatedSchedule = await db
      .update(schedules)
      .set({
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
        endDate: isRecurring && endDate ? endDate : null,
        updatedAt: sql`unixepoch()`
      })
      .where(eq(schedules.id, params.id))
      .returning()

    return NextResponse.json(updatedSchedule[0])
  } catch (error) {
    console.error('Error updating schedule:', error)
    return NextResponse.json(
      { error: 'Failed to update schedule' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check if schedule exists
    const existingSchedule = await db
      .select()
      .from(schedules)
      .where(eq(schedules.id, params.id))
      .limit(1)

    if (!existingSchedule.length) {
      return NextResponse.json(
        { error: 'Schedule not found' },
        { status: 404 }
      )
    }

    await db.delete(schedules).where(eq(schedules.id, params.id))

    return NextResponse.json({ message: 'Schedule deleted successfully' })
  } catch (error) {
    console.error('Error deleting schedule:', error)
    return NextResponse.json(
      { error: 'Failed to delete schedule' },
      { status: 500 }
    )
  }
}