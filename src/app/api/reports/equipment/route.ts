import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { equipment, laboratories } from '@/lib/db/schema'
import { sql, desc } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const dateRange = searchParams.get('dateRange') || '7d'
    const labFilter = searchParams.get('lab') || 'all'

    // Calculate date range for filtering (though equipment status is current, not time-based)
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
    let whereConditions = sql`1=1` // Always true base condition
    
    if (labFilter !== 'all') {
      whereConditions = sql`${equipment.labId} = ${labFilter}`
    }

    // Fetch equipment data with laboratory information
    const equipmentData = await db
      .select({
        id: equipment.id,
        labName: laboratories.name,
        type: equipment.type,
        status: equipment.status,
        lastDetected: equipment.lastDetected,
        brand: equipment.brand,
        model: equipment.model,
        serialNumber: equipment.serialNumber,
        assignedStation: equipment.assignedStation,
      })
      .from(equipment)
      .leftJoin(laboratories, sql`${equipment.labId} = ${laboratories.id}`)
      .where(whereConditions)
      .orderBy(desc(equipment.lastDetected))
      .limit(1000)

    // Process the data to handle null values and format dates
    const processedEquipment = equipmentData.map((record) => ({
      ...record,
      labName: record.labName || 'Unknown',
      brand: record.brand || 'Unknown',
      model: record.model || 'Unknown',
      lastDetected: record.lastDetected ? new Date(record.lastDetected).toISOString() : new Date().toISOString(),
    }))

    return NextResponse.json({ equipment: processedEquipment })
  } catch (error) {
    console.error('Error fetching equipment report:', error)
    return NextResponse.json(
      { error: 'Failed to fetch equipment report' },
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
    const equipmentData = data.equipment

    // Generate CSV content
    const headers = [
      'Laboratory',
      'Type',
      'Brand',
      'Model',
      'Serial Number',
      'Status',
      'Assigned Station',
      'Last Detected'
    ]

    const csvRows = [
      headers.join(','),
      ...equipmentData.map((record: Record<string, unknown>) => [
        record.labName,
        record.type,
        record.brand,
        record.model,
        record.serialNumber || '',
        record.status,
        record.assignedStation || '',
        new Date(record.lastDetected).toLocaleString()
      ].join(','))
    ]

    const csvContent = csvRows.join('\n')

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="equipment-report-${new Date().toISOString().split('T')[0]}.csv"`
      }
    })
  } catch (error) {
    console.error('Error exporting equipment report:', error)
    return NextResponse.json(
      { error: 'Failed to export equipment report' },
      { status: 500 }
    )
  }
}