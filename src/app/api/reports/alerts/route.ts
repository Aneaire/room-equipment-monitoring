import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { alerts, laboratories } from '@/lib/db/schema'
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
    let whereConditions = sql`${alerts.createdAt} >= ${startDate.getTime()}`
    
    if (labFilter !== 'all') {
      whereConditions = sql`${whereConditions} AND ${alerts.labId} = ${labFilter}`
    }

    // Fetch alerts data with laboratory information
    const alertsData = await db
      .select({
        id: alerts.id,
        type: alerts.type,
        severity: alerts.severity,
        labName: laboratories.name,
        title: alerts.title,
        message: alerts.message,
        createdAt: alerts.createdAt,
        resolved: alerts.resolved,
        resolvedAt: alerts.resolvedAt,
        resolvedBy: alerts.resolvedBy,
      })
      .from(alerts)
      .leftJoin(laboratories, sql`${alerts.labId} = ${laboratories.id}`)
      .where(whereConditions)
      .orderBy(desc(alerts.createdAt))
      .limit(1000)

    // Process the data to handle null values and format dates
    const processedAlerts = alertsData.map((record) => ({
      ...record,
      labName: record.labName || 'System',
      createdAt: new Date(record.createdAt).toISOString(),
      resolvedAt: record.resolvedAt ? new Date(record.resolvedAt).toISOString() : null,
    }))

    return NextResponse.json({ alerts: processedAlerts })
  } catch (error) {
    console.error('Error fetching alerts report:', error)
    return NextResponse.json(
      { error: 'Failed to fetch alerts report' },
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
    const alertsData = data.alerts

    // Generate CSV content
    const headers = [
      'Type',
      'Severity',
      'Laboratory',
      'Title',
      'Message',
      'Created',
      'Resolved',
      'Resolved At'
    ]

    const csvRows = [
      headers.join(','),
      ...alertsData.map((record: Record<string, unknown>) => [
        record.type,
        record.severity,
        record.labName,
        record.title,
        `"${record.message.replace(/"/g, '""')}"`, // Escape quotes for CSV
        new Date(record.createdAt).toLocaleString(),
        record.resolved ? 'Yes' : 'No',
        record.resolvedAt ? new Date(record.resolvedAt).toLocaleString() : ''
      ].join(','))
    ]

    const csvContent = csvRows.join('\n')

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="alerts-report-${new Date().toISOString().split('T')[0]}.csv"`
      }
    })
  } catch (error) {
    console.error('Error exporting alerts report:', error)
    return NextResponse.json(
      { error: 'Failed to export alerts report' },
      { status: 500 }
    )
  }
}