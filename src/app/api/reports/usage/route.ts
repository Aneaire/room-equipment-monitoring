import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { occupancyLogs, laboratories } from '@/lib/db/schema'
import { sql, avg, max, sum, count } from 'drizzle-orm'

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
    let whereConditions = sql`${occupancyLogs.timestamp} >= ${startDate.getTime()}`
    
    if (labFilter !== 'all') {
      whereConditions = sql`${whereConditions} AND ${occupancyLogs.labId} = ${labFilter}`
    }

    // Fetch usage data aggregated by laboratory
    const usageData = await db
      .select({
        labName: laboratories.name,
        labId: occupancyLogs.labId,
        totalOccupancy: sum(occupancyLogs.peopleCount),
        avgOccupancy: avg(occupancyLogs.peopleCount),
        peakOccupancy: max(occupancyLogs.peopleCount),
        recordCount: count(),
        labCapacity: laboratories.capacity,
        labStatus: laboratories.status,
      })
      .from(occupancyLogs)
      .leftJoin(laboratories, sql`${occupancyLogs.labId} = ${laboratories.id}`)
      .where(whereConditions)
      .groupBy(occupancyLogs.labId, laboratories.name, laboratories.capacity, laboratories.status)

    // Process the data to calculate utilization rates
    const processedUsage = usageData.map((record) => {
      const utilizationRate = record.labCapacity > 0 
        ? Math.round((record.avgOccupancy / record.labCapacity) * 100)
        : 0

      return {
        labName: record.labName || 'Unknown',
        totalOccupancy: record.totalOccupancy || 0,
        avgOccupancy: Math.round(record.avgOccupancy || 0),
        peakOccupancy: record.peakOccupancy || 0,
        utilizationRate,
        status: record.labStatus || 'unknown'
      }
    })

    return NextResponse.json({ usage: processedUsage })
  } catch (error) {
    console.error('Error fetching usage report:', error)
    return NextResponse.json(
      { error: 'Failed to fetch usage report' },
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
    const usageData = data.usage

    // Generate CSV content
    const headers = [
      'Laboratory',
      'Total Occupancy',
      'Average Occupancy',
      'Peak Occupancy',
      'Utilization Rate (%)',
      'Status'
    ]

    const csvRows = [
      headers.join(','),
      ...usageData.map((record: Record<string, unknown>) => [
        record.labName,
        record.totalOccupancy,
        record.avgOccupancy,
        record.peakOccupancy,
        record.utilizationRate,
        record.status
      ].join(','))
    ]

    const csvContent = csvRows.join('\n')

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="usage-report-${new Date().toISOString().split('T')[0]}.csv"`
      }
    })
  } catch (error) {
    console.error('Error exporting usage report:', error)
    return NextResponse.json(
      { error: 'Failed to export usage report' },
      { status: 500 }
    )
  }
}