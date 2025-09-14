'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Calendar,
  Clock,
  MapPin,
  Fingerprint,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  LogOut,
  LogIn,
  Users
} from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'

interface AttendanceRecord {
  id: string
  userId: string
  labId: string
  checkInTime: number
  checkOutTime?: number
  verificationMethod: string
  biometricData?: string
  ipAddress?: string
  notes?: string
  createdAt: number
  userName?: string
  userEmail?: string
  labName?: string
}

interface Schedule {
  id: string
  labId: string
  userId: string
  dayOfWeek?: number
  startTime: string
  endTime: string
  courseCode?: string
  section?: string
  subject?: string
  isRecurring: boolean
  startDate?: number
  endDate?: number
  labName?: string
}

interface Laboratory {
  id: string
  name: string
  building: string
  roomNumber: string
  capacity: number
  status: string
}

export default function FacultyAttendancePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [laboratories, setLaboratories] = useState<Laboratory[]>([])
  const [activeSession, setActiveSession] = useState<AttendanceRecord | null>(null)
  const [selectedLab, setSelectedLab] = useState<string>('')
  const [isScanning, setIsScanning] = useState(false)
  const [scanResult, setScanResult] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    if (status === 'loading') return
    if (!session || session.user.role !== 'faculty') {
      router.push('/unauthorized')
      return
    }
    fetchData()
  }, [session, status, router])

  useEffect(() => {
    if (session && session.user.role === 'faculty') {
      fetchActiveSession()
      fetchSchedules()
    }
  }, [session])

  const fetchData = async () => {
    try {
      const [labsRes] = await Promise.all([
        fetch('/api/laboratories')
      ])

      if (labsRes.ok) {
        const labsData = await labsRes.json()
        setLaboratories(labsData)
        if (labsData.length > 0) {
          setSelectedLab(labsData[0].id)
        }
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch data',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchActiveSession = async () => {
    if (!session) return
    
    try {
      const response = await fetch(`/api/attendance?userId=${session.user.id}&active=true`)
      if (response.ok) {
        const activeSessions = await response.json()
        setActiveSession(activeSessions.length > 0 ? activeSessions[0] : null)
      }
    } catch (error) {
      console.error('Error fetching active session:', error)
    }
  }

  const fetchSchedules = async () => {
    if (!session) return
    
    try {
      const now = new Date()
      const currentDay = now.getDay()
      const currentTime = now.toTimeString().slice(0, 5)
      
      const response = await fetch(`/api/schedules?userId=${session.user.id}&upcoming=true`)
      if (response.ok) {
        const schedulesData = await response.json()
        setSchedules(schedulesData)
      }
    } catch (error) {
      console.error('Error fetching schedules:', error)
    }
  }

  const fetchAttendanceHistory = async () => {
    if (!session || !selectedLab) return
    
    try {
      const response = await fetch(`/api/attendance?userId=${session.user.id}&labId=${selectedLab}`)
      if (response.ok) {
        const attendanceData = await response.json()
        setAttendanceRecords(attendanceData)
      }
    } catch (error) {
      console.error('Error fetching attendance history:', error)
    }
  }

  useEffect(() => {
    if (selectedLab) {
      fetchAttendanceHistory()
    }
  }, [selectedLab])

  const simulateBiometricScan = async () => {
    if (!session || !selectedLab) {
      toast({
        title: 'Error',
        description: 'Please select a laboratory',
        variant: 'destructive'
      })
      return
    }

    setIsScanning(true)
    setScanResult(null)
    
    // Simulate scanning delay
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Use the faculty member's biometric ID if available, or generate a mock one
    const biometricId = session.user.biometricId || `BIO${Math.floor(Math.random() * 999 + 1).toString().padStart(3, '0')}`
    setScanResult(biometricId)
    setIsScanning(false)
    
    // Record attendance
    await recordAttendance(biometricId)
  }

  const recordAttendance = async (biometricId: string) => {
    try {
      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          biometricId,
          labId: selectedLab,
          verificationMethod: 'biometric'
        }),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        if (result.action === 'check_in') {
          setActiveSession(result.attendance)
          toast({
            title: 'Check-in Successful',
            description: `Checked in to ${result.schedule.labName} for ${result.schedule.subject || 'class'}`,
          })
        } else {
          setActiveSession(null)
          toast({
            title: 'Check-out Successful',
            description: `Checked out from ${result.schedule.labName}`,
          })
        }
        
        // Refresh data
        fetchActiveSession()
        fetchAttendanceHistory()
      } else {
        toast({
          title: 'Attendance Failed',
          description: result.error || 'Failed to record attendance',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to record attendance',
        variant: 'destructive'
      })
    }
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString()
  }

  const formatTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const getBiometricStatus = () => {
    if (session?.user.biometricId) {
      return (
        <div className="flex items-center space-x-2">
          <Fingerprint className="h-4 w-4 text-green-600" />
          <span className="text-sm text-green-600">Biometric Registered</span>
        </div>
      )
    }
    return (
      <div className="flex items-center space-x-2">
        <Fingerprint className="h-4 w-4 text-red-600" />
        <span className="text-sm text-red-600">Biometric Not Registered</span>
      </div>
    )
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!session || session.user.role !== 'faculty') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Attendance Recording</h1>
              <p className="text-sm text-gray-600">Record your attendance using biometric authentication</p>
            </div>
            <div className="flex items-center space-x-4">
              {getBiometricStatus()}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Biometric Status Alert */}
        {!session.user.biometricId && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <div>
                  <h3 className="text-sm font-medium text-red-800">Biometric Registration Required</h3>
                  <p className="text-sm text-red-700">
                    You need to register your biometric data before you can record attendance.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Active Session Status */}
        {activeSession && (
          <Card className="mb-6 border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <h3 className="text-sm font-medium text-green-800">Active Session</h3>
                    <p className="text-sm text-green-700">
                      Checked in to {activeSession.labName} at {formatTime(activeSession.checkInTime)}
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={() => simulateBiometricScan()}
                  disabled={isScanning}
                  variant="outline"
                >
                  {isScanning ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Scanning...
                    </>
                  ) : (
                    <>
                      <LogOut className="mr-2 h-4 w-4" />
                      Check Out
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Biometric Scanner */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Fingerprint className="h-5 w-5 text-blue-600" />
                <span>Biometric Scanner</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Laboratory Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Laboratory</label>
                <Select value={selectedLab} onValueChange={setSelectedLab}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select laboratory" />
                  </SelectTrigger>
                  <SelectContent>
                    {laboratories.map(lab => (
                      <SelectItem key={lab.id} value={lab.id}>
                        {lab.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Scanner Interface */}
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center">
                    <Fingerprint className={`h-16 w-16 text-blue-600 ${isScanning ? 'animate-pulse' : ''}`} />
                  </div>
                  {isScanning && (
                    <div className="absolute -inset-4 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  )}
                </div>
                
                <p className="text-center text-sm text-gray-600">
                  {isScanning ? 'Scanning fingerprint...' : 'Place your finger on scanner'}
                </p>
                
                <Button 
                  onClick={simulateBiometricScan} 
                  disabled={isScanning || !selectedLab || !session.user.biometricId}
                  className="w-full"
                >
                  {isScanning ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Scanning...
                    </>
                  ) : (
                    <>
                      <Fingerprint className="mr-2 h-4 w-4" />
                      {activeSession ? 'Check Out' : 'Check In'}
                    </>
                  )}
                </Button>
              </div>

              {/* Scan Result */}
              {scanResult && (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-600">Scan Successful</span>
                  </div>
                  
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-1">Biometric ID:</p>
                      <p className="font-mono text-lg font-bold text-green-800">{scanResult}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Today's Schedule */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <span>Today's Schedule</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {schedules.length > 0 ? (
                  <div className="space-y-3">
                    {schedules.map((schedule) => (
                      <div key={schedule.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium">{schedule.subject || 'Class'}</div>
                          <div className="text-sm text-gray-600">
                            {schedule.courseCode && `${schedule.courseCode} • `}
                            {schedule.section && `Section ${schedule.section} • `}
                            {schedule.labName}
                          </div>
                          <div className="text-sm text-blue-600">
                            {schedule.startTime} - {schedule.endTime}
                          </div>
                        </div>
                        <Badge className="bg-blue-100 text-blue-800">
                          Scheduled
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No classes scheduled</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      You have no scheduled classes for the remaining time today.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Attendance History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <span>Attendance History</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Filter by laboratory:</span>
                    <Select value={selectedLab} onValueChange={setSelectedLab}>
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {laboratories.map(lab => (
                          <SelectItem key={lab.id} value={lab.id}>{lab.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Laboratory</TableHead>
                          <TableHead>Check In</TableHead>
                          <TableHead>Check Out</TableHead>
                          <TableHead>Duration</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {attendanceRecords.map((record) => {
                          const duration = record.checkOutTime 
                            ? record.checkOutTime - record.checkInTime 
                            : null
                          
                          return (
                            <TableRow key={record.id}>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  <MapPin className="h-4 w-4 text-muted-foreground" />
                                  <span>{record.labName}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm">
                                  <div>{formatDate(record.checkInTime)}</div>
                                  <div className="text-muted-foreground">{formatTime(record.checkInTime)}</div>
                                </div>
                              </TableCell>
                              <TableCell>
                                {record.checkOutTime ? (
                                  <div className="text-sm">
                                    <div>{formatDate(record.checkOutTime)}</div>
                                    <div className="text-muted-foreground">{formatTime(record.checkOutTime)}</div>
                                  </div>
                                ) : (
                                  <Badge variant="secondary">Active</Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                {duration ? (
                                  <span className="text-sm">
                                    {Math.floor(duration / 3600)}h {Math.floor((duration % 3600) / 60)}m
                                  </span>
                                ) : (
                                  <span className="text-sm text-muted-foreground">-</span>
                                )}
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>

                  {attendanceRecords.length === 0 && (
                    <div className="text-center py-8">
                      <Clock className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No attendance records</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        No attendance records found for selected laboratory.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}