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
  CheckCircle,
  ArrowLeft
} from 'lucide-react'
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

export default function LaboratorySchedulesPage() {
  const router = useRouter()
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [laboratories, setLaboratories] = useState<Laboratory[]>([])
  const [selectedLab, setSelectedLab] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (selectedLab) {
      fetchSchedules()
    }
  }, [selectedLab])

  const fetchData = async () => {
    try {
      const labsRes = await fetch('/api/laboratories')
      if (labsRes.ok) {
        const labsData = await labsRes.json()
        setLaboratories(labsData)
        if (labsData.length > 0) {
          setSelectedLab(labsData[0].id)
        }
      }
    } catch (error) {
      console.error('Error fetching laboratories:', error)
    }
  }

  const fetchSchedules = async () => {
    if (!selectedLab) return
    
    setIsLoading(true)
    try {
      const response = await fetch(`/api/schedules?labId=${selectedLab}`)
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
          <Fingerprint className="h-3 w-3 text-green-600" />
          <span className="text-xs text-green-600">Registered</span>
        </div>
      )
    }
    return (
      <div className="flex items-center space-x-1">
        <Fingerprint className="h-3 w-3 text-red-600" />
        <span className="text-xs text-red-600">Not Registered</span>
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

  const getSelectedLab = () => {
    return laboratories.find(lab => lab.id === selectedLab)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Laboratory Schedules</h1>
            <p className="text-gray-600 mt-1">View schedules for specific laboratories</p>
          </div>
        </div>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500">Loading schedules...</p>
        </div>
      </div>
    )
  }

  const selectedLabData = getSelectedLab()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => router.push('/admin')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Admin
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Laboratory Schedules</h1>
            <p className="text-gray-600 mt-1">View schedules for specific laboratories</p>
          </div>
        </div>
      </div>

      {/* Laboratory Selector */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Select Laboratory:</span>
            </div>
            <Select value={selectedLab} onValueChange={setSelectedLab}>
              <SelectTrigger className="w-96">
                <SelectValue placeholder="Select laboratory" />
              </SelectTrigger>
              <SelectContent>
                {laboratories.map(lab => (
                  <SelectItem key={lab.id} value={lab.id}>
                    {lab.name} ({lab.building} {lab.roomNumber})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {selectedLabData && (
        <>
          {/* Laboratory Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-blue-600" />
                <span>{selectedLabData.name}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium">{selectedLabData.building} {selectedLabData.roomNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Capacity</p>
                  <p className="font-medium">{selectedLabData.capacity} students</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge className={selectedLabData.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                    {selectedLabData.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Schedule Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Schedules</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{schedules.length}</div>
                <p className="text-xs text-muted-foreground">
                  Scheduled classes
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
                <CardTitle className="text-sm font-medium">Teachers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {new Set(schedules.map(s => s.userId)).size}
                </div>
                <p className="text-xs text-muted-foreground">
                  Different teachers
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Schedules Table */}
          <Card>
            <CardHeader>
              <CardTitle>Class Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Teacher</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Schedule</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Biometric</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {schedules.map((schedule) => {
                      const scheduleStatus = getScheduleStatus(schedule)
                      return (
                        <TableRow key={schedule.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{schedule.userName}</div>
                              <div className="text-sm text-muted-foreground">{schedule.userEmail}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {schedule.courseCode && (
                                <div className="font-medium">{schedule.courseCode}</div>
                              )}
                              {schedule.section && (
                                <div className="text-muted-foreground">Section {schedule.section}</div>
                              )}
                              {schedule.subject && (
                                <div className="text-muted-foreground">{schedule.subject}</div>
                              )}
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
                          <TableCell>
                            {getBiometricStatus(schedule.userBiometricId)}
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
                    This laboratory has no scheduled classes.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}