import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { attendanceLogs, users, laboratories } from '@/lib/db/schema'
import { sql, desc } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const dateRange = searchParams.get('dateRange') || '7d'
    const labFilter = searchParams.get('lab') || 'all'

    // Calculate date range
    const now = new Date()
    const startDate = new Date()

    switch (dateRange) {
      case '1d':
        startDate.setDate(now.getDate() - 1)
        break
      case '7d':
        startDate.setDate(now.getDate() - 7)
        break
      case '30d':
        startDate.setDate(now.getDate() - 30)
        break
      case '90d':
        startDate.setDate(now.getDate() - 90)
        break
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1)
        break
      default:
        startDate.setDate(now.getDate() - 7)
    }

    // Build query conditions
    let whereConditions = sql`${attendanceLogs.checkInTime} >= ${startDate.getTime()}`
    
    if (labFilter !== 'all') {
      whereConditions = sql`${whereConditions} AND ${attendanceLogs.labId} = ${labFilter}`
    }

    // Fetch attendance data with user and lab information
    const attendanceData = await db
      .select({
        id: attendanceLogs.id,
        userName: users.fullName,
        labName: laboratories.name,
        checkInTime: attendanceLogs.checkInTime,
        checkOutTime: attendanceLogs.checkOutTime,
        verificationMethod: attendanceLogs.verificationMethod,
      })
      .from(attendanceLogs)
      .leftJoin(users, sql`${attendanceLogs.userId} = ${users.id}`)
      .leftJoin(laboratories, sql`${attendanceLogs.labId} = ${laboratories.id}`)
      .where(whereConditions)
      .orderBy(desc(attendanceLogs.checkInTime))
      .limit(1000)

    // Calculate duration for each record
    const processedAttendance = attendanceData.map((record) => {
      const checkInTime = new Date(record.checkInTime)
      const checkOutTime = record.checkOutTime ? new Date(record.checkOutTime) : null
      let duration = 'Active'

      if (checkOutTime) {
        const diffMs = checkOutTime.getTime() - checkInTime.getTime()
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
        const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
        
        if (diffHours > 0) {
          duration = `${diffHours}h ${diffMinutes}m`
        } else {
          duration = `${diffMinutes}m`
        }
      }

      return {
        ...record,
        duration,
        checkInTime: checkInTime.toISOString(),
        checkOutTime: checkOutTime ? checkOutTime.toISOString() : null,
      }
    })

    return NextResponse.json({ attendance: processedAttendance })
  } catch (error) {
    console.error('Error fetching attendance report:', error)
    return NextResponse.json(
      { error: 'Failed to fetch attendance report' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { searchParams } = new URL(request.url)

    // Get the data first
    const response = await GET(request)
    if (!response.ok) {
      return response
    }

    const data = await response.json()
    const attendanceData = data.attendance

    // Generate CSV content
    const headers = [
      'User Name',
      'Laboratory',
      'Check In Time',
      'Check Out Time',
      'Duration',
      'Verification Method'
    ]

    const csvRows = [
      headers.join(','),
      ...attendanceData.map((record: Record<string, unknown>) => [
        record.userName || '',
        record.labName || '',
        new Date(record.checkInTime).toLocaleString(),
        record.checkOutTime ? new Date(record.checkOutTime).toLocaleString() : 'Active',
        record.duration,
        record.verificationMethod
      ].join(','))
    ]

    const csvContent = csvRows.join('\n')

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="attendance-report-${new Date().toISOString().split('T')[0]}.csv"`
      }
    })
  } catch (error) {
    console.error('Error exporting attendance report:', error)
    return NextResponse.json(
      { error: 'Failed to export attendance report' },
      { status: 500 }
    )
  }
}