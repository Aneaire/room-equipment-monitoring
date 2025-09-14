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
  Calendar,
  Clock,
  MapPin,
  Users,
  BookOpen,
  Fingerprint,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

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
  createdAt: number
  updatedAt: number
  userName?: string
  userEmail?: string
  labName?: string
  userBiometricId?: string
}

interface Laboratory {
  id: string
  name: string
  building: string
  roomNumber: string
  capacity: number
  status: string
}

export default function FacultySchedulesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [laboratories, setLaboratories] = useState<Laboratory[]>([])
  const [selectedLab, setSelectedLab] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(true)

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
      fetchSchedules()
    }
  }, [selectedLab, session])

  const fetchData = async () => {
    try {
      const labsRes = await fetch('/api/laboratories')
      if (labsRes.ok) {
        const labsData = await labsRes.json()
        setLaboratories(labsData)
      }
    } catch (error) {
      console.error('Error fetching laboratories:', error)
    }
  }

  const fetchSchedules = async () => {
    if (!session) return
    
    setIsLoading(true)
    try {
      const url = selectedLab === 'all' 
        ? `/api/schedules?userId=${session.user.id}`
        : `/api/schedules?userId=${session.user.id}&labId=${selectedLab}`
      
      const response = await fetch(url)
      if (response.ok) {
        const schedulesData = await response.json()
        setSchedules(schedulesData)
      }
    } catch (error) {
      console.error('Error fetching schedules:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getDayName = (dayOfWeek?: number) => {
    if (!dayOfWeek && dayOfWeek !== 0) return ''
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    return days[dayOfWeek]
  }

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return ''
    return new Date(timestamp * 1000).toLocaleDateString()
  }

  const getBiometricStatus = (biometricId?: string) => {
    if (biometricId) {
      return (
        <div className="flex items-center space-x-1">
          <Fingerprint className="h-4 w-4 text-green-600" />
          <span className="text-sm text-green-600">Registered</span>
        </div>
      )
    }
    return (
      <div className="flex items-center space-x-1">
        <Fingerprint className="h-4 w-4 text-red-600" />
        <span className="text-sm text-red-600">Not Registered</span>
      </div>
    )
  }

  const getScheduleStatus = (schedule: Schedule) => {
    const now = new Date()
    const currentDay = now.getDay()
    const currentTime = now.toTimeString().slice(0, 5)
    
    if (schedule.isRecurring) {
      if (schedule.dayOfWeek === currentDay) {
        if (currentTime >= schedule.startTime && currentTime <= schedule.endTime) {
          return { status: 'active', label: 'In Progress', color: 'bg-green-100 text-green-800' }
        } else if (currentTime < schedule.startTime) {
          return { status: 'upcoming', label: 'Today', color: 'bg-blue-100 text-blue-800' }
        }
      }
      return { status: 'scheduled', label: 'Scheduled', color: 'bg-gray-100 text-gray-800' }
    } else {
      if (schedule.startDate) {
        const scheduleDate = new Date(schedule.startDate * 1000)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        scheduleDate.setHours(0, 0, 0, 0)
        
        if (scheduleDate.getTime() === today.getTime()) {
          if (currentTime >= schedule.startTime && currentTime <= schedule.endTime) {
            return { status: 'active', label: 'In Progress', color: 'bg-green-100 text-green-800' }
          } else if (currentTime < schedule.startTime) {
            return { status: 'upcoming', label: 'Today', color: 'bg-blue-100 text-blue-800' }
          }
        } else if (scheduleDate > today) {
          return { status: 'upcoming', label: 'Upcoming', color: 'bg-blue-100 text-blue-800' }
        }
      }
      return { status: 'completed', label: 'Completed', color: 'bg-gray-100 text-gray-800' }
    }
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

  const userBiometricStatus = getBiometricStatus(session.user.biometricId)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Schedules</h1>
              <p className="text-sm text-gray-600">View and manage your teaching schedules</p>
            </div>
            <div className="flex items-center space-x-4">
              {userBiometricStatus}
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
                    You need to register your biometric data before you can record attendance for your scheduled classes.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filter */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Filter by Laboratory:</span>
              </div>
              <Select value={selectedLab} onValueChange={setSelectedLab}>
                <SelectTrigger className="w-64">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Laboratories</SelectItem>
                  {laboratories.map(lab => (
                    <SelectItem key={lab.id} value={lab.id}>{lab.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Schedule Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Schedules</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{schedules.length}</div>
              <p className="text-xs text-muted-foreground">
                Assigned classes
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Now</CardTitle>
              <Clock className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {schedules.filter(s => getScheduleStatus(s).status === 'active').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Currently in session
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today</CardTitle>
              <Calendar className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {schedules.filter(s => getScheduleStatus(s).status === 'upcoming' || getScheduleStatus(s).status === 'active').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Scheduled for today
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Laboratories</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Set(schedules.map(s => s.labId)).size}
              </div>
              <p className="text-xs text-muted-foreground">
                Different labs
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Schedules Table */}
        <Card>
          <CardHeader>
            <CardTitle>My Teaching Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course</TableHead>
                    <TableHead>Laboratory</TableHead>
                    <TableHead>Schedule</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schedules.map((schedule) => {
                    const scheduleStatus = getScheduleStatus(schedule)
                    return (
                      <TableRow key={schedule.id}>
                        <TableCell>
                          <div>
                            {schedule.courseCode && (
                              <div className="font-medium">{schedule.courseCode}</div>
                            )}
                            {schedule.section && (
                              <div className="text-sm text-muted-foreground">Section {schedule.section}</div>
                            )}
                            {schedule.subject && (
                              <div className="text-sm text-muted-foreground">{schedule.subject}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>{schedule.labName}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {schedule.isRecurring ? (
                              <div className="flex items-center space-x-2">
                                <Badge variant="secondary">
                                  {getDayName(schedule.dayOfWeek)}
                                </Badge>
                                <span className="text-sm">{schedule.startTime} - {schedule.endTime}</span>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-2">
                                <Badge variant="outline">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  One-time
                                </Badge>
                                <div className="text-sm">
                                  <div>{formatDate(schedule.startDate)}</div>
                                  <div>{schedule.startTime} - {schedule.endTime}</div>
                                </div>
                              </div>
                            )}
                            {schedule.endDate && schedule.isRecurring && (
                              <div className="text-xs text-muted-foreground">
                                Until {formatDate(schedule.endDate)}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={scheduleStatus.color}>
                            {scheduleStatus.label}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>

            {schedules.length === 0 && (
              <div className="text-center py-8">
                <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No schedules found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {selectedLab === 'all' 
                    ? 'You have no scheduled classes yet.' 
                    : 'No schedules found for the selected laboratory.'
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}