'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  Download,
  Users,
  Monitor,
  Shield,
  AlertTriangle,
  Activity,
  Calendar,
  Filter,
  RefreshCw,
  TrendingUp
} from 'lucide-react'

interface ReportData {
  totalUsers: number
  activeLabs: number
  totalEquipment: number
  activeAlerts: number
  todayAttendance: number
  avgOccupancy: number
}

interface AttendanceReport {
  id: string
  userName: string
  labName: string
  checkInTime: string
  checkOutTime: string | null
  verificationMethod: string
  duration: string
}

interface UsageReport {
  labName: string
  totalOccupancy: number
  avgOccupancy: number
  peakOccupancy: number
  utilizationRate: number
  status: string
}

interface EquipmentReport {
  id: string
  labName: string
  type: string
  status: string
  lastDetected: string
  brand: string
  model: string
}

interface AlertReport {
  id: string
  type: string
  severity: string
  labName: string
  title: string
  message: string
  createdAt: string
  resolved: boolean
}

export default function ReportsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [selectedReport, setSelectedReport] = useState('overview')
  const [dateRange, setDateRange] = useState('7d')
  const [labFilter, setLabFilter] = useState('all')
  const [attendanceData, setAttendanceData] = useState<AttendanceReport[]>([])
  const [usageData, setUsageData] = useState<UsageReport[]>([])
  const [equipmentData, setEquipmentData] = useState<EquipmentReport[]>([])
  const [alertData, setAlertData] = useState<AlertReport[]>([])

  useEffect(() => {
    if (status === 'loading') return
    if (!session || session.user.role !== 'admin') {
      router.push('/unauthorized')
      return
    }
    fetchReportData()
  }, [session, status, router])

  const fetchReportData = async () => {
    try {
      const response = await fetch('/api/reports')
      if (response.ok) {
        const data = await response.json()
        setReportData(data)
      }
    } catch (error) {
      console.error('Failed to fetch report data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchSpecificReport = useCallback(async () => {
    try {
      let endpoint = ''
      switch (selectedReport) {
        case 'attendance':
          endpoint = '/api/reports/attendance'
          break
        case 'usage':
          endpoint = '/api/reports/usage'
          break
        case 'equipment':
          endpoint = '/api/reports/equipment'
          break
        case 'alerts':
          endpoint = '/api/reports/alerts'
          break
        default:
          return
      }

      const response = await fetch(`${endpoint}?dateRange=${dateRange}&lab=${labFilter}`)
      if (response.ok) {
        const data = await response.json()
        switch (selectedReport) {
          case 'attendance':
            setAttendanceData(data.attendance || [])
            break
          case 'usage':
            setUsageData(data.usage || [])
            break
          case 'equipment':
            setEquipmentData(data.equipment || [])
            break
          case 'alerts':
            setAlertData(data.alerts || [])
            break
        }
      }
    } catch (error) {
      console.error('Failed to fetch specific report:', error)
    }
  }, [selectedReport, dateRange, labFilter])

  useEffect(() => {
    if (session && session.user.role === 'admin') {
      fetchSpecificReport()
    }
  }, [selectedReport, dateRange, labFilter, session, fetchSpecificReport])

  const exportReport = async () => {
    try {
      let endpoint = ''
      switch (selectedReport) {
        case 'attendance':
          endpoint = '/api/reports/attendance/export'
          break
        case 'usage':
          endpoint = '/api/reports/usage/export'
          break
        case 'equipment':
          endpoint = '/api/reports/equipment/export'
          break
        case 'alerts':
          endpoint = '/api/reports/alerts/export'
          break
        default:
          return
      }

      const response = await fetch(`${endpoint}?dateRange=${dateRange}&lab=${labFilter}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${selectedReport}-report-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Failed to export report:', error)
    }
  }

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'present':
      case 'success':
        return 'bg-green-100 text-green-800'
      case 'maintenance':
      case 'warning':
        return 'bg-yellow-100 text-yellow-800'
      case 'missing':
      case 'damaged':
      case 'error':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800'
      case 'high':
        return 'bg-orange-100 text-orange-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!session || session.user.role !== 'admin') {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-1">
            Comprehensive system reports and analytics
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={fetchReportData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          {selectedReport !== 'overview' && (
            <Button onClick={exportReport}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Report Type</label>
              <Select value={selectedReport} onValueChange={setSelectedReport}>
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="overview">Overview</SelectItem>
                  <SelectItem value="attendance">Attendance Reports</SelectItem>
                  <SelectItem value="usage">Laboratory Usage</SelectItem>
                  <SelectItem value="equipment">Equipment Status</SelectItem>
                  <SelectItem value="alerts">Alert Reports</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Date Range</label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select date range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1d">Last 24 Hours</SelectItem>
                  <SelectItem value="7d">Last 7 Days</SelectItem>
                  <SelectItem value="30d">Last 30 Days</SelectItem>
                  <SelectItem value="90d">Last 90 Days</SelectItem>
                  <SelectItem value="1y">Last Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Laboratory</label>
              <Select value={labFilter} onValueChange={setLabFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select laboratory" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Laboratories</SelectItem>
                  <SelectItem value="lab1">Computer Lab 1</SelectItem>
                  <SelectItem value="lab2">Computer Lab 2</SelectItem>
                  <SelectItem value="lab3">Physics Lab</SelectItem>
                  <SelectItem value="lab4">Chemistry Lab</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overview Cards */}
      {selectedReport === 'overview' && reportData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reportData.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline h-3 w-3 mr-1" />
                Active users
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Labs</CardTitle>
              <Monitor className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reportData.activeLabs}</div>
              <p className="text-xs text-muted-foreground">
                Operational labs
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Equipment</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reportData.totalEquipment}</div>
              <p className="text-xs text-muted-foreground">
                Total items tracked
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{reportData.activeAlerts}</div>
              <p className="text-xs text-muted-foreground">
                Requires attention
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today&apos;s Attendance</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reportData.todayAttendance}</div>
              <p className="text-xs text-muted-foreground">
                Check-ins today
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Occupancy</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reportData.avgOccupancy}%</div>
              <p className="text-xs text-muted-foreground">
                Lab utilization
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Attendance Report */}
      {selectedReport === 'attendance' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Attendance Reports</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Laboratory</TableHead>
                  <TableHead>Check In</TableHead>
                  <TableHead>Check Out</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Method</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendanceData.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{record.userName}</TableCell>
                    <TableCell>{record.labName}</TableCell>
                    <TableCell>{formatDate(record.checkInTime)}</TableCell>
                    <TableCell>{record.checkOutTime ? formatDate(record.checkOutTime) : 'Active'}</TableCell>
                    <TableCell>{record.duration}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(record.verificationMethod)}>
                        {record.verificationMethod}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Usage Report */}
      {selectedReport === 'usage' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Monitor className="h-5 w-5" />
              <span>Laboratory Usage</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Laboratory</TableHead>
                  <TableHead>Total Occupancy</TableHead>
                  <TableHead>Average Occupancy</TableHead>
                  <TableHead>Peak Occupancy</TableHead>
                  <TableHead>Utilization Rate</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usageData.map((record) => (
                  <TableRow key={record.labName}>
                    <TableCell className="font-medium">{record.labName}</TableCell>
                    <TableCell>{record.totalOccupancy}</TableCell>
                    <TableCell>{record.avgOccupancy}</TableCell>
                    <TableCell>{record.peakOccupancy}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${record.utilizationRate}%` }}
                          ></div>
                        </div>
                        <span className="text-sm">{record.utilizationRate}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(record.status)}>
                        {record.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Equipment Report */}
      {selectedReport === 'equipment' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Equipment Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Laboratory</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Brand</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Detected</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {equipmentData.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{record.labName}</TableCell>
                    <TableCell>{record.type}</TableCell>
                    <TableCell>{record.brand}</TableCell>
                    <TableCell>{record.model}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(record.status)}>
                        {record.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(record.lastDetected)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Alert Report */}
      {selectedReport === 'alerts' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5" />
              <span>Alert Reports</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Laboratory</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alertData.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{record.type}</TableCell>
                    <TableCell>
                      <Badge className={getSeverityColor(record.severity)}>
                        {record.severity}
                      </Badge>
                    </TableCell>
                    <TableCell>{record.labName}</TableCell>
                    <TableCell>{record.title}</TableCell>
                    <TableCell className="max-w-xs truncate">{record.message}</TableCell>
                    <TableCell>{formatDate(record.createdAt)}</TableCell>
                    <TableCell>
                      <Badge className={record.resolved ? getStatusColor('success') : getStatusColor('warning')}>
                        {record.resolved ? 'Resolved' : 'Active'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}